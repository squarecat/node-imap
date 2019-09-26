import { doBespokeUnsubscribe, doUnsubscribeActions } from './actions';

import config from 'getconfig';
import { exec } from 'child_process';
import { goToPage } from './navigate';
import io from '@pm2/io';
import { isBespoke } from './checks';
import logger from '../../../utils/logger';
import puppeteer from 'puppeteer';
import { takeScreenshot } from './utils';

const Sentry = require('@sentry/node');

const currentTabsOpen = io.counter({
  name: 'Current Tabs Open'
});
let tabsOpen = 0;
let lastTouched = 0;

const isDebug = process.env.BROWSER_DEBUG;
let puppeteerConfig;
if (isDebug) {
  puppeteerConfig = {
    // dumpio: true,
    devtools: true,
    // headless: false,
    ignoreHTTPSErrors: true,
    slowMo: true
  };
} else {
  puppeteerConfig = config.puppeteer;
}

let puppeteerInstance;

export async function unsubscribeWithLink(unsubUrl) {
  try {
    return unsubscribe(unsubUrl);
  } catch (err) {
    logger.info('browser: critical issue with browser');
    Sentry.withScope(function(scope) {
      scope.setTag('tabs-open', tabsOpen);
      scope.setLevel('error');
      Sentry.captureException(err);
    });
    return { estimatedSuccess: false, err, image: null };
  }
}

async function unsubscribe(unsubUrl) {
  let image;
  let page;
  try {
    lastTouched = Date.now();
    currentTabsOpen.inc();
    tabsOpen = tabsOpen + 1;
    page = await getNewPage();
    logger.info('browser: opened new tab');
    await goToPage(page, unsubUrl);
    image = await takeScreenshot(page);
    lastTouched = Date.now();
    let isSuccessful;
    if (isBespoke(unsubUrl)) {
      isSuccessful = await doBespokeUnsubscribe(page, unsubUrl);
    } else {
      isSuccessful = await doUnsubscribeActions(page);
    }
    image = await takeScreenshot(page);
    return { estimatedSuccess: isSuccessful, image };
  } catch (err) {
    logger.error('browser: error opening page or searching for content');
    logger.error(`${err.name}: ${err.message}`);
    lastTouched = Date.now();
    try {
      logger.info('browser: taking screenshot');
      // try one more time to take a screenshot
      image = await takeScreenshot(page);
      logger.info('browser: taken screenshot');
    } catch (e) {
      logger.error(e);
      // it failed
    }
    return { estimatedSuccess: false, err, image };
  } finally {
    logger.info('browser: clearing memory');
    if (page) {
      // clear tab memory
      await page.goto('about:blank');
      await page.close();
      logger.info('browser: closed page');
    }
    lastTouched = Date.now();
    currentTabsOpen.dec();
    tabsOpen = tabsOpen - 1;
    await closeInstance();
  }
}

setInterval(() => {
  // when there is a free minute with no activity, check if
  // we have any zombie processes and kill them
  // make sure this number is higher than the navigation timeout
  // by a significant margin
  const inactiveFor = Date.now() - lastTouched;
  const isInactive = inactiveFor > 60000;
  if (isInactive && tabsOpen > 0) {
    const pid = puppeteerInstance.process().pid;
    exec(`kill -9 ${pid}`, error => {
      if (error) {
        logger.error(`browser: failed killing zombie process with ${tabsOpen}`);
      }
      currentTabsOpen.dec(tabsOpen);
      tabsOpen = 0;
      logger.info(`browser: killed zombie process with ${tabsOpen}`);
      if (process.env.NODE_ENV !== 'development') {
        const err =
          error ||
          new Error(
            `Browser became unresponsive and ${tabsOpen} were forcibly killed `
          );
        Sentry.withScope(function(scope) {
          scope.setTag('tabs-open', tabsOpen);
          scope.setLevel('error');
          Sentry.captureException(err);
        });
      }
    });
  }
}, 5000);

async function getNewPage() {
  const browser = await getPuppeteerInstance();
  const page = await browser.newPage();
  // sometimes the page is fetched while the
  // browser is shutting down, so it will be
  // null. Since we can't mess about checking
  // if it's happening, just get a new page
  // if that happens
  if (!page) {
    return getNewPage();
  }
  return page;
}

async function getPuppeteerInstance() {
  if (puppeteerInstance) {
    return puppeteerInstance;
  }
  puppeteerInstance = await puppeteer.launch(puppeteerConfig);
  logger.info('browser: launched new browser');
  return puppeteerInstance;
}

async function closeInstance() {
  if (!puppeteerInstance) return;
  try {
    const pageCount = (await puppeteerInstance.pages()).length;
    // theres always a blank page to start with
    if (pageCount === 1) {
      logger.info('browser: no pages open, closing browser');
      await puppeteerInstance.close();
      puppeteerInstance = null;
    } else {
      logger.info(`browser: ${pageCount} pages still open`);
    }
  } catch (err) {
    logger.error('browser: error closing instance');
    logger.error(err);
  }
}

io.action('browser: force-close', async cb => {
  try {
    if (puppeteerInstance) {
      await puppeteerInstance.close();
      puppeteerInstance = null;
      cb({ success: true });
    }
  } catch (err) {
    cb({ success: false });
  }
});

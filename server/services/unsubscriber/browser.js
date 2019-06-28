import config from 'getconfig';
import io from '@pm2/io';
import logger from '../../utils/logger';
import puppeteer from 'puppeteer';

const currentTabsOpen = io.counter({
  name: 'Current Tabs Open'
});

const isDebug = process.env.BROWSER_DEBUG;
let puppeteerConfig;
if (isDebug) {
  puppeteerConfig = {
    dumpio: true,
    devtools: true,
    headless: false,
    ignoreHTTPSErrors: true,
    slowMo: true
  };
} else {
  puppeteerConfig = config.puppeteer;
}
// get lowercase, uppercase and capitalized versions of all keywords too
const unsubSuccessKeywords = config.unsubscribeKeywords.reduce(
  (words, keyword) => [...words, keyword, keyword.toLowerCase()],
  []
);
const confirmButtonKeywords = ['confirm', 'unsubscribe'];

let puppeteerInstance;

export async function unsubscribeWithLink(unsubUrl) {
  const browser = await getPuppeteerInstance();
  let image;
  let page;
  try {
    page = await browser.newPage();
    logger.info('browser: opened new tab');
    currentTabsOpen.inc();
    await goToPage(page, unsubUrl);
    image = await page.screenshot({
      encoding: 'base64'
    });
    let hasSuccessKeywords = await hasKeywords(page, unsubSuccessKeywords);
    if (!hasSuccessKeywords) {
      // find button to press
      const links = await page.$$('a, input[type=submit], button');
      logger.info(`browser: links ${links.length}`);
      const $confirmLink = await links.reduce(async (promise, link) => {
        const [value, text] = await Promise.all([
          (await link.getProperty('value')).jsonValue(),
          (await link.getProperty('innerText')).jsonValue()
        ]);
        const hasButtonKeyword = confirmButtonKeywords.some(keyword =>
          `${value} ${text}`.toLowerCase().includes(keyword)
        );
        if (hasButtonKeyword) {
          logger.info('browser: found text in btn');
          return link;
        }
        return promise;
      }, Promise.resolve());
      if ($confirmLink) {
        logger.info('browser: clicking and waiting');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          $confirmLink.click()
        ]);
        logger.info('browser: clicked button');
        hasSuccessKeywords = await hasKeywords(page, unsubSuccessKeywords);
      }
    }
    image = await page.screenshot({
      encoding: 'binary',
      type: 'png'
    });
    return { estimatedSuccess: hasSuccessKeywords, image };
  } catch (err) {
    logger.error('browser: error opening page or searching for content');
    logger.error(`${err.name}: ${err.message}`);
    // try one more time to take a screenshot
    try {
      image = await page.screenshot({
        encoding: 'binary',
        type: 'png'
      });
    } catch (e) {
      // it failed
    }
    return { estimatedSuccess: false, err, image };
  } finally {
    // clear tab memory
    logger.info('browser: clearing memory');
    await page.goto('about:blank');
    currentTabsOpen.dec();
    await page.close();
    await closeInstance();
  }
}

async function goToPage(page, url) {
  return new Promise(async (resolve, reject) => {
    const responseHandler = async response => {
      if (response.url() !== url) {
        return;
      }
      const status = response.status();
      // [301, 302, 303, 307, 308]
      logger.info(`browser: got status code ${status}`);
      if (status >= 300 && status <= 399) {
        try {
          // wait for the rediect to happen
          await page.waitForNavigation({
            timeout: 10000,
            waitUntil: 'networkidle2'
          });
          resolve();
        } catch (e) {
          reject(e);
        }
      } else {
        // no redirect so we're done
        resolve();
      }
    };
    page.on('response', responseHandler);

    try {
      // goto page
      await page.goto(url, {
        timeout: 10000,
        waitUntil: 'networkidle2'
      });
      resolve();
    } catch (e) {
      reject(e);
    }
    page.removeListener('response', responseHandler);
  });
}

async function hasKeywords(page, keywords) {
  logger.info('browser: checking for keywords');
  const bodyText = await page.evaluate(() =>
    document.body.innerText.toLowerCase()
  );
  logger.info('browser: got page text');
  return keywords.some(word => {
    return bodyText.includes(word);
  });
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

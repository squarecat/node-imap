import config from 'getconfig';
import { doUnsubscribeActions } from './actions';
import { goToPage } from './navigate';
import io from '@pm2/io';
import logger from '../../../utils/logger';
import puppeteer from 'puppeteer';

const currentTabsOpen = io.counter({
  name: 'Current Tabs Open'
});

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
  let image;
  let page;
  try {
    page = await getNewPage();
    logger.info('browser: opened new tab');
    currentTabsOpen.inc();
    await goToPage(page, unsubUrl);
    image = await takeScreenshot(page);
    const isSuccessful = await doUnsubscribeActions(page);
    image = await takeScreenshot(page);
    return { estimatedSuccess: isSuccessful, image };
  } catch (err) {
    logger.error('browser: error opening page or searching for content');
    logger.error(`${err.name}: ${err.message}`);
    try {
      // try one more time to take a screenshot
      image = await takeScreenshot(page);
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

// async function goToPage(page, url) {
//   logger.info(`browser: going to ${url}`);
//   return new Promise(async (resolve, reject) => {
//     let reqDone = false;
//     let handlerDone = false;
//     const responseHandler = async response => {
//       // some other request, like javascript and that.
//       if (response.url() !== url) {
//         return;
//       }
//       const status = response.status();
//       // check for page redirects [301, 302, 303, 307, 308]
//       logger.info(`browser: got status code ${status}`);
//       if (status >= 300 && status <= 399) {
//         const redirectUrl = response.headers().location;
//         logger.info(`browser: redirecting to ${redirectUrl}`);
//         logger.info(`browser: waiting for redirect`);
//         try {
//           // wait for the rediect to happen
//           await goToPage(page, redirectUrl);
//           logger.info(`browser: redirect finished`);
//           if (reqDone) {
//             logger.info(`browser: resolve redirect`);
//             resolve();
//           }
//         } catch (e) {
//           handlerDone = true;
//           if (reqDone) {
//             logger.info(`browser: reject redirect`);
//             reject(e);
//           }
//         }
//       } else {
//         logger.info(`browser: no redirect`);
//         // no redirect so we're done
//         if (reqDone) {
//           logger.info(`browser: resolve no redirect`);
//           resolve();
//         }
//       }
//       handlerDone = true;
//     };

//     try {
//       page.on('response', responseHandler);
//       // goto page
//       logger.info(`browser: going to page`);
//       await page.goto(url, {
//         timeout: 20000,
//         waitUntil: 'domcontentloaded'
//       });
//       page.removeListener('response', responseHandler);
//       reqDone = true;
//       if (handlerDone) {
//         logger.info(`browser: resolve page done`);
//         resolve();
//       }
//     } catch (e) {
//       reqDone = true;
//       logger.info(e);
//       logger.info(`browser: going to page failed`);
//       if (handlerDone) {
//         logger.info(`browser: reject page done`);
//         reject(e);
//       }
//     }
//   });
// }

// async function redirect(page) {
//   let redirectUrl;
//   const responseHandler = async response => {
//     // some other request, like javascript and that.
//     if (response.url() !== url) {
//       return;
//     }
//     const status = response.status();
//     // check for page redirects [301, 302, 303, 307, 308]
//     logger.info(`browser: got status code ${status}`);
//     if (status >= 300 && status <= 399) {
//       logger.info(`browser: waiting for redirect`);
//       try {
//         // wait for the rediect to happen
//         await page.waitForNavigation({
//           timeout: 20000,
//           waitUntil: 'networkidle0'
//         });
//         logger.info(`browser: redirect finished`);
//         if (reqDone) {
//           logger.info(`browser: resolve redirect`);
//           resolve();
//         }
//       } catch (e) {
//         handlerDone = true;
//         if (reqDone) {
//           logger.info(`browser: reject redirect`);
//           reject(e);
//         }
//       }
//     } else {
//       logger.info(`browser: no redirect`);
//       // no redirect so we're done
//       if (reqDone) {
//         logger.info(`browser: resolve no redirect`);
//         resolve();
//       }
//     }
//     handlerDone = true;
//     logger.info(`browser: removing listener`);
//     // remove the listener in case we reuse this page
//     page.removeListener('response', responseHandler);
//   };
//   try {
//     page.on('response', responseHandler);
//     // goto page
//     logger.info(`browser: being redirected`);
//     await page.waitForNavigation({
//       timeout: 20000,
//       waitUntil: 'networkidle0'
//     });
//     reqDone = true;
//     if (handlerDone) {
//       logger.info(`browser: resolve page done`);
//       resolve();
//     }
//   } catch (e) {
//     reqDone = true;
//     logger.info(e);
//     logger.info(`browser: going to page failed`);
//     if (handlerDone) {
//       logger.info(`browser: reject page done`);
//       reject(e);
//     }
//   }
// }

function takeScreenshot(page) {
  return page.screenshot({
    encoding: 'binary',
    type: 'png'
  });
}
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

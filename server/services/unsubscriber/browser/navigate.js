import { checkForMetaRedirect, checkPageIsStable } from './checks';

import logger from '../../../utils/logger';
import monkeyPatches from './patches';

// wait 5 max seconds for page to be stable
const stabilityTimeout = 5000;

export async function goToPage(page, url) {
  try {
    await page.evaluateOnNewDocument(monkeyPatches);
    await page.goto(url, {
      timeout: 20000,
      waitUntil: 'networkidle0'
    });
    const hasMetaRedirect = await checkForMetaRedirect(page);
    if (hasMetaRedirect) {
      const { url: redirectUrl } = hasMetaRedirect;
      await goToPage(page, redirectUrl);
    }
    try {
      await waitForPageToBeStable(page);
    } catch (err) {
      // this probably isn't a problem
      // so just continue
    }
  } catch (e) {
    logger.error(e);
    logger.info(`browser: going to page failed`);
    throw e;
  }
}

async function waitForPageToBeStable(page) {
  let isStable = await checkPageIsStable(page);
  const start = Date.now();
  while (!isStable) {
    if (Date.now() - start > stabilityTimeout) break;
    isStable = await checkPageIsStable(page);
    if (!isStable) {
      await timeout(500);
    }
  }
  if (!isStable) {
    throw new Error(
      `browser: page didn't become stable after ${stabilityTimeout}ms`
    );
  }
}

function timeout(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

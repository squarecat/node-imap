import { checkForButton, checkForKeyword, checkForKeywords } from './checks';

import logger from '../../../utils/logger';

export async function doUnsubscribeActions(page) {
  let hasSuccessKeywords = await checkForKeywords(page);

  if (!hasSuccessKeywords) {
    // find button to press
    const $btn = await checkForButton(page);
    if ($btn) {
      logger.info('browser: clicking and waiting');
      await clickButton(page, $btn);
      logger.info('browser: clicked button');
      hasSuccessKeywords = await checkForKeywords(page);
    }
  }
  return hasSuccessKeywords;
}

export async function doBespokeUnsubscribe(page, url) {
  if (url.includes('quora.com')) {
    return unsubscribeFromQuora(page);
  }
  throw new Error(`bespoke unsubscribe from ${url} not implemented`);
}

export async function clickButton(page, btn) {
  return Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    btn.click()
  ]);
}

// bespoke unsub from quora
export async function unsubscribeFromQuora(page) {
  logger.info('browser: doing a bespoke unsub from quora');
  try {
    await page.click('[name=selected_label][value="Off"]');
    const btn = await page.$('.submit_button');
    await btn.click();
    await page.waitForSelector('.PMsgSuccess.Success');
    return true;
  } catch (err) {
    logger.error('failed to unsubscribe from quora');
    return false;
  }
}

import { checkForButton, checkForKeyword, checkForKeywords } from './checks';

import logger from '../../../utils/logger';

export async function doUnsubscribeActions(page) {
  let hasSuccessKeywords = await checkForKeywords(page);

  if (!hasSuccessKeywords) {
    // find button to press
    const $btn = await checkForButton(page);
    if ($btn) {
      logger.info('browser-actions: clicking and waiting');
      await clickButton(page, $btn);
      logger.info('browser-actions: clicked button');
      hasSuccessKeywords = await checkForKeywords(page);
    }
  }
  return hasSuccessKeywords;
}

export async function doBespokeUnsubscribe(page, url) {
  if (url.includes('quora.com')) {
    return unsubscribeFromQuora(page);
  }
  if (url.includes('ebay.co.uk')) {
    return unsubscribeFromEbay(page);
  }
  throw new Error(
    `browser-actions: bespoke unsubscribe from ${url} not implemented`
  );
}

export async function clickButton(page, btn) {
  try {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
      btn.click()
    ]);
  } catch (err) {
    // if there's a timeout, it could mean that the button
    // just did an ajax thing, not a page redirect
    // so go on to check the page for keywords anyway
    if (err.name === 'TimeoutError') {
      return;
    }
    throw err;
  }
}

// bespoke unsub from quora
export async function unsubscribeFromQuora(page) {
  logger.info('browser-actions: doing a bespoke unsub from quora');
  try {
    await page.click('[name=selected_label][value="Off"]');
    const btn = await page.$('.submit_button');
    await btn.click();
    await page.waitForSelector('.PMsgSuccess.Success');
    return true;
  } catch (err) {
    logger.error('browser-actions: failed to unsubscribe from quora');
    return false;
  }
}

export async function unsubscribeFromEbay(page) {
  logger.info('browser-actions: doing a bespoke unsub from ebay');
  try {
    await page.click('#unsubscribe-button3');
    const btn = await page.$('#confirm-button');
    await btn.click();
    await page.waitForSelector('#unsubscribe-success');
    return true;
  } catch (err) {
    logger.error('browser-actions: failed to unsubscribe from quora');
    return false;
  }
}

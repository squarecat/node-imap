import { checkForButton, checkForKeywords } from './checks';

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

export async function clickButton(page, btn) {
  return Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    btn.click()
  ]);
}

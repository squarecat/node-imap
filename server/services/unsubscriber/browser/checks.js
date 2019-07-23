import keywords from './keywords.json';
import logger from '../../../utils/logger';

// get lowercase, uppercase and capitalized versions of all keywords too
const unsubSuccessKeywords = keywords.success.reduce(
  (words, keyword) => [...words, keyword, keyword.toLowerCase()],
  []
);
const unsubFailKeywords = keywords.fail.reduce(
  (words, keyword) => [...words, keyword, keyword.toLowerCase()],
  []
);

export async function checkForKeywords(
  page,
  words = unsubSuccessKeywords,
  failWords = unsubFailKeywords
) {
  logger.info('browser: checking for keywords');

  const bodyText = await page.evaluate(() =>
    document.body.innerText.toLowerCase()
  );
  logger.info('browser: got page text');
  const hasSuccessWord = words.some(word => {
    return bodyText.includes(word);
  });
  const hasFailWord = failWords.some(word => {
    return bodyText.includes(word);
  });
  return hasSuccessWord && !hasFailWord;
}

const confirmButtonKeywords = keywords.buttonActions;

export async function checkForButton(page) {
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
    return $confirmLink;
  }
  return null;
}

// FIXME maybe there will be multiple refresh meta tags
// in order to confuse me? There shouldn't ever be but in
// that case then we could scan for the shortest one.
export async function checkForMetaRedirect(page) {
  try {
    const refresh = await page.$eval('meta[http-equiv="refresh"]', el => {
      if (!el) {
        return null;
      }
      const content = el.getAttribute('content');
      const matches = content.match(/^(\d+);url=(.+)$/);
      // must use longhand here because it's being evaluated in
      // the browser
      const timeout = matches[1];
      const url = matches[2];
      // in case the redirect is relative, create an anchor from it
      // and use those details as the URL instead
      const a = document.createElement('a');
      a.href = url;
      return { timeout, url: a.href };
    });
    if (refresh) {
      const { timeout, url } = refresh;
      return { timeout, url };
    }
    return null;
  } catch (e) {
    // throws if element doesn't exist
    return null;
  }
}

const hrefChangeActions = [
  'location.href =',
  'location.href=',
  'location.replace'
];

export async function checkPageIsStable(page) {
  // check if there are any timers and if
  // they have the capability to refresh
  // the page in any way
  const activeTimers = await page.evaluate(() => {
    return window.activeTimers();
  });
  if (!activeTimers || !activeTimers.length) {
    return true;
  }
  logger.info('browser: has page changing timeouts');
  return activeTimers.every(timer => {
    const functionContent = timer.functionString;
    const hasHrefChange = new RegExp(
      hrefChangeActions.map(a => `[${a}]`).join('|')
    ).test(functionContent);
    return !hasHrefChange;
  });
}

export function isBespoke(url) {
  return keywords.bespokeDomains.some(d => url.includes(d));
}

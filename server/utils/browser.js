import puppeteer from 'puppeteer';
import config from 'getconfig';

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
    await page.goto(unsubUrl, { waitUntil: 'networkidle0' });
    image = await page.screenshot({
      encoding: 'base64'
    });
    let hasSuccessKeywords = await hasKeywords(page, unsubSuccessKeywords);
    if (!hasSuccessKeywords) {
      // find button to press
      const links = await page.$$('a, input[type=submit], button');
      console.log('mail-service: links', links.length);
      const $confirmLink = await links.reduce(async (promise, link) => {
        const [value, text] = await Promise.all([
          (await link.getProperty('value')).jsonValue(),
          (await link.getProperty('innerText')).jsonValue()
        ]);
        const hasButtonKeyword = confirmButtonKeywords.some(keyword =>
          `${value} ${text}`.toLowerCase().includes(keyword)
        );
        if (hasButtonKeyword) {
          console.log('mail-service: found text in btn');
          return link;
        }
        return null;
      }, Promise.resolve());
      if ($confirmLink) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          $confirmLink.click()
        ]);
        console.log('mail-service: clicked button');
        hasSuccessKeywords = await hasKeywords(page, unsubSuccessKeywords);
      }
    }
    image = await page.screenshot({
      encoding: 'base64'
    });
    return { estimatedSuccess: hasSuccessKeywords, image };
  } catch (err) {
    console.error(err);
    return { estimatedSuccess: false, err, image };
  } finally {
    await page.close();
    await closeInstance();
  }
}

async function hasKeywords(page, keywords) {
  const bodyText = await page.evaluate(() =>
    document.body.innerText.toLowerCase()
  );
  return keywords.some(word => {
    return bodyText.includes(word);
  });
}

async function getPuppeteerInstance() {
  if (puppeteerInstance) {
    return puppeteerInstance;
  }
  puppeteerInstance = await puppeteer.launch(config.puppeteer);
  return puppeteerInstance;
}

async function closeInstance() {
  const pageCount = (await puppeteerInstance.pages()).length;
  // theres always a blank page to start with
  if (pageCount === 1) {
    console.log('no pages open, closing browser');
    await puppeteerInstance.close();
  } else {
    console.log(`${pageCount} pages still open`);
  }
}

import puppeteer from 'puppeteer';
import config from 'getconfig';
import io from '@pm2/io';

const currentTabsOpen = io.counter({
  name: 'Current Tabs Open'
});

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
    console.log('browser: opened new tab');
    currentTabsOpen.inc();
    await page.goto(unsubUrl, { waitUntil: 'networkidle0' });
    image = await page.screenshot({
      encoding: 'base64'
    });
    let hasSuccessKeywords = await hasKeywords(page, unsubSuccessKeywords);
    if (!hasSuccessKeywords) {
      // find button to press
      const links = await page.$$('a, input[type=submit], button');
      console.log('browser: links', links.length);
      const $confirmLink = await links.reduce(async (promise, link) => {
        const [value, text] = await Promise.all([
          (await link.getProperty('value')).jsonValue(),
          (await link.getProperty('innerText')).jsonValue()
        ]);
        const hasButtonKeyword = confirmButtonKeywords.some(keyword =>
          `${value} ${text}`.toLowerCase().includes(keyword)
        );
        if (hasButtonKeyword) {
          console.log('browser: found text in btn');
          return link;
        }
        return promise;
      }, Promise.resolve());
      if ($confirmLink) {
        console.log('browser: clicking and waiting');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          $confirmLink.click()
        ]);
        console.log('browser: clicked button');
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
    // clear tab memory
    console.log('browser: clearing memory');
    await page.goto('about:blank');
    currentTabsOpen.dec();
    await page.close();
    await closeInstance();
  }
}

async function hasKeywords(page, keywords) {
  console.log('browser: checking for keywords');
  const bodyText = await page.evaluate(() =>
    document.body.innerText.toLowerCase()
  );
  console.log('browser: got page text');
  return keywords.some(word => {
    return bodyText.includes(word);
  });
}

async function getPuppeteerInstance() {
  if (puppeteerInstance) {
    return puppeteerInstance;
  }
  puppeteerInstance = await puppeteer.launch(config.puppeteer);
  console.log('browser: launched new browser');
  return puppeteerInstance;
}

async function closeInstance() {
  if (!puppeteerInstance) return;
  try {
    const pageCount = (await puppeteerInstance.pages()).length;
    // theres always a blank page to start with
    if (pageCount === 1) {
      console.log('browser: no pages open, closing browser');
      await puppeteerInstance.close();
      puppeteerInstance = null;
    } else {
      console.log(`browser: ${pageCount} pages still open`);
    }
  } catch (err) {
    console.error(err);
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

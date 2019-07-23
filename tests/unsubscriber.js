const fs = require('fs');
require('@babel/polyfill');
require('@babel/register');
const Unsubscriber = require('../server/services/unsubscriber/browser');
const urls = require('./test-domains.js');

const { unsubscribeWithLink } = Unsubscriber;

// const url = process.argv[2];
let i = 1;
function saveImageToDisk(image) {
  const dir = __dirname;
  const path = `${dir}/outputs/${i++}.png`;
  return new Promise((good, bad) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFile(path, image, 'binary', err => {
      if (err) {
        return bad(err);
      }
      return good();
    });
  });
}

(async () => {
  await urls.reduce(async (p, url) => {
    console.log('unsubscribing from', url);
    await p;
    const output = await unsubscribeWithLink(url);
    const { image } = output;
    await saveImageToDisk(image, url);
    console.log(`
estimatedSuccess: ${output.estimatedSuccess}
hasImage: ${!!image}
`);
  }, Promise.resolve());
})();

const fs = require('fs');
require('@babel/polyfill');
require('@babel/register');
const Unsubscriber = require('../server/services/unsubscriber/browser');

const { unsubscribeWithLink } = Unsubscriber;

const url = process.argv[2];

function saveImageToDisk(image) {
  const dir = __dirname;
  const path = `${dir}/unsub.png`;
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
  const output = await unsubscribeWithLink(url);
  const { image } = output;
  await saveImageToDisk(image);
  console.log(`
estimatedSuccess: ${output.estimatedSuccess}
hasImage: ${!!image}
`);
})();

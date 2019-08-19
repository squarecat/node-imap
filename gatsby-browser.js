/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
const Sentry = require('@sentry/browser');

const env = process.env.NODE_ENV;
// You can delete this file if you're not using it
exports.onClientEntry = () => {
  require('@babel/polyfill');
  console.log(`We've started in ${env}`);
  if (env === 'production') {
    Sentry.init({
      dsn: 'https://9b4279f65dbd47e09187ed8b1c4f071b@sentry.io/1334902',
      environment: env
    });
  }
};

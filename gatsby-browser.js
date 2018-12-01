/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
const Sentry = require('@sentry/browser');
// You can delete this file if you're not using it
exports.onClientEntry = () => {
  console.log("We've started!");
  Sentry.init({
    dsn: 'https://9b4279f65dbd47e09187ed8b1c4f071b@sentry.io/1334902'
  });
};

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
  const a = 'font-family:monospace;';
  const suffix = env === 'production' ? 'v2.0' : 'Dev mode';
  const text = `
%c   __                                        _   _                  
%c  / /  ___  __ ___   _____    /\\/\\   ___    /_\\ | | ___  _ __   ___ 
%c / /  / _ \\/ _\` \\ \\ / / _ \\  /    \\ / _ \\  //_\\\\| |/ _ \\| '_ \\ / _ \\
%c/ /__ | __/ (_| |\\ V /  __/ / /\\/\\ \\  __/ /  _  \\ | (_) | | | |  __/
%c\\____/\\___|\\__,_| \\_/ \\___| \\/    \\/\\___| \\_/ \\_/_|\\___/|_| |_|\\___| ${suffix}
`;
  console.log(text, a, a, a, a, a);
  if (env === 'production') {
    Sentry.init({
      dsn: 'https://9b4279f65dbd47e09187ed8b1c4f071b@sentry.io/1334902',
      environment: env
    });
  }
};

const React = require('react');

/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

exports.onRenderBody = (
  { setPostBodyComponents, setHeadComponents },
  pluginOptions
) => {
  setPostBodyComponents([
    <script
      key="chat-widget"
      dangerouslySetInnerHTML={{
        __html: getChat(pluginOptions)
      }}
    />,
    <script
      key="twitter-script"
      async
      src="https://platform.twitter.com/widgets.js"
      charSet="utf-8"
    />
  ]);
};

function getChat() {
  return `
  window.$crisp=[];window.CRISP_WEBSITE_ID="75ceebe6-e79c-4cbf-96d2-00c8d3b8ddbf";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
  `;
}

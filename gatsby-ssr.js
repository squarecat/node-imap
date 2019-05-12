const React = require('react');

/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

exports.onRenderBody = ({ setPostBodyComponents }) => {
  setPostBodyComponents([
    <script
      key="stripe-script"
      src="https://checkout.stripe.com/checkout.js"
    />,
    <script
      key="rewardful-script"
      async
      src="https://r.wdfl.co/rw.js"
      data-rewardful="15fc4f"
    />,
    <script
      key="twitter-script"
      async
      src="https://platform.twitter.com/widgets.js"
      charSet="utf-8"
    />,
    <script
      key="support-start"
      dangerouslySetInnerHTML={{
        __html: `window.intergramId = "-388078727";
        window.intergramServer = "https://support.squarecat.io"
        window.intergramCustomizations = {
          titleClosed: 'Chat',
          titleOpen: 'Chat',
          closedStyle: 'button', // button or chat
          closedChatAvatarUrl: '', // only used if closedStyle is set to 'chat'
          cookieExpiration: 1, // in days. Once opened, closed chat title will be shown as button (when closedStyle is set to 'chat')
          autoNoResponse:
            'It seems that no one is available to answer right now. Please tell us how we can ' +
            'contact you, and we will get back to you as soon as we can.',
          placeholderText: 'Send a message...',
          displayMessageTime: true,
          mainColor: '#222',
          alwaysUseFloatingButton: false,
          desktopHeight: 550,
          desktopWidth: 400
        };
        `
      }}
    />,
    <script
      id="intergram"
      key="intergram"
      type="text/javascript"
      src="https://support.squarecat.io/js/widget.js"
    />
  ]);
};

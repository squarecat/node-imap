const React = require('react');
const Terser = require('terser');
/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */
exports.onRenderBody = function({ setPostBodyComponents, pathname }) {
  console.log('pre-rendering body for', pathname);
  let components = [
    <div key="modal-root" id="modal-root" />,
    <script
      key="metomic"
      dangerouslySetInnerHTML={{
        __html: `!(function(p, r, i, v, a, c, y) {
      p.Metomic = { apiKey: i };
      p[i] ||
        (p[i] = function() {
          (p[i].q = p[i].q || []).push(arguments);
        });
      p[i].l = +new Date();
      c = r.createElement(v);
      y = r.getElementsByTagName(v)[0];
      p.Metomic.script = c;
      c.src = a;
      y.parentNode.insertBefore(c, y);
    })(
      window,
      document,
      'prj:464f67cd-4c3b-4c54-bac2-d0513284a9a4',
      'script',
      'https://consent-manager.metomic.io/embed.js'
    );`
      }}
    />,
    <script
      key="support-start"
      type="text/x-metomic"
      data-micropolicy="live-chat"
      dangerouslySetInnerHTML={{
        __html: Terser.minify(`window.intergramId = "-388078727";
        window.intergramServer = "https://support.squarecat.io"
        window.intergramCustomizations = {
          titleClosed: 'Chat',
          titleOpen: 'Chat',
          closedStyle: 'button', // button or chat
          closedChatAvatarUrl: '', // only used if closedStyle is set to 'chat'
          cookieExpiration: 1, // in days. Once opened, closed chat title will be shown as button (when closedStyle is set to 'chat')
          autoNoResponse:
            'It seems that no one is available to answer right now. Please leave your email address ' +
            'and we will get back to you as soon as we can.',
          placeholderText: 'Send a message...',
          displayMessageTime: true,
          mainColor: '#222',
          alwaysUseFloatingButton: false,
          desktopHeight: 550,
          desktopWidth: 400,
          hideButton: window.location.pathname.startsWith('/app')
        };
        `).code
      }}
    />,
    <script
      id="intergram"
      type="text/x-metomic"
      data-micropolicy="live-chat"
      key="intergram"
      src="https://support.squarecat.io/js/widget.js"
    />
  ];

  setPostBodyComponents(components);
};

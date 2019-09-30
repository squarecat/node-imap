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
    <div key="alert-root" id="alert-root" />,
    <script
      key="metomic"
      dangerouslySetInnerHTML={{
        __html: `!(function(p,r,i,v,a,c,y){
          p['MetomicObject']=a;
          p[a]=p[a]||function(){
        (p[a].q=p[a].q||[]).push(arguments)},p[a].l=1*new Date();c=r.createElement(i),
        y=r.getElementsByTagName(i)[0];
        c.async=1;
        c.src=v+'?d='+r.location.host;
        function load() {
          y.parentNode.insertBefore(c,y)
          Metomic('load', { projectId: 'prj:464f67cd-4c3b-4c54-bac2-d0513284a9a4' });
          Metomic.loaded = true;
        }        
        if (!window.location.pathname.startsWith('/app')) {          
          window.addEventListener('scroll', load, { once: true })
        }
        })(window, document, 'script', 'https://consent-manager.metomic.io/embed.js', 'Metomic');
        `
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
    />,
    <script
      id="intergram-boot"
      type="text/x-metomic"
      data-micropolicy="live-chat"
      key="intergram-boot"
      dangerouslySetInnerHTML={{
        __html: `(function () { let i = setInterval(function() { window.injectChat && (clearInterval(i) || window.injectChat())}, 3000) })()`
      }}
    />,
    <noscript key="simple-noscript">
      <img src="https://stats.leavemealone.app/image.gif" alt="" />
    </noscript>
  ];
  setPostBodyComponents(components);
};

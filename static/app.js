/* Simple Analytics - Privacy friend analytics (docs.simpleanalytics.com/script) */

!(function(i, e) {
  if (i) {
    var n,
      r,
      s = i.navigator,
      o = i.location,
      c = o.hostname,
      t = i.document,
      a = i.console,
      u = '//' + e,
      l = 'https://' + e;
    try {
      function p(e, t) {
        return e && e.getAttribute('data-' + t);
      }
      function h(e) {
        a && a.warn && a.warn('Simple Analytics: ' + e);
      }
      var f,
        m = s.userAgent,
        d = i.dispatchEvent,
        g = 'Not sending requests ',
        v = t.querySelector('script[src$="' + u + '/app.js"]'),
        w = p(v, 'mode'),
        y = 'true' === p(v, 'skip-dnt'),
        b = p(v, 'sa-global') || 'sa';
      if ('localhost' === c) return h(g + 'from localhost');
      if (/(bot|spider|crawl)/i.test(m))
        return h(g + 'because user agent is a robot');
      function E(e) {
        var t = o.search.match(new RegExp('[?&](' + e + ')=([^?&]+)', 'gi')),
          n = t
            ? t.map(function(e) {
                return e.split('=')[1];
              })
            : [];
        if (n && n[0]) return n[0];
      }
      function S(e) {
        var t = o.protocol + '//' + c + o.pathname;
        if (('hash' === w && o.hash && (t += o.hash.split('?')[0]), f !== t)) {
          if (((f = t), !y && 'doNotTrack' in s && '1' === s.doNotTrack))
            return h(g + 'when doNotTrack is enabled');
          var n = { url: t };
          m && (n.ua = m),
            T && (n.urlReferrer = T),
            R && !e && (n.referrer = R),
            i.innerWidth && (n.width = i.innerWidth);
          try {
            n.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          } catch (a) {}
          var r = new XMLHttpRequest();
          r.open('POST', u + '/api', !0),
            r.setRequestHeader('Content-Type', 'text/plain; charset=UTF-8'),
            r.send(JSON.stringify(n));
        }
      }
      var T = E('utm_source|source|ref'),
        q = E('utm_campaign|campaign'),
        R =
          t.referrer
            .replace(
              /^https?:\/\/((m|l|w{2,3}([0-9]+)?)\.)?([^?#]+)(.*)$/,
              '$4'
            )
            .replace(/^([^/]+)\/$/, '$1') || null,
        $ = i.history;
      if (($ ? $.pushState : null) && Event && d) {
        ($.pushState = ((r = $[(n = 'pushState')]),
        function() {
          var e = r.apply(this, arguments),
            t = new Event(n);
          return (t.arguments = arguments), d(t), e;
        })),
          i.addEventListener('pushState', function() {
            S(!0);
          });
      }
      'hash' === w && 'onhashchange' in i && (i.onhashchange = S), S();
      var k = /\.(.+)/.exec(e)[1];
      if (c !== k && !new RegExp('.' + k + '$', 'i').test(c))
        return h('Events via this script only work on ' + k + ' domains');
      function x() {
        A = !0;
        var a = t.createElement('iframe');
        a.setAttribute('src', u + '/iframe.html'),
          (a.style.display = 'none'),
          (a.onload = function() {
            var t = a.contentWindow,
              n = T || R;
            try {
              if (N)
                for (var e = 0; e < N.length; e++)
                  t.postMessage({ event: N[e][0], ref: n, campaign: q }, l);
            } catch (r) {}
            i[b] = function(e) {
              t.postMessage({ event: e, ref: n, campaign: q }, l);
            };
          }),
          t.body.appendChild(a);
      }
      var N = i[b] && i[b].q ? i[b].q : [],
        A = !1;
      (i[b] = function() {
        A || x(), N.push([].slice.call(arguments));
      }),
        !A && N.length && x();
    } catch (I) {
      a && a.error && a.error(I);
      var C = u + '/image.gif';
      I && I.message && (C = C + '?error=' + encodeURIComponent(I.message)),
        (new Image().src = C);
    }
  }
})(window, 'local.leavemealone.xyz');

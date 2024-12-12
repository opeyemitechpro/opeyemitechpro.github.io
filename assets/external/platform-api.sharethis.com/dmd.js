
(function (w, d, s, m, n, t) {
  w[m] = w[m] || {
    init: function () { (w[m].q = w[m].q || []).push(arguments); }, ready: function (c) {
      if ('function' != typeof c) { return; } (w[m].c = w[m].c || []).push(c); c = w[m].c;
      n.onload = n.onreadystatechange = function () {
        if (!n.readyState || /loaded|complete/.test(n.readyState)) {
          n.onload = n.onreadystatechange = null;
          if (t.parentNode && n.parentNode) { t.parentNode.removeChild(n); } while (c.length) { (c.shift())(); }
        }
      };
    }
  }, w[m].d = 1 * new Date(); n = d.createElement(s); t = d.getElementsByTagName(s)[0];
  n.async=1;n.src='https://www.medtargetsystem.com/javascript/beacon.js?'+(Date.now().toString()).substring(0,4);n.setAttribute("data-aim",m);t.parentNode.insertBefore(n,t);
})(window, document, 'script', 'AIM');

AIM.init('194-3051-2EAEFDBB', { 'onload_pageview': false });

AIM.ready(function () {
  var stid = __stdos__.data.get("stid", "pageInfo");
  var url = window.location.href + '#estid=' + stid;
  AIM.pageview(url);
});

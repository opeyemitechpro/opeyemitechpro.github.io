
var MGXFactory = function (window, document, undefined) {
  "use strict";
  try {
    //****************************************************************************** */
    var mgxVersion = "4.00.002" // This must be incremented when the script is updated
    //******************************************************************************* */
    var MGX = window.MGX || [];
    if (MGX && typeof MGX.length !== 'undefined' && MGX.version === mgxVersion) {
      return;
    }
    //var MGX = typeof window.MGX !== 'undefined' && typeof window.MGX.length !== 'undefined' ? window.MGX : [];
    MGX.version = mgxVersion;
    MGX.api = 'https://api.datasteam.io/v1/C/pixel/';
    MGX.domain = window.location.hostname.split('.').length > 2 ? window.location.hostname.slice(window.location.hostname.indexOf('.')) : '.' + window.location.hostname;
    MGX.regex = {
      guid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    };
    MGX.cd = [];
    MGX.getCookie = function (name) {
      var b = name + "=";
      var a = document.cookie.split(";");
      for (var e = 0; e < a.length; e++) {
        var f = a[e];
        while (f.charAt(0) == " ") {
          f = f.substring(1)
        }
        if (f.indexOf(b) === 0) {
          return unescape(f.substring(b.length, f.length))
        }
      }
      return ""
    };
    MGX.setCookie = function (name, value, expires) {
      var b = typeof expires === "undefined" ? null : expires;
      var f = new Date();
      f.setDate(f.getDate() + b);
      var h = f.toUTCString();
      var c = escape(value) + "; path=/;domain=" + this.domain + (b == null ? "" : "; expires=" + h);
      document.cookie = name + "=" + c
    };
    MGX.uuid = function () {
      var b = new Date().getTime();
      var a = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (e) {
        var d = (b + Math.random() * 16) % 16 | 0;
        b = Math.floor(b / 16);
        return (e == "x" ? d : (d & 3 | 8)).toString(16)
      });
      return a
    };
    MGX.commit = function (data) {
      if (this.visitorId === "FM") {
        return;
      }
      if (typeof data !== 'object') {
        console.log('MGX: data must be an object');
        return;
      }
      var accessKey = data.AccessKey ? data.AccessKey : this.accessKey;
      if (!accessKey) {
        console.warn('access key not specified');
        return;
      }
      this.accessKey = accessKey;
      var lbl = typeof data.Label === 'undefined' ? 'pageload' : data.Label.toLowerCase();
      var dto = {
        v: this.visitorId,
        se: this.sessionId,
        p: this.pageLoadId,
        u: document.location.href,
        pn: document.location.pathname,
        r: document.referrer,
        t: document.title,
        l: "PageLoad",
        hc: data.HasCart ? '1' : '0',
        sid: data.Info
      };
      switch (lbl) {
        case 'conversion':
        case 'checkoutcomplete':
          this.pageLoadId = dto.p = this.uuid();
          dto.l = 'CheckoutComplete';
          dto.v01 = data.OrderId || data.ConversionId || this.sessionId;
          dto.v02 = data.OrderTotal || data.Revenue || '0';
          break;
        case 'category':
          this.pageLoadId = dto.p = this.uuid();
          dto.l = 'Category';
          dto.v01 = data.CategoryId;
          dto.v02 = data.CategoryName;
          break;
        case 'product':
          this.pageLoadId = dto.p = this.uuid();
          dto.l = 'Product';
          dto.v01 = data.ProductId;
          dto.v02 = data.ProductName;
          dto.v03 = data.ProductSku;
          break;
        case 'checkoutvisit':
          this.pageLoadId = dto.p = this.uuid();
          dto.l = 'CheckoutVisit';
          dto.v01 = data.ShippingCost;
          dto.v02 = data.OrderTotal;
          break;
        case 'search':
          this.pageLoadId = dto.p = this.uuid();
          dto.l = 'Search';
          dto.v01 = data.SearchTerm;
          dto.v02 = data.ResultsCount;
          break;
        case 'forgetme':
          // If this is forgetme request, we need to set the visitor id cookie and wipe the session cookie
          this.setCookie("MGX_P", "FM", 365);
          this.setCookie("MGX_PX", "", -1);
          // Now we can set up the data object to commit
          this.pageLoadId = dto.p = this.uuid();
          dto.l = 'ForgetMe';
          break;
        case 'action':
        case 'addtocart':
          dto.l = 'Action';
          dto.v01 = lbl === 'addtocart' ? 'AddToCart' : 'ClientAction';
          dto.v03 = lbl === 'addtocart' ? 'AddToCart' : data.Key;
          dto.v04 = lbl === 'addtocart' ? '1' : data.Value;
          break;
        default:
          dto.l = 'PageLoad'
      }
      var sendData = JSON.stringify(dto).replace(/[^\x00-\x7F]/g, "");
      var pxl = document.createElement('img');
      pxl.style.display = 'none';
      pxl.src = this.api
        + accessKey.toUpperCase() + '?'
        + 'v=' + this.visitorId
        + '&se=' + this.sessionId
        + '&p=' + this.pageLoadId
        + '&l=' + lbl
        + '&d=' + encodeURI(btoa(sendData));
      document.body.appendChild(pxl);
      this.cd.push(dto);
    };
    MGX.handler = function (e) {
      var value = "";
      var type = e.type;
      var src = e.target;
      if (src) {
        value =
          (src.tagName ? src.tagName.toLowerCase() : "") +
          (src.id ? "#" + src.id : "") +
          (src.className ? "." + src.className.split(/\s+/).join(".") : "") +
          (src.href ? '[href="' + src.href + '"]' : "");
      }
      MGX.commit({
        Label: "Action",
        Key: type,
        Value: value
      });
    };
    MGX.setEventHandlers = function () {
      if (document.body) {
        if (typeof document.body.addEventListener === 'function') {
          document.body.removeEventListener('click', this.handler);
          document.body.removeEventListener('change', this.handler);
          document.body.addEventListener('click', this.handler);
          document.body.addEventListener('change', this.handler);
        }
        else if (typeof document.body.attachEvent === 'function') {
          document.body.detachEvent('click', this.actionHandler(e));
          document.body.detachEvent('change', this.actionHandler(e));
          document.body.attachEvent('click', this.actionHandler(e));
          document.body.attachEvent('change', this.actionHandler(e));
        }
      }
    };
    MGX.createPixel = function (url) {
      var pxl = document.createElement('img');
      pxl.style.display = 'none';
      pxl.src = url;
      document.body.appendChild(pxl);
    };
    MGX.init = function () {
      var a = this.getCookie("MGX_P"),
        b = this.getCookie("MGX_PX");
      // If this is a forget me cookie, bail out
      if (a === 'FM') {
        return;
      }
      if (!this.regex.guid.test(a)) {
        a = this.uuid();
      }
      this.setCookie("MGX_P", a, 365);
      if (!this.regex.guid.test(b)) {
        b = this.uuid();
      }
      this.setCookie("MGX_PX", b);
      this.visitorId = a;
      this.sessionId = b
      this.pageLoadId = this.uuid();
      while (this.length) {
        var data = this.shift();
        if (typeof data.Label === "string" && ['action', 'contact', 'cartitem'].indexOf(data.Label.toLowerCase()) === -1) {
          this.pageLoadId = this.uuid();
        }
        this.commit(data);
      }
      this.push = function (data) {
        try {
          MGX.commit(data)
        }
        catch (err) {
          console.warn(err);
        }
      }
      MGX.setEventHandlers();
    };
    MGX.init();
    window.MGX = MGX;
  } catch (err) {
    console.log(err);
  }
};

// Instantiate the core script on the window
MGXFactory(window, window.document);
MGX.push({
  AccessKey: '8F387F7C88F9',
  Info: ''
});

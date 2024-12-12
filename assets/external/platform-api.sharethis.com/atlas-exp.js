
(function () {
  try {

    function send() {

      var query_params = ""

      try {

        let pview_url = ""
  
        if (window.__stdos__) {

          // platform
          pview_url = window.__stdos__.data.pageInfo.pview_url
  
        } else if (window.stlib) {

          // widget
          pview_url = window.stlib.data.pageInfo.pview_url
  
        }

        if (pview_url) {
          query_params = pview_url.split("?")[1]
        }

      } catch (e) {}

      var url = "https://pd.sharethis.com/atlas-exp"

      /* temporarily disable atlas params
      url += "?atlas_params=" + JSON.stringify(params)
      url += "&" + query_params
      */

      url += "?" + query_params

      let img = new Image(0, 0)
      img.src = url
      img.onload = () => {}
      img.onerror = () => {}
    }

    var nav = window.navigator
    var params = {}
    if (nav.connection) {
      params.connection = {
        downlink: nav.connection.downlink,
        effectiveType: nav.connection.effectiveType,
        rtt: nav.connection.rtt,
        saveData: nav.connection.saveData
      }
    }
    params.cookieEnabled = nav.cookieEnabled
    params.deviceMemory = nav.deviceMemory
    params.hardwareConcurrency = nav.hardwareConcurrency
    params.language = nav.language
    params.languages = nav.languages
    params.maxTouchPoints = nav.maxTouchPoints
    params.pdfViewerEnabled = nav.pdfViewerEnabled

    if (nav.storage && nav.storage.estimate) {
      nav.storage.estimate().then((estimate) => {
        params.storage = estimate
        send()
      })
    } else {
      send()
    }

  } catch (e) {
  }
})()

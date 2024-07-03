// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: frog;

async function getWeatherHTML(city) {
  const request = new Request(`https://www.google.com/search?q=weather+${city}`)
  request.method = 'GET'
  request.headers = {'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.10'}
  let webview = new WebView()
  await webview.loadRequest(request)
  return webview.getHTML()
}

function getFroggieURL(html) {
  return html.match(/https:\/\/ssl\.gstatic\.com\/weather\/froggie\/l\/[^\.]+\.png/gm)[0]
}

function getGradientColors(html) {
  c = /background:linear-gradient\(#(.{6}) 10%, #(.{6}) 100%\)/gm.exec(html)
  return [new Color(c[1]),new Color(c[2])]
}

function getForecastInfo(html) {

  const forecastInfo = {
    temp: `${/Now<\/div><div[^>]+><div><div[^>]+><span[^>]+><span[^>]+>(\d+)/.exec(html)[1]}°`,
    feelsLike: `Feels like ${/Feels like <span[^>]+><span[^>]+>(\d+)/gm.exec(html)[1]}°`,
    image: /<img id="dimg_21"[^>]src="([^"]+)/gm.exec(html)[1],
    summary: /<div class="crimBc">([^<]+)/gm.exec(html)[1],
    precip: html.match(/(Precip: \d+%)/gm)[0],
    humidity: html.match(/(Humidity: \d+%)/gm)[0],
    wind: /data-f="(Wind: \d+ [\w\/]+)/gm.exec(html)[1] // change data-f to data-c for metric
  }
  
  return forecastInfo
}

async function createWidget() {
  deviceScreen = Device.screenSize();
  let padding = ((deviceScreen.width - 240) /5)
  let widgetSize = new Size(padding*4 + 240, padding*2 + 120)

  let html = await getWeatherHTML('cambridge')


  let black = new Color("000000")

  let listWidget = new ListWidget()

  let gradient = new LinearGradient()
  gradient.colors = getGradientColors(html)
  gradient.locations = [0.1,1]
  listWidget.backgroundGradient=gradient

  let textStack = listWidget.addStack()
  listWidget.addSpacer(11)
  let imageStack = listWidget.addStack()
  imageStack.bottomAlignContent()
  imageStack.size = new Size(widgetSize.width,widgetSize.width*(119/720))
  
  
  let summaryStack = textStack.addStack()
  summaryStack.layoutVertically()

  textStack.addSpacer()

  let infoStack = textStack.addStack()
  infoStack.layoutVertically()

  let tempIconStack = summaryStack.addStack()
  tempIconStack.centerAlignContent()
  const forecastInfo = getForecastInfo(html)

  let temp = tempIconStack.addText(forecastInfo.temp)
  temp.font=Font.systemFont(36)
  let feelsLike = summaryStack.addText(forecastInfo.feelsLike)
  feelsLike.font=Font.systemFont(14)

  const img_html=`<div style='max-width: 100%;max-height:100%;'><img src='${forecastInfo.image}' height='150' width='150' alt=''></div>`

  const img_js = `!function(t){"use strict";var g={parseExtension:function(t){return"png"},canvasToBlob:function(e){return e.toBlob?new Promise(function(t){e.toBlob(t)}):function(i){return new Promise(function(t){for(var e=window.atob(i.toDataURL().split(",")[1]),n=e.length,r=new Uint8Array(n),o=0;o<n;o++)r[o]=e.charCodeAt(o);t(new Blob([r],{type:"image/png"}))})}(e)},uid:function(){var t=0;return function(){return"u"+("0000"+(Math.random()*Math.pow(36,4)<<0).toString(36)).slice(-4)+t++}}(),delay:function(n){return function(e){return new Promise(function(t){setTimeout(function(){t(e)},n)})}},asArray:function(t){for(var e=[],n=t.length,r=0;r<n;r++)e.push(t[r]);return e},escapeXhtml:function(t){return t},makeImage:function(r){return new Promise(function(t,e){var n=new Image;n.onload=function(){t(n)},n.onerror=e,n.src=r})},width:function(t){var e=r(t,"border-left-width"),n=r(t,"border-right-width");return t.scrollWidth+e+n},height:function(t){var e=r(t,"border-top-width"),n=r(t,"border-bottom-width");return t.scrollHeight+e+n}};function r(t,e){var n=window.getComputedStyle(t).getPropertyValue(e);return parseFloat(n.replace("px",""))}var e={imagePlaceholder:void 0,cacheBust:!1},n={toSvg:o,toBlob:function(t,e){return function(n,r){return o(n,r).then(g.makeImage).then(g.delay(100)).then(function(t){var e=function(t){var e=document.createElement("canvas");{var n;e.width=r.width||g.width(t),e.height=r.height||g.height(t),r.bgcolor&&((n=e.getContext("2d")).fillStyle=r.bgcolor,n.fillRect(0,0,e.width,e.height))}return e}(n);return e.getContext("2d").drawImage(t,0,0),e})}(t,e||{}).then(g.canvasToBlob)},impl:{options:{},util:g}};function o(o,i){return function(t){void 0===t.imagePlaceholder?n.impl.options.imagePlaceholder=e.imagePlaceholder:n.impl.options.imagePlaceholder=t.imagePlaceholder;void 0===t.cacheBust?n.impl.options.cacheBust=e.cacheBust:n.impl.options.cacheBust=t.cacheBust}(i=i||{}),Promise.resolve(o).then(function(t){return function i(e,n,t){if(!t&&n&&!n(e))return Promise.resolve();return Promise.resolve(e).then(r).then(function(t){return o(e,t,n)}).then(function(t){return u(e,t)});function r(t){return t instanceof HTMLCanvasElement?g.makeImage(t.toDataURL()):t.cloneNode(!1)}function o(t,e,n){var r=t.childNodes;return 0===r.length?Promise.resolve(e):o(e,g.asArray(r),n).then(function(){return e});function o(e,t,n){var r=Promise.resolve();return t.forEach(function(t){r=r.then(function(){return i(t,n)}).then(function(t){t&&e.appendChild(t)})}),r}}function u(f,d){return d instanceof Element?Promise.resolve().then(t).then(e).then(n).then(r).then(function(){return d}):d;function t(){function t(t,e){var n,r;t.cssText?e.cssText=t.cssText:(n=t,r=e,g.asArray(n).forEach(function(t){r.setProperty(t,n.getPropertyValue(t),n.getPropertyPriority(t))}))}t(window.getComputedStyle(f),d.style)}function e(){function e(t){var e,n,r,o,i,u,c,a,h=window.getComputedStyle(f,t),l=h.getPropertyValue("content");function s(t){return t+": "+r.getPropertyValue(t)+(r.getPropertyPriority(t)?" !important":"")}""!==l&&"none"!==l&&(e=g.uid(),d.className=d.className+" "+e,(n=document.createElement("style")).appendChild((c="."+e+":"+t,a=(u=h).cssText?(i=(o=o=u).getPropertyValue("content"),o.cssText+" content: "+i+";"):(r=u,g.asArray(r).map(s).join("; ")+";"),document.createTextNode(c+"{"+a+"}"))),d.appendChild(n))}[":before",":after"].forEach(function(t){e(t)})}function n(){f instanceof HTMLTextAreaElement&&(d.innerHTML=f.value),f instanceof HTMLInputElement&&d.setAttribute("value",f.value)}function r(){d instanceof SVGElement&&(d.setAttribute("xmlns","http://www.w3.org/2000/svg"),d instanceof SVGRectElement&&["width","height"].forEach(function(t){var e=d.getAttribute(t);e&&d.style.setProperty(t,e)}))}}}(t,i.filter,!0)}).then(function(e){i.bgcolor&&(e.style.backgroundColor=i.bgcolor);i.width&&(e.style.width=i.width+"px");i.height&&(e.style.height=i.height+"px");i.style&&Object.keys(i.style).forEach(function(t){e.style[t]=i.style[t]});return e}).then(function(t){return e=t,n=i.width||g.width(o),r=i.height||g.height(o),Promise.resolve(e).then(function(t){return t.setAttribute("xmlns","http://www.w3.org/1999/xhtml"),(new XMLSerializer).serializeToString(t)}).then(g.escapeXhtml).then(function(t){return'<foreignObject x="0" y="0" width="100%" height="100%">'+t+"</foreignObject>"}).then(function(t){return'<svg xmlns="http://www.w3.org/2000/svg" width="'+n+'" height="'+r+'">'+t+"</svg>"}).then(function(t){return"data:image/svg+xml;charset=utf-8,"+t});var e,n,r})}"undefined"!=typeof module?module.exports=n:t.domtoimage=n}(this);
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    const iframedoc = iframe.contentDocument || iframe.contentWindow.document;
    iframedoc.body.innerHTML = "${img_html}";
    const blobToBase64 = (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise((resolve) => {
            reader.onloadend = () => {
                resolve(reader.result);
            };
        });
    };
    setTimeout(function () {
        domtoimage.toBlob(iframedoc.body).then(async (blob) => {
            completion(await blobToBase64(blob));
        });
    }, 1);
  `;

  const imageView = new WebView()
  const base64Image = await imageView.evaluateJavaScript(img_js, true);
  const imgReqBq = await new Request(base64Image);
  const imgBq = await imgReqBq.loadImage();
//   imgBq.size = new Size(0,36)

  tempIconStack.addImage(imgBq)

  let temp_stack=infoStack.addStack()
  temp_stack.addSpacer()
  let summary=temp_stack.addText(forecastInfo.summary)
  summary.font=Font.semiboldSystemFont(16)
  infoStack.addSpacer(10)

  temp_stack=infoStack.addStack()
  temp_stack.addSpacer()
  let precip=temp_stack.addText(forecastInfo.precip)
  precip.font=Font.systemFont(14)
  temp_stack=infoStack.addStack()
  temp_stack.addSpacer()
  let hum=temp_stack.addText(forecastInfo.humidity)
  hum.font=Font.systemFont(14)
  temp_stack=infoStack.addStack()
  temp_stack.addSpacer()
  let wind=temp_stack.addText(forecastInfo.wind)
  wind.font=Font.systemFont(14)
  


  let froggie = imageStack.addImage(await new Request(getFroggieURL(html)).loadImage())
  froggie.centerAlignImage()
  froggie.applyFittingContentMode()

  listWidget.setPadding(0,0,0,0)
  textStack.setPadding(15,25,0,5)
  return listWidget
}

let widget = await createWidget()

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  widget.presentMedium()
}

Script.complete()
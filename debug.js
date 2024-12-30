// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;

let widget = new ListWidget()

const webView = new WebView()

let city = args.widgetParameter
let url= "https://www.google.com/search?q=weather";
if (city!==null) {url=url+`+${city}`}

const request = new Request(url)
request.method = 'GET'
request.headers = {'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'}
let webview = new WebView()
await webview.loadRequest(request)

let js = `
var divtop = document.querySelector('div[jsname="cyEywf"]')
log(divtop.innerHTML)
`
let txt = await webview.evaluateJavaScript(js)

widget.addText("hi")

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  // widget.presentLarge()

}

Script.complete()
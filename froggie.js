// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: frog;

const Base64ToImage = await importModule('Base64ToImage')
const black = new Color("000000")
const white = new Color("FFFFFF")

async function getWeatherHTML(city) {
  let url= "https://www.google.com/search?q=weather";
  if (city!==null) {url=url+`+${city}`}

  const request = new Request(url)
  request.method = 'GET'
  request.headers = {'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.10'}
  let webview = new WebView()
  await webview.loadRequest(request)
  return webview
}

function getFroggieURL(html) {
  return html.match(/https:\/\/ssl\.gstatic\.com\/weather\/froggie\/l\/[^\.]+\.png/gm)[0]
}

function getGradientColors(html) {
  c = /background:linear-gradient\(#(.{6}) 10%, #(.{6}) 100%\)/gm.exec(html)
  return [new Color(c[1]),new Color(c[2])]
}

async function getForecastInfo(webview) {
  let js = `
  var weatherInfo = document.querySelector('.iajBOd')
  var res = {
    temp: weatherInfo.querySelector('.AZovPc > div:nth-child(1)').innerHTML,
    feelsLike: weatherInfo.querySelector('span.mPUmSe > div:nth-child(1)').innerHTML,
    location: document.querySelector('span.BBwThe').innerHTML,
    image: weatherInfo.querySelector('.lP6sWe > g-img:nth-child(2) > img:nth-child(1)').src,
    summary: weatherInfo.querySelector('.crimBc').innerHTML,
    precip: "Precip: " + weatherInfo.querySelector('div.mPUmSe:nth-child(2) > span:nth-child(2)').innerHTML,
    humidity: "Humidity: " + weatherInfo.querySelector('.TEk95b > div:nth-child(3) > span:nth-child(2)').innerHTML,
    wind: "Wind: " + weatherInfo.querySelector('.TToly').innerHTML
  }
  res
  `
  let res = await webview.evaluateJavaScript(js)
  return res
}

async function addWeatherTiles(widget,html,num) {

  const carouselHTML = /<g-scrolling-carousel[^>]+jsname="wFMUUc" jscontroller="pgCXqb"[^>]+>(.*?)<\/g-scrolling-carousel>/gm.exec(html)[1]
  const innerCardOpen = [...carouselHTML.matchAll(/<g-inner-card[^>]+>/gm)]
  const innerCardClose = [...carouselHTML.matchAll(/<\/g-inner-card>/gm)]

  let innerCardHTML="",timeStr="",tempStr="",imgStr=""

  for (let idx=0; idx<num; idx++){
    log(`creating weather tile ${idx}`)
    innerCardHTML = carouselHTML.slice(innerCardOpen[idx].index,innerCardClose[idx].index)
    timeStr = /<div class="Qsy6Jf fUr1zf">(.*?)<\/div>/gm.exec(innerCardHTML)[1]
    tempStr = /<div jscontroller="ZWq8q" data-c="(.*?)"/gm.exec(innerCardHTML)[1]
    imgStr = /<g-img><img[^>]+src="([^"]+)/gm.exec(innerCardHTML)[1]


    const stack = widget.addStack()
    stack.layoutVertically()

    stack.addSpacer()

    let hstack = stack.addStack()
    hstack.addSpacer()
    let text = hstack.addText(timeStr)
    text.textColor = black
    text.font = Font.systemFont(12)
    hstack.addSpacer()

    stack.addSpacer()

    hstack = stack.addStack()
    hstack.addSpacer()
    hstack.addImage(await Base64ToImage(imgStr))
    hstack.addSpacer()

    stack.addSpacer()

    hstack = stack.addStack()
    hstack.addSpacer()
    text = hstack.addText(tempStr)
    text.textColor = black
    text.font = Font.semiboldSystemFont(14)
    hstack.addSpacer()

    stack.addSpacer()

    widget.addSpacer()
  }
}

async function createWidget() {
  deviceScreen = Device.screenSize();
  let padding = ((deviceScreen.width - 240) /5)
  let widgetSize = new Size(padding*4 + 240, padding*2 + 120)

  let webview = await getWeatherHTML(args.widgetParameter)

  let listWidget = new ListWidget()
  let overviewStack = listWidget.addStack()
  overviewStack.setPadding(0,0,0,0)
  overviewStack.size = new Size(widgetSize.width,widgetSize.width/2)
  overviewStack.layoutVertically()
  overviewStack.bottomAlignContent()

  let gradient = new LinearGradient()
  let html = await webview.getHTML()
  gradient.colors = getGradientColors(html)
  gradient.locations = [0.1,1]
  overviewStack.backgroundGradient=gradient

  let textStack = overviewStack.addStack()
  overviewStack.addSpacer()
  let imageStack = overviewStack.addStack()
  imageStack.bottomAlignContent()
  imageStack.size = new Size(widgetSize.width,widgetSize.width*(119/720))
  
  
  let summaryStack = textStack.addStack()
  summaryStack.layoutVertically()

  textStack.addSpacer()

  let infoStack = textStack.addStack()
  infoStack.layoutVertically()

  let tempIconStack = summaryStack.addStack()
  tempIconStack.centerAlignContent()

  const forecastInfo = await getForecastInfo(webview)

  let temp = tempIconStack.addText(forecastInfo.temp)
  temp.font=Font.systemFont(36)
  temp.textColor = black
  let feelsLike = summaryStack.addText(forecastInfo.feelsLike)
  feelsLike.font=Font.systemFont(14)
  feelsLike.textColor = black
  let location = summaryStack.addText(forecastInfo.location)
  location.font=Font.systemFont(14)
  location.textColor = black

  const curIcon = await Base64ToImage(forecastInfo.image)
  const icon = tempIconStack.addImage(curIcon)
  icon.imageSize = new Size(36,36)



  let temp_stack=infoStack.addStack()
  temp_stack.addSpacer()
  let summary=temp_stack.addText(forecastInfo.summary)
  summary.font=Font.semiboldSystemFont(16)
  summary.textColor = black
  infoStack.addSpacer(10)

  temp_stack=infoStack.addStack()
  temp_stack.addSpacer()
  let precip=temp_stack.addText(forecastInfo.precip)
  precip.font=Font.systemFont(14)
  precip.textColor = black
  temp_stack=infoStack.addStack()
  temp_stack.addSpacer()
  let hum=temp_stack.addText(forecastInfo.humidity)
  hum.font=Font.systemFont(14)
  hum.textColor = black
  temp_stack=infoStack.addStack()
  temp_stack.addSpacer()
  let wind=temp_stack.addText(forecastInfo.wind)
  wind.font=Font.systemFont(14)
  wind.textColor = black

  let froggie = imageStack.addImage(await new Request(getFroggieURL(html)).loadImage())
  froggie.centerAlignImage()
  froggie.applyFittingContentMode()

  textStack.setPadding(20,20,0,20)



  if (config.widgetFamily==='large'||!config.runsInWidget) {
    let forecastStack=listWidget.addStack()
    forecastStack.size = new Size(widgetSize.width,widgetSize.width/2)
    forecastStack.setPadding(0,20,20,20)
    forecastStack.backgroundColor = white

    await addWeatherTiles(forecastStack, html, 5)
  } else {
    overviewStack.size = new Size(widgetSize.width,widgetSize.height)
  }

  return listWidget
}

let widget = await createWidget()

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  widget.presentLarge()
}

Script.complete()
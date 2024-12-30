// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
// Google Weather URL (replace 'q' parameter with your city or region)
const LOCATION = "New York";
const GOOGLE_WEATHER_URL = `https://www.google.com/search?q=weather+${encodeURIComponent(LOCATION)}`;

// iPhone user-agent
const USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";

// Create the widget
let widget = await createWeatherWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
  Script.complete();
} else {
  widget.presentMedium();
}

// Function to create the weather widget
async function createWeatherWidget() {
  let widget = new ListWidget();
  widget.setPadding(10, 10, 10, 10);
  widget.backgroundColor = new Color("#1c1c1e");

  try {
    // Fetch screenshot of weather data
    let image = await fetchWeatherScreenshot();

    // Add screenshot to widget
    let imgWidget = widget.addImage(image);
    imgWidget.centerAlignImage();

  } catch (error) {
    let errorText = widget.addText(error.message || "Failed to load weather data.");
    errorText.font = Font.systemFont(14);
    errorText.textColor = Color.red();
    errorText.centerAlignText();
  }

  return widget;
}

// Function to fetch a screenshot of the weather page
async function fetchWeatherScreenshot() {
  let req = new Request(GOOGLE_WEATHER_URL);
  req.headers = { "User-Agent": USER_AGENT };
  req.responseType = "image"; // Fetch the response as an image
  return await req.loadImage();
}
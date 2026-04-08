// weather.js

// Secret key that authorizes the app to talk to Google's servers
const GOOGLE_WEATHER_KEY = "AIzaSyBxAE9Ze_HcgZMvduIalQiC11hGOp3N5NM";

// Function that sends the phone's GPS coordinates to Google to get the current weather
export const getBeforeIGoWeather = async (lat, lon) => {
  // The specific address for Google's weather database, including the coordinates and unit system
  const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_WEATHER_KEY}&location.latitude=${lat}&location.longitude=${lon}&unitsSystem=IMPERIAL`;

  try {
    // Sends the request over the internet and waits for a response
    const response = await fetch(url);
    // Turns the raw response data into a readable JavaScript object
    const data = await response.json();

    // Organizes the specific data pieces needed for the app's screen
    return {
      // Rounds the temperature to the nearest whole number (e.g., 63.4 becomes 63)
      temp: Math.round(data.temperature.degrees),
      // Pulls the humidity percentage directly from the report
      humidity: data.relativeHumidity,
      // Pulls the official chance of rain (0 to 100); defaults to 0 if missing
      precipProb: data.precipitation?.probability?.percent || 0,
      // Captures the text description of the weather, like "Mostly Cloudy"
      description: data.weatherCondition?.description?.text || "Clear",
      // Converts that description to lowercase for the app's icon-switching logic
      conditionText:
        data.weatherCondition?.description?.text.toLowerCase() || "",
      // Pulls the current UV index rating
      uv: data.uvIndex || 0,
    };
  } catch (error) {
    // If the internet is down or the key fails, logs the error so I can fix it
    console.error("Google Weather fetch failed:", error);
    // Returns nothing so the app doesn't crash from empty data
    return null;
  }
};

// weather.js (Dynamic State & Assets Version)

const GOOGLE_WEATHER_KEY = "AIzaSyBxAE9Ze_HcgZMvduIalQiC11hGOp3N5NM";

export const getBeforeIGoWeather = async (lat, lon) => {
  const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_WEATHER_KEY}&location.latitude=${lat}&location.longitude=${lon}&unitsSystem=IMPERIAL`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) return null;

    const isDay = data.isDaytime;
    const temp = data.temperature?.degrees ?? 70;
    const precipVal = data.precipitation?.probability?.percent ?? 0;
    const rawDescription =
      data.weatherCondition?.description?.text?.toLowerCase() || "clear";

    // --- Define the DEFAULT (Normal) State ---
    let proactiveData = {
      isCritical: false, // Normal operation
      iconSymbol: "weather-cloudy",
      theme: "default",
      alertTitle: "Departure Protocol",
      alertBodyDetailed:
        "Intelligent security sync active. Check standard essentials.",
      extraItems: [],
      itemImage: null,
    };

    // --- FORCED SOLID LOGIC for normal state icons ---
    const isCloudy =
      rawDescription.includes("cloud") || rawDescription.includes("overcast");
    if (isDay) {
      if (
        rawDescription.includes("clear") ||
        rawDescription.includes("sunny")
      ) {
        proactiveData.iconSymbol = "weather-sunny";
      } else {
        proactiveData.iconSymbol = "weather-cloudy";
      }
    } else {
      // Nighttime Logic
      if (isCloudy) {
        proactiveData.iconSymbol = "weather-partly-cloudy";
      } else {
        proactiveData.iconSymbol = "weather-night";
      }
    }

    // ==========================================
    // --- INTEL LOGIC & ASSET MAPPING START ---
    // ==========================================

    // SCENARIO 1: Rain Expected (High precipitation)
    if (precipVal > 40 || data.weatherCondition?.type?.includes("RAIN")) {
      proactiveData = {
        ...proactiveData,
        isCritical: true,
        theme: "rainy",
        iconSymbol: "weather-pouring",
        alertTitle: "Precipitation Protocol",
        alertBodyDetailed:
          "Rain is imminent. Deployment of protective gear is recommended.",
        extraItems: ["Umbrella", "Rain Shell"],
        itemImage: require("./assets/images/umbrella.jpg"),
      };
    }

    // SCENARIO 2: Cold Weather (Jacket - Under 40°F)
    else if (temp < 40) {
      proactiveData = {
        ...proactiveData,
        isCritical: true,
        theme: "cold",
        iconSymbol: "weather-snowflake",
        alertTitle: "Cold Weather Advisory",
        alertBodyDetailed:
          "Sub-optimal thermal conditions. Heavy insulation required.",
        extraItems: ["Jacket", "Coat"],
        itemImage: require("./assets/images/jacket.jpg"),
      };
    }

    // SCENARIO 3: Cool Weather (Long Sleeve Shirt - 60°F or less)
    else if (temp <= 60) {
      proactiveData = {
        ...proactiveData,
        isCritical: true,
        theme: "cool",
        iconSymbol: "tshirt-crew",
        alertTitle: "Thermal Advisory",
        alertBodyDetailed:
          "Temperature is 60°F or below. Long sleeves are recommended for comfort.",
        extraItems: ["Long Sleeve Shirt"],
        itemImage: require("./assets/images/longsleeve.jpg"),
      };
    }

    // SCENARIO 4: Sunny with High UV (Threshold lowered to 2 for Houston testing)
    else if (isDay && (data.uvIndex > 2 || rawDescription.includes("sunny"))) {
      proactiveData = {
        ...proactiveData,
        isCritical: true,
        theme: "uv_alert",
        iconSymbol: "weather-sunny",
        alertTitle: "Radiation Advisory (UV)",
        alertBodyDetailed:
          "UV levels are elevated. Dermal protection (sunscreen) is critical today.",
        extraItems: ["Sunscreen 50", "Sunglasses"],
        itemImage: require("./assets/images/sunscreen.jpg"),
      };
    }

    // Return the specific protocol data along with the raw numbers
    return {
      temp: Math.round(temp),
      humidity: data.relativeHumidity || 0,
      description: data.weatherCondition?.description?.text || "Clear",
      uv: data.uvIndex || 0,
      precipitation: precipVal,
      ...proactiveData,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

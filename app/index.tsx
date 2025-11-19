import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

// ============ SOMETHING ============
interface WeatherData {
  dt: number;
  name: string;
  sys: { country: string }
  weather: [{ description: string, icon: string }]
  main: { temp: number, temp_min: number, temp_max: number, humidity: number }
  wind: { speed: number }
}

interface ForecastData {
  dt: number;
  weather: [{ icon: string }]
  main: { temp: number, temp_min: number, temp_max: number }
}

const Icons: Record<string, any> = {
  // Day
  "01d": require("../assets/images/01d.png"),   // Clear sky
  "02d": require("../assets/images/02d.png"),   // Few Clouds
  "03d": require("../assets/images/03.png"),    // Scattered Clouds
  "04d": require("../assets/images/04.png"),    // Broken Clouds
  "09d": require("../assets/images/10.png"),    // Shower Rain
  "10d": require("../assets/images/10.png"),    // Rain
  "11d": require("../assets/images/11.png"),    // Thunderstorm
  "13d": require("../assets/images/13.png"),    // Snow
  "50d": require("../assets/images/50.png"),    // Mist

  // Night
  "01n": require("../assets/images/01n.png"),   // Clear sky
  "02n": require("../assets/images/02n.png"),   // Few Clouds
  "03n": require("../assets/images/03.png"),    // Scattered Clouds
  "04n": require("../assets/images/04.png"),    // Broken Clouds
  "09n": require("../assets/images/10.png"),    // Shower Rain
  "10n": require("../assets/images/10.png"),    // Rain
  "11n": require("../assets/images/11.png"),    // Thunderstorm
  "13n": require("../assets/images/13.png"),    // Snow
  "50n": require("../assets/images/50.png"),    // Mist     
}

// ============ SOMETHING ============
export default function Index() {

  const apiKey = process.env.API_KEY;

  const [city, setCity] = useState("London");
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWeatherData = async (cityName: string) => {
    // Fetch data
    try {
      setLoading(true)
      setError("")

      // Weather data
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();
      setWeather(weatherData)

      // Forecast data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();
      
      const dailyForecast = forecastData.list.filter(
        (_: any, index: number) => index % 8 === 0
        // Updates every 3 hours, get 1 per day: 3 hours × 8 = 24 hours
      );
      setForecast(dailyForecast);

    } catch (error) {
      setError("Couldn't fetch data at the moment. Please try again!");
      console.log(error);

    } finally {
      setLoading(false);
    }
  };

  // Fetch data every time the city changes
  useEffect(() => {
    fetchWeatherData(city);
  }, [city]);

  // Fetch data every time 'search' is initiated
  function handleSearch() {
    fetchWeatherData(search);
    setSearch("");
  }

  // When setLoading(true)
  if (loading)
    return (
      <Text>Loading...</Text>
  );

  // ============ JSX ============
  return (
    <ScrollView contentContainerStyle={{
      justifyContent: "center",
      alignItems: "center",
      }}>

      {/* Search bar */} 
      <View style={styles.searchForm}>
        <Image alt="search-icon" source={ require("../assets/images/search-icon.png")} />
        <TextInput
          onChangeText={text => setSearch(text)}
          value={search}
          style={styles.searchInput}
          placeholder="Search for a city"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          underlineColorAndroid="rgba(0, 0, 0, 0)"
          selectionColor="rgba(0, 0, 0, 0)"
        />
      </View>

      {/* Error */}
      {error && 
        <Text>{error}</Text>
      }

      {/* Weather data */}
      {weather && (
        <>
          <View style={styles.header}>
            <Text style={styles.location}>{weather.name}, {weather.sys.country}</Text>
            <Text style={styles.update}>Last Updated: {new Date(weather.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>

          <View style={styles.weather}>
            <View style={styles.weatherSimple}>
              <Text style={styles.temp}>{Math.round((weather.main.temp - 273.15))}</Text>
              <Text style={styles.tempSymbol}>°</Text>
              <View style={styles.weatherDetailed}>
                <Text style={styles.condition}>{weather.weather[0].description}</Text>
                <Text style={styles.minMaxTemp}>▲ {Math.round((weather.main.temp - 273.15))}°</Text>
                <Text style={styles.minMaxTemp}>▼ {Math.round((weather.main.temp - 273.15))}°</Text>
              </View>
            </View>
          </View>

          <Image style={styles.conditionImage} alt={weather.weather[0].description} source={ Icons[weather.weather[0].icon] || "01d.png" } />
        </>
      )}

      {/* Forecast data */}

    </ScrollView>
  );
}

// ============ STYLING ============
const styles = StyleSheet.create ({
  searchForm: {
    maxWidth: "40%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    margin: 10,
    padding: 5,
    borderRadius: 100,
    boxShadow: [{
      offsetX: 0,
      offsetY: 0,
      blurRadius: 10,
      color: "rgba(0, 0, 0, 0.2)",
    }],
  },
  searchInput: {
    fontFamily: "GlacialIndifference-Regular",
    fontSize: 10,
    textAlign: "center",
    flex: 1,
  },
  header: {
    alignItems: "center",
    margin: 10,
  },
  location: {
    fontFamily: "LeagueSpartan",
    fontWeight: "bold",
    fontSize: 20,
    textTransform: "uppercase",
  },
  update: {
    fontFamily: "GlacialIndifference-Regular",
    letterSpacing: 1.5,
    fontSize: 12,
    marginTop: 5,
    color: "rgba(0, 0, 0, 0.5)",
  },
  weather: {
    alignItems: "center",
  },
  weatherSimple: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
  },
  temp: {
    fontFamily: "LeagueSpartan",
    fontSize: 96,
    fontWeight: "bold",
    lineHeight: 1,
  },
  tempSymbol: {
    fontFamily: "LeagueSpartan",
    fontSize: 128,
    fontWeight: "regular",
    marginRight: 20,
  },
  weatherDetailed: {
    flexWrap: "wrap",
    alignItems: "flex-start",
    width: 100,

  },
  condition: {
    fontFamily: "LeagueSpartan",
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "capitalize",
    textAlign: "left",
    marginBottom: 5,
  },
  minMaxTemp: {
    fontFamily: "GlacialIndifference-Regular",
    fontSize: 14,
    margin: 0,
  },
  conditionImage: {
    width: 200,
    margin: 20,
    resizeMode: "contain",
  }
})
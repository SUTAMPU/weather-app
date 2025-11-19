import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

// ============ TYPES ============
interface WeatherData {
  dt: number;
  name: string;
  visibility: number;
  sys: { country: string }
  weather: [{ description: string, icon: string }]
  main: { temp: number, temp_min: number, temp_max: number, humidity: number }
  wind: { speed: number }
}

interface ForecastData {
  dt: number;
  weather: [{ description: string, icon: string }]
  main: { temp: number, temp_min: number, temp_max: number }
}

// ============ ICONS ============
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

// ============ MAIN COMPONENT ============
export default function Index() {

  const apiKey = process.env.EXPO_PUBLIC_API_KEY;

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

  // ============ JSX ============
  return (
    <ScrollView contentContainerStyle={{
      alignItems: "center"
      }}>

      {/* Search bar */} 
      <View style={styles.searchForm}>
        <Image style={styles.searchIcon} alt="search-icon" source={ require("../assets/images/search-icon.png")} />
        <TextInput
          onChangeText={text => setSearch(text)}
          onSubmitEditing={() => handleSearch()}
          value={search}
          style={styles.searchInput}
          placeholder="Search for a city"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          underlineColorAndroid="rgba(0, 0, 0, 0)"
          selectionColor="rgba(0, 0, 0, 1)"
        />
      </View>

      {/* Error */}
      {error && (
        <View>
          <Text style= {{ fontFamily: "LeagueSpartan-Regular" }}>{error}</Text>
        </View>
      )
      }

      {/* Loading */}
      {loading && (
        <View>
          <Text style= {{ fontFamily: "LeagueSpartan-Regular" }}>Loading...</Text>
        </View>
      )}

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

          <View style={styles.otherDetails}>
            <View style={styles.detail}>
              <Text style={styles.detailData}>{weather.wind.speed}m/s</Text>
              <Text style={styles.detailHead}>Wind Speed</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailData}>{weather.main.humidity}%</Text>
              <Text style={styles.detailHead}>Humidity</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailData}>{Math.round(weather.visibility / 1000) / 10}km</Text>
              <Text style={styles.detailHead}>Visibility</Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.separator}>
        <Image alt="separator-icon" source={ require("../assets/images/separator-icon.png")}/>
        <View style={styles.separatorLine}></View>
      </View>

      {/* Forecast data */}
      {forecast.length > 0 && (
        <>
          <View style={styles.forecast}>
            {forecast.map((day, index) => (
              <View key={index} style={styles.forecastDetails}>
                <Text style={styles.forecastDay}>{new Date(day.dt * 1000).toLocaleDateString('en-Us', { weekday: 'long' })}</Text>
                <Image style={styles.forecastImage} alt={day.weather[0].description} source={ Icons[day.weather[0].icon] || "01d.png" }/>
                <View style={styles.forecastTemp}>
                  <Text style={styles.forecastMinMaxTemp}>{Math.round((day.main.temp_max - 273.15))}°C</Text>
                  <Text style={styles.forecastMinMaxTemp}> | </Text>
                  <Text style={styles.forecastMinMaxTemp}>{Math.round((day.main.temp_min - 273.15))}°C</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

    </ScrollView>
  );
}

// ============ STYLING ============
const styles = StyleSheet.create ({
  searchForm: {
    width: "40%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    margin: 10,
    marginTop: 20,
    padding: 5,
    borderRadius: 100,
    boxShadow: [{
      offsetX: 0,
      offsetY: 0,
      blurRadius: 10,
      color: "rgba(0, 0, 0, 0.2)",
    }],
  },
  searchIcon: {
    flex: 0,
    width: 12,
    height: 12,
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
    fontFamily: "LeagueSpartan-Bold",
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
    margin: 0,
  },
  weatherSimple: {
    flexDirection: "row",
    alignItems: "center",
    margin: 0,
  },
  temp: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 96,
  },
  tempSymbol: {
    fontFamily: "LeagueSpartan-Regular",
    fontSize: 128,
    marginRight: 10,
  },
  weatherDetailed: {
    flexWrap: "wrap",
    alignItems: "flex-start",
    width: 100,
  },
  condition: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 24,
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
    width: 175,
    height: 175,
    margin: 20,
    resizeMode: "contain",
  },
  otherDetails: {
    flexDirection: "row",
    gap: 20,
    margin: 0,
  },
  detail: {
    alignItems: "center",
  },
  detailData: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 20,
  },
  detailHead: {
    fontFamily: "GlacialIndifference-Regular",
    fontSize: 12,
    letterSpacing: 1.5,
    color: "rgba(0, 0, 0, 0.5)",
  },
  separator: {
    width: "70%",
    alignItems: "center",
    margin: 30,
  },
  separatorLine: {
    width: "100%",
    height: 10,
    backgroundColor: "black",
    borderRadius: 10,
  },
  forecast: {
    width: "80%",
    alignContent: "center"
  },
  forecastDetails: {
    flexDirection: "row",
    marginBottom: 10,
  },
  forecastDay: {
    flex: 1,
    fontFamily: "GlacialIndifference-Regular",
    fontSize: 15,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  forecastImage: {
    flex: 1,
    width: 20,
    height: 20,
    resizeMode: "contain",
    alignSelf: "center",
  },
  forecastTemp: {
    flex: 1,
    flexDirection: "row",
  },
  forecastMinMaxTemp: {
    fontFamily: "GlacialIndifference-Regular",
    fontSize: 15,
    letterSpacing: 1.5,
    justifyContent: "flex-end",
  },
})
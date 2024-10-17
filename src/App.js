import React, { useState, useEffect, useContext } from 'react';
import { DateTime } from 'luxon';
import SearchAndDisplay from './components/SearchAndDisplay';
import WeatherChart from './components/WeatherChart';
import WeeklyForecast from './components/WeeklyForecast';
import { getCoordinates } from './services/GeocodingService';
import { getWeatherData } from './services/WeatherService';
import './App.css'
import { DarkModeProvider, DarkModeContext } from './darkMode/DarkModeContext';
import DarkModeToggle from './darkMode/DarkModeToggle';
import { saveCoordinates, loadCoordinates, saveCityName, loadCityName } from './services/OfflineSettingsService';
import { getWeatherIcon } from './services/getWeatherIcon';
import { loadMapVisibility, saveMapVisibility } from './services/OfflineSettingsService';
import WeatherBackground from './components/WeatherBackground';
import axios from 'axios';
import ForecastSelectionService from './services/ForecastSelectionService';

function AppContent() {
  const { savedCoordinates } = useContext(DarkModeContext);
  const [coordinates, setCoordinates] = useState(savedCoordinates);
  const [weatherData, setWeatherData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('');
  const [weatherIcon, setWeatherIcon] = useState('');
  const [isMapVisible, setIsMapVisible] = useState(loadMapVisibility());
  const [timezone, setTimezone] = useState('UTC');


  const [currentWeather, setCurrentWeather] = useState({
    cloudCover: 0,
    precipAmount: 0,
    solarRadiation: 0,
    windSpeed: 0,
    windDirection: 0,
  });

  useEffect(() => {
    const handlePageLoad = async () => {
      const coord = loadCoordinates();
      const savedCityName = loadCityName();
      if (savedCityName) {
        handleSearch(null, null, null, savedCityName);
      } else if (coord) {
        handleSearch(null, coord.latitude, coord.longitude, null);
      }
    };
    handlePageLoad();
  }, []);

  useEffect(() => {
    const updateSelectedDay = () => {
      const newSelectedDay = ForecastSelectionService.getSelectedForecast();
      if (newSelectedDay !== selectedDay) {
        setSelectedDay(newSelectedDay);
        console.log('Selected day changed:', newSelectedDay);
      }
    };

    // Initial den ausgewählten Tag setzen
    updateSelectedDay();

    // Einen Intervall einrichten, um regelmäßig zu prüfen, ob sich der ausgewählte Tag geändert hat
    const interval = setInterval(updateSelectedDay, 100);

    // Aufräumen beim Unmounten der Komponente
    return () => clearInterval(interval);
  }, [selectedDay]);

  // Zusätzlicher useEffect, um Änderungen von selectedDay zu loggen

  const toggleMapVisibility = () => {
    const newVisibility = !isMapVisible;
    setIsMapVisible(newVisibility);
    saveMapVisibility(newVisibility);
  };

  const handleSearch = async (e, lat, lon, query) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    ForecastSelectionService.setSelectedForecast(null);
    try {
      let coords;
      let newCityName = '';
      if (lat !== null && lon !== null) {
        coords = { latitude: lat, longitude: lon };
      } else if (query) {
        coords = await getCoordinates(query);
        newCityName = query;
      } else {
        throw new Error('Keine gültigen Suchparameter');
      }

      // Zeitzone basierend auf Koordinaten ermitteln
      const tz = await fetchTimezone(coords.latitude, coords.longitude);
      setTimezone(tz);
      setCoordinates(coords);
      setCityName(newCityName);
      saveCoordinates(coords);
      saveCityName(newCityName);

      const weather = await getWeatherData(coords.latitude, coords.longitude);
      // Wetterdaten mit der korrekten Zeitzone verarbeiten
      const processedHourlyData = processHourlyData(weather.hourly, tz);
      const processedDailyData = processDailyData(weather.daily, tz);

      setWeatherData(processedHourlyData);
      setDailyData(processedDailyData);

      // Aktuelle Stunde ermitteln
      const currentHour = DateTime.now().setZone(tz).hour;

      // Aktuelle Wetterdaten setzen
      setCurrentWeather({
        cloudCover: processedHourlyData.cloudcover[currentHour],
        precipAmount: processedHourlyData.precipitation[currentHour],
        solarRadiation: processedHourlyData.direct_radiation[currentHour],
        windSpeed: processedHourlyData.windspeed_10m[currentHour],
        windDirection: processedHourlyData.winddirection_10m[currentHour],
        snowfall: processedHourlyData.snowfall[currentHour],
      });

      const newIcon = getWeatherIcon(
        weather.daily.cloudcover_mean[0],
        weather.daily.precipitation_probability_mean[0],
        weather.daily.temperature_2m_mean[0],
        weather.daily.precipitation_sum[0],
        weather.daily.weathercode[0],
        weather.daily.snowfall_sum[0]
      );


      setWeatherIcon(newIcon);
      setError(null);
    } catch (err) {
      setError('Fehler beim Abrufen der Daten: ' + err.message);
      setCoordinates(null);
      setWeatherData(null);
      setDailyData(null);
      setCurrentWeather({
        cloudCover: 0,
        precipAmount: 0,
        solarRadiation: 0,
        windSpeed: 0,
        windDirection: 0,
        snowfall: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };



  const fetchTimezone = async (latitude, longitude) => {
    const url = `https://timeapi.io/api/TimeZone/coordinate?latitude=${latitude}&longitude=${longitude}`;

    try {
      const response = await axios.get(url);
      if (response.data && response.data.timeZone) {
        return response.data.timeZone;
      } else {
        console.error('Unerwartetes Antwortformat:', response.data);
        return 'UTC'; // Fallback auf UTC
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Zeitzone:', error);
      return 'UTC'; // Fallback auf UTC im Fehlerfall
    }
  };



  const processHourlyData = (hourlyData, timezone) => {
    return {
      ...hourlyData,
      time: hourlyData.time.map(time =>
        DateTime.fromISO(time).setZone(timezone).toFormat('yyyy-MM-dd\'T\'HH:mm')
      )
    };
  };

  const processDailyData = (dailyData, timezone) => {
    return {
      ...dailyData,
      time: dailyData.time.map(time =>
        DateTime.fromISO(time).setZone(timezone).toFormat('yyyy-MM-dd')
      )
    };
  };

  return (
    <div className="App">
      <WeatherBackground
        weatherIcon={weatherIcon}
        cloudCover={currentWeather.cloudCover}
        precipAmount={currentWeather.precipAmount}
        solarRadiation={currentWeather.solarRadiation}
        windSpeed={currentWeather.windSpeed}
        windDirection={currentWeather.windDirection}
        timezone={timezone}
        snowfall={currentWeather.snowfall}
      />
      <div className='header'>
        <div className='header_small'>
          <h1>Hello Weather</h1>
          <div className="header-controls">
            <DarkModeToggle />
            <button onClick={toggleMapVisibility}>
              {isMapVisible ? 'Koordinaten ausblenden' : 'Koordinaten einblenden'}
            </button>
          </div>
          <SearchAndDisplay
            handleSearch={handleSearch}
            error={error}
            coordinates={coordinates}
            isLoading={isLoading}
            cityName={cityName}
            isMapVisible={isMapVisible}
          />
        </div>
      </div>
      {isLoading ? (
        <div className="loader"></div>
      ) : (
        weatherData && dailyData && (
          <div className={isLoading ? 'hidden' : 'max_width'}>
            <h2>Aktuelles Wetter: <span>{weatherIcon}</span> {cityName}</h2>
            <WeatherChart hourlyData={weatherData} timezone={timezone} selectedDay={selectedDay} />
            <h2>7-Tage-Vorhersage:</h2>
            <WeeklyForecast dailyData={dailyData} />

          </div>
        )
      )}
    </div>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
}

export default App;

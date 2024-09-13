import React, { useState, useEffect, useContext } from 'react';
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



function AppContent() {
  const { savedCoordinates } = useContext(DarkModeContext);
  const [coordinates, setCoordinates] = useState(savedCoordinates);
  const [weatherData, setWeatherData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('');
  const [weatherIcon, setWeatherIcon] = useState('');
  const [isMapVisible, setIsMapVisible] = useState(loadMapVisibility());

  useEffect(() => {
    const handlePageLoad = async () => {
      const coord = loadCoordinates();
      const savedCityName = loadCityName();
      if (savedCityName) {
        handleSearch(null, null, null, savedCityName);
        setCityName(savedCityName);
      } else if (coord) {
        handleSearch(null, coord.latitude, coord.longitude, null);
      }
    };
    handlePageLoad(); // Führt die Funktion beim ersten Rendern aus
    window.addEventListener('load', handlePageLoad);
    // Aufräumfunktion
    return () => {
      window.removeEventListener('load', handlePageLoad);
    };
  }, []); // Leeres Abhängigkeitsarray bedeutet, dass dieser Effekt nur einmal beim Mounten ausgeführt wird

  const toggleMapVisibility = () => {
    const newVisibility = !isMapVisible;
    setIsMapVisible(newVisibility);
    saveMapVisibility(newVisibility);
  };
  
  const handleSearch = async (e, lat, lon, query) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
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
      setCoordinates(coords);
      setCityName(newCityName);
      saveCoordinates(coords);
      saveCityName(newCityName);
      const weather = await getWeatherData(coords.latitude, coords.longitude);
      setWeatherData(weather.hourly);
      setDailyData(weather.daily);
      const newIcon = getWeatherIcon(
        weather.daily.cloudcover_mean[0],
        weather.daily.precipitation_probability_mean[0],
        weather.daily.temperature_2m_mean[0],
        weather.daily.precipitation_sum[0]
      );
      setWeatherIcon(newIcon);
      setError(null);
    } catch (err) {
      setError('Fehler beim Abrufen der Daten: ' + err.message);
      setCoordinates(null);
      setWeatherData(null);
      setDailyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className='header'>
        <div className='max_width'>
          <h1>Hello Weather</h1>
          <div className="header-controls">
            <DarkModeToggle />
            <button onClick={toggleMapVisibility}>
              {isMapVisible ? 'Karte ausblenden' : 'Karte einblenden'}
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
            <WeatherChart hourlyData={weatherData} />
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

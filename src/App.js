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

function AppContent() {
  const { savedCoordinates } = useContext(DarkModeContext);
  const [coordinates, setCoordinates] = useState(savedCoordinates);
  const [weatherData, setWeatherData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('');

  useEffect(() => {
    const handlePageLoad = async () => {
      const coord = loadCoordinates();
      const savedCityName = loadCityName();
      if (savedCityName) {
        
        handleSearch(null, null, null, savedCityName);
        setCityName(savedCityName);
      } else {
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
          <DarkModeToggle />
          <SearchAndDisplay
            handleSearch={handleSearch}
            error={error}
            coordinates={coordinates}
            isLoading={isLoading}
            cityName={cityName}
          />
        </div>
      </div>
      {isLoading ? (
        <div className="loader"></div>
      ) : (
        weatherData && dailyData && (
          <div className={isLoading ? 'hidden' : 'max-width'}>
            <h2>Aktuelles Wetter: {cityName}</h2>
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

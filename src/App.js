import React, { useState, useEffect, useContext } from 'react';
import SearchAndDisplay from './components/SearchAndDisplay';
import WeatherChart from './components/WeatherChart';
import WeeklyForecast from './components/WeeklyForecast';
import { getCoordinates } from './services/GeocodingService';
import { getWeatherData } from './services/WeatherService';
import './App.css'
import { DarkModeProvider, DarkModeContext } from './darkMode/DarkModeContext';
import DarkModeToggle from './darkMode/DarkModeToggle';

function AppContent() {
  const { savedCoordinates, setSavedCoordinates } = useContext(DarkModeContext);
  const [coordinates, setCoordinates] = useState(savedCoordinates);
  const [weatherData, setWeatherData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (savedCoordinates) {
      handleSearch(null, savedCoordinates.latitude, savedCoordinates.longitude);
    }
  }, []);

  const handleSearch = async (e, lat, lon, query) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let coords;
      if (lat !== null && lon !== null) {
        coords = { latitude: lat, longitude: lon };
      } else if (query) {
        coords = await getCoordinates(query);
      } else {
        throw new Error('Keine gültigen Suchparameter');
      }
      setCoordinates(coords);
      setSavedCoordinates(coords);
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
          />
        </div>
      </div>
      {isLoading ? (
        <div className="loader"></div>
      ) : (
        weatherData && dailyData && (
          <div className={isLoading ? 'hidden' : 'max-width'}>
            <h2>Aktuelles Wetter:</h2>
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

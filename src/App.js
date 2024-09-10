import React, { useState } from 'react';
import SearchAndDisplay from './components/SearchAndDisplay';
import WeatherChart from './components/WeatherChart';
import WeeklyForecast from './components/WeeklyForecast';
import { getCoordinates } from './services/GeocodingService';
import { getWeatherData } from './services/WeatherService';

function App() {
  const [coordinates, setCoordinates] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e, lat, lon, query) => {
    if (e) e.preventDefault();
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
      const weather = await getWeatherData(coords.latitude, coords.longitude);
      setWeatherData(weather.hourly);
      setDailyData(weather.daily);      
      setError(null);
    } catch (err) {
      setError('Fehler beim Abrufen der Daten: ' + err.message);
      setCoordinates(null);
      setWeatherData(null);
      setDailyData(null);
    }
  };

  return (
    <div className="App">
      <h1>Hello Weather</h1>
      <SearchAndDisplay 
        handleSearch={handleSearch}
        error={error}
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />
      {weatherData && (
        <div>
          <h2>Aktuelles Wetter:</h2>
          <WeatherChart hourlyData={weatherData} />
          <h2>7-Tage-Vorhersage:</h2>
          <WeeklyForecast dailyData={dailyData} />
        </div>
      )}
    </div>
  );
}

export default App;

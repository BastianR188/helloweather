import React, { useState } from 'react';
import { getCoordinates } from './services/GeocodingService';
import { getWeatherData } from './services/WeatherService';
import SearchAndDisplay from './components/SearchAndDisplay';
import WeatherChart from './components/WeatherChart';

function App() {
  const [query, setQuery] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
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
      setWeatherData(weather);
      setError(null);
    } catch (err) {
      setError('Fehler beim Abrufen der Daten: ' + err.message);
      setCoordinates(null);
      setWeatherData(null);
    }
  };

  return (
    <div className="App">
      <h1>Hello Weather</h1>
      <SearchAndDisplay 
        query={query}
        setQuery={setQuery}
        handleSearch={handleSearch}
        error={error}
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />
      {weatherData && weatherData.hourly && (
        <WeatherChart hourlyData={weatherData.hourly} />
      )}
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import './App.css';
// import SearchBar from './components/SearchBar';
import { getCoordinates } from './services/GeocodingService';
import { getWeatherData } from './services/WeatherService';
import MapComponent from './components/MapComponent';
import 'leaflet/dist/leaflet.css';



function App() {
  const [query, setQuery] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const coords = await getCoordinates(query);
      setCoordinates(coords);
      const weather = await getWeatherData(coords.latitude, coords.longitude);
      setWeatherData(weather);
      setError(null);
    } catch (err) {
      setError('Fehler beim Abrufen der Daten.');
      setCoordinates(null);
      setWeatherData(null);
    }
  };

  return (
    <div className="App">
      <h1>Hello Weather</h1>
      <div>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Stadt oder Adresse eingeben"
          />
          <button type="submit">Suchen</button>
        </form>
          {error && <p className="error">{error}</p>}
          {coordinates && (
            <><div>
              <h2>Koordinaten:</h2>
              <p>Breitengrad: {coordinates.latitude}</p>
              <p>Längengrad: {coordinates.longitude}</p>
            </div><MapComponent latitude={coordinates.latitude} longitude={coordinates.longitude} /></>
          )}
      </div>
      {weatherData && (
        <div>
          <h2>Aktuelles Wetter:</h2>
          <p>Temperatur: {weatherData.current_weather.temperature}°C</p>
          <p>Windgeschwindigkeit: {weatherData.current_weather.windspeed} km/h</p>
        </div>
      )}
    </div>
  );
}

export default App;

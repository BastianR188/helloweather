import React, { useState, useEffect, useContext } from 'react';
import MapComponent from './MapComponent';
import './SearchAndDisplay.css';
import { DarkModeContext } from '../darkMode/DarkModeContext';

function SearchAndDisplay({ handleSearch, error, coordinates, isLoading, cityName }) {
    const [query, setQuery] = useState('');
    const { savedCoordinates } = useContext(DarkModeContext);
    const [lat, setLat] = useState(savedCoordinates ? savedCoordinates.latitude.toFixed(6) : '');
    const [lon, setLon] = useState(savedCoordinates ? savedCoordinates.longitude.toFixed(6) : '');
    const [isQueryChanged, setIsQueryChanged] = useState(false);

    useEffect(() => {
        if (coordinates && !isQueryChanged) {
            setLat(coordinates.latitude.toFixed(6));
            setLon(coordinates.longitude.toFixed(6));
            setQuery(cityName); // Fügen Sie diese Zeile hinzu
        }
    }, [coordinates, isQueryChanged, cityName]); // Fügen Sie cityName zu den Abhängigkeiten hinzu

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
        setLat('');
        setLon('');
        setIsQueryChanged(true);
    };

    const handleLatChange = (e) => {
        setLat(e.target.value);
        setQuery('');
        setIsQueryChanged(false);
    };

    const handleLonChange = (e) => {
        setLon(e.target.value);
        setQuery('');
        setIsQueryChanged(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (lat && lon) {
            handleSearch(null, parseFloat(lat), parseFloat(lon));
        } else if (query) {
            handleSearch(null, null, null, query);
        }
        setIsQueryChanged(false);
    };

    const handleLocationChange = (newPosition) => {
        const newLat = newPosition[0].toFixed(6);
        const newLon = newPosition[1].toFixed(6);
        setLat(newLat);
        setLon(newLon);
        setQuery('');
        setIsQueryChanged(false);
        handleSearch(null, parseFloat(newLat), parseFloat(newLon));
    };

    return (
        <div className='main'>
            <form onSubmit={handleSubmit}>
                <input
                    className='input'
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    placeholder="Stadt, PLZ oder Adresse eingeben"
                    disabled={isLoading}
                />

                <button type="submit" disabled={isLoading}>
                    Suchen
                </button>
            </form>
            {error && <p className="error">{error}</p>}
            {coordinates && (
                <div className='container'>
                    <div style={{ marginRight: '20px' }}>
                        <h2>Koordinaten:</h2>
                        <p>Breitengrad:
                            <input
                                className='input_coord'
                                type="number"
                                value={lat}
                                onChange={handleLatChange}
                                placeholder="Breitengrad"
                                step="any"
                                disabled={isLoading}
                            />
                        </p>
                        <p>Längengrad:
                            <input
                                className='input_coord'
                                type="number"
                                value={lon}
                                onChange={handleLonChange}
                                placeholder="Längengrad"
                                step="any"
                                disabled={isLoading}
                            /></p>
                    </div>
                    <MapComponent
                        latitude={coordinates.latitude}
                        longitude={coordinates.longitude}
                        onLocationChange={handleLocationChange}
                    />
                </div>
            )}
        </div>
    );
}

export default SearchAndDisplay;

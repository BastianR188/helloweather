import React, { useState, useEffect, useContext, useRef } from 'react';
import MapComponent from './MapComponent';
import './SearchAndDisplay.css';
import { DarkModeContext } from '../darkMode/DarkModeContext';
import { CSSTransition } from 'react-transition-group';


function SearchAndDisplay({ handleSearch, error, coordinates, isLoading, cityName, isMapVisible }) {
    const [query, setQuery] = useState('');
    const { savedCoordinates } = useContext(DarkModeContext);
    const [lat, setLat] = useState(savedCoordinates ? savedCoordinates.latitude.toFixed(6) : '');
    const [lon, setLon] = useState(savedCoordinates ? savedCoordinates.longitude.toFixed(6) : '');
    const [isQueryChanged, setIsQueryChanged] = useState(false);
    const [latError, setLatError] = useState('');
    const [lonError, setLonError] = useState('');
    const nodeRef = useRef(null);

    useEffect(() => {
        if (coordinates && !isQueryChanged) {
            setLat(coordinates.latitude.toFixed(6));
            setLon(coordinates.longitude.toFixed(6));
            setQuery(cityName); // Fügen Sie diese Zeile hinzu
        }
    }, [coordinates, isQueryChanged, cityName]); // Fügen Sie cityName zu den Abhängigkeiten hinzu

    const validateLat = (value) => {
        if (value < -90 || value > 90) {
            setLatError('Breitengrad muss zwischen -90 und 90 liegen.');
            return false;
        }
        setLatError('');
        return true;
    };

    const validateLon = (value) => {
        if (value < -180 || value > 180) {
            setLonError('Längengrad muss zwischen -180 und 180 liegen.');
            return false;
        }
        setLonError('');
        return true;
    };

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
        setLat('');
        setLon('');
        setIsQueryChanged(true);
    };

    const handleLatChange = (e) => {
        const value = e.target.value;
        setLat(value);
        validateLat(parseFloat(value));
        setQuery('');
        setIsQueryChanged(false);
    };

    const handleLonChange = (e) => {
        const value = e.target.value;
        setLon(value);
        validateLon(parseFloat(value));
        setQuery('');
        setIsQueryChanged(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (lat && lon) {
            if (validateLat(parseFloat(lat)) && validateLon(parseFloat(lon))) {
                handleSearch(null, parseFloat(lat), parseFloat(lon));
            }
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
                    onKeyDown={handleKeyDown}
                    placeholder="Stadt, PLZ oder Adresse eingeben"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    Suchen
                </button>
            </form>
            {error && <p className="error">{error}</p>}
            {coordinates && (
                <CSSTransition
                    in={isMapVisible}
                    timeout={300}
                    classNames="map"
                    unmountOnExit
                >
                    <div className="map-container">
                        <div className='container'>
                            <div style={{ marginRight: '20px' }}>
                                <h2>Koordinaten:</h2>
                                <p>Breitengrad:
                                    <input
                                        className='input_coord'
                                        type="number"
                                        value={lat}
                                        onChange={handleLatChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Breitengrad"
                                        step="any"
                                        disabled={isLoading}
                                    />
                                    <span className="error">{latError}</span>
                                </p>
                                <p>Längengrad:
                                    <input
                                        className='input_coord'
                                        type="number"
                                        value={lon}
                                        onChange={handleLonChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Längengrad"
                                        step="any"
                                        disabled={isLoading}
                                    />
                                    <span className="error">{lonError}</span>
                                </p>
                            </div>
                            <MapComponent
                                latitude={coordinates.latitude}
                                longitude={coordinates.longitude}
                                onLocationChange={handleLocationChange}
                            />
                        </div>
                    </div>
                </CSSTransition>

            )}
        </div>
    );
}

export default SearchAndDisplay;

import React, { useState, useEffect } from 'react';
import MapComponent from './MapComponent';

function SearchAndDisplay({ handleSearch, error, coordinates, setCoordinates }) {
    const [query, setQuery] = useState('');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [isQueryChanged, setIsQueryChanged] = useState(false);

    useEffect(() => {
        if (coordinates && !isQueryChanged) {
            setLat(coordinates.latitude.toFixed(6));
            setLon(coordinates.longitude.toFixed(6));
        }
    }, [coordinates, isQueryChanged]);

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
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    placeholder="Stadt, PLZ oder Adresse eingeben"
                />

                <button type="submit">Suchen</button>
            </form>
            {error && <p className="error">{error}</p>}
            {coordinates && (
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ marginRight: '20px' }}>
                        <h2>Koordinaten:</h2>
                        <p>Breitengrad: 
                            <input
                            type="number"
                            value={lat}
                            onChange={handleLatChange}
                            placeholder="Breitengrad"
                            step="any"
                        />
                        </p>
                        <p>Längengrad:
                            <input
                            type="number"
                            value={lon}
                            onChange={handleLonChange}
                            placeholder="Längengrad"
                            step="any"
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

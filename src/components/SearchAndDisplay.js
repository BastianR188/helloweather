import React from 'react';
import MapComponent from './MapComponent';

function SearchAndDisplay({ query, setQuery, handleSearch, error, coordinates }) {
    return (
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
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ marginRight: '20px' }}>
                        <h2>Koordinaten:</h2>
                        <p>Breitengrad: {coordinates.latitude}</p>
                        <p>Längengrad: {coordinates.longitude}</p>
                    </div>
                    <MapComponent latitude={coordinates.latitude} longitude={coordinates.longitude} />
                </div>
            )}
        </div>
    );
}

export default SearchAndDisplay;

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
    const [mapWidth, setMapWidth] = useState(400);
    const [mapHeight, setMapHeight] = useState(400);
    const nodeRef = useRef(null);
    const mapRef = useRef(null);
    const [isResizeStarted, setIsResizeStarted] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const resizerTimeoutRef = useRef(null);

    useEffect(() => {
        if (coordinates && !isQueryChanged) {
            setLat(coordinates.latitude.toFixed(6));
            setLon(coordinates.longitude.toFixed(6));
            setQuery(cityName); // Fügen Sie diese Zeile hinzu
        }
    }, [coordinates, isQueryChanged, cityName]); // Fügen Sie cityName zu den Abhängigkeiten hinzu

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.invalidateSize();
        }
    }, [mapWidth, mapHeight]);

    const handleResize = (e) => {
        // Berechne die neue Größe, unter Berücksichtigung des Scrolls
        let newWidth = e.pageX - nodeRef.current.offsetLeft;
        let newHeight = e.pageY - nodeRef.current.offsetTop;
    
        // Mindestgröße
        if (newHeight < 200) {
            newHeight = 200;
        }
        if (newWidth < 200) {
            newWidth = 200;
        }
    
        // Nur die visuelle Darstellung der Karte während des Resizing ändern (ohne setState)
        nodeRef.current.style.width = `${newWidth}px`;
        nodeRef.current.style.height = `${newHeight}px`;
    };
    
    
    const stopResize = () => {
        // Setze die endgültigen Werte von mapWidth und mapHeight nach dem Resizing
        setMapWidth(nodeRef.current.offsetWidth);
        setMapHeight(nodeRef.current.offsetHeight);
        
        setIsResizing(false); // Stoppen des Resize-Vorgangs
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
        clearTimeout(resizerTimeoutRef.current);  // Timeout löschen, falls noch nicht gestartet
    };
    
    const startResize = (e) => {
        e.preventDefault();
        setIsResizeStarted(true); // Starten des 1-Sekunden-Timers
    
        // Nach 1 Sekunde das Resizing aktivieren
        resizerTimeoutRef.current = setTimeout(() => {
            setIsResizing(true);  // Resizing aktivieren
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
        }, 25);  
    };
    


    const handleMapClick = (e) => {
        // Verhindern, dass der mousedown-Event zum Resizer weitergegeben wird
        console.log('klick')
        e.stopPropagation();
        clearTimeout(resizerTimeoutRef.current); // Timer abbrechen, wenn der Benutzer die Maus schnell loslässt
        setIsResizeStarted(false); // Resizing nicht aktivieren
    };

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
                            <div className={`resizer-container ${isResizing ? 'resizing' : ''}`} ref={nodeRef} onMouseDown={startResize}
                            >
                                <div
                                    className="map-content"
                                    style={{ width: '100%', height: '100%' }}
                                    onMouseDown={handleMapClick} // Verhindert, dass das Resizing aktiviert wird
                                >
                                    <MapComponent
                                        className='mapp'
                                        key={`${mapWidth}-${mapHeight}`}
                                        mapHeight={mapHeight}
                                        mapWidth={mapWidth}
                                        latitude={coordinates.latitude}
                                        longitude={coordinates.longitude}
                                        onLocationChange={handleLocationChange}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </CSSTransition>

            )}
        </div>
    );
}

export default SearchAndDisplay;

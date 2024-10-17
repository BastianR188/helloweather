import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './icon';  // Importieren Sie die icon.js Datei

// Diese Komponente aktualisiert die Kartenansicht, wenn sich die Koordinaten ändern
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

// Diese Komponente handhabt Klick-Events auf der Karte
function LocationMarker({ onLocationChange }) {
    const [position, setPosition] = useState(null);
    const map = useMapEvents({
        click(e) {
            const newPosition = [e.latlng.lat, e.latlng.lng];
            setPosition(newPosition);
            onLocationChange(newPosition);
            map.flyTo(newPosition, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

function MapComponent({ latitude, longitude, onLocationChange }) {
    const position = [latitude, longitude];
    const zoom = 10;  // Sie können den Zoom-Level nach Bedarf anpassen

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            style={{ height: '200px', width: '200px', borderRadius: '8px' }}
        >
            <ChangeView center={position} zoom={zoom} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
            />
            <Marker position={position} />
            <LocationMarker onLocationChange={onLocationChange} />
        </MapContainer>
    );
}

export default MapComponent;

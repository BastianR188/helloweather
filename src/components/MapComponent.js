import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
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

function MapComponent({ latitude, longitude }) {
    const position = [latitude, longitude];
    const zoom = 10;  // Sie können den Zoom-Level nach Bedarf anpassen

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            style={{ height: '200px', width: '200px' }}
        >
            <ChangeView center={position} zoom={zoom} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
            />
            <Marker position={position} />
        </MapContainer>
    );
}

export default MapComponent;

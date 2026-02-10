import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom patient icon
const patientIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const defaultCenter = [37.7749, -122.4194];

// Component to handle map clicks
const MapEvents = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            if (onMapClick) {
                onMapClick({
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                });
            }
        },
    });
    return null;
};

// Component to handle map centering updates
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView([center.lat, center.lng]);
    }, [center, map]);
    return null;
}

const MapView = ({
    patients = [],
    safeZones = [],
    center = { lat: 37.7749, lng: -122.4194 },
    onMapClick,
    showSafeZones = true
}) => {
    const mapCenter = [center.lat, center.lng];

    return (
        <Box height="500px" width="100%" sx={{ '& .leaflet-container': { height: '100%', width: '100%' } }}>
            <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ChangeView center={center} />
                <MapEvents onMapClick={onMapClick} />

                {/* Patient markers */}
                {patients.map((patient) => (
                    patient.location && (
                        <Marker
                            key={patient.id}
                            position={[patient.location.latitude, patient.location.longitude]}
                            icon={patientIcon}
                        >
                        </Marker>
                    )
                ))}

                {/* Safe zone circles */}
                {showSafeZones && safeZones.map((zone) => (
                    <Circle
                        key={zone.id}
                        center={[zone.centerLatitude, zone.centerLongitude]}
                        radius={zone.radiusInMeters}
                        pathOptions={{
                            fillColor: zone.active ? '#4CAF50' : '#9E9E9E',
                            fillOpacity: 0.2,
                            color: zone.active ? '#4CAF50' : '#9E9E9E',
                            opacity: 0.8,
                            weight: 2
                        }}
                    />
                ))}
            </MapContainer>
        </Box>
    );
};

export default MapView;

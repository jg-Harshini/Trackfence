import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { Box, CircularProgress } from '@mui/material';

const containerStyle = {
    width: '100%',
    height: '500px'
};

const defaultCenter = {
    lat: 37.7749,
    lng: -122.4194
};

const MapView = ({
    patients = [],
    safeZones = [],
    center = defaultCenter,
    onMapClick,
    showSafeZones = true
}) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    const [map, setMap] = useState(null);

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleMapClick = (e) => {
        if (onMapClick) {
            onMapClick({
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            });
        }
    };

    if (!isLoaded) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="500px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
        >
            {/* Patient markers */}
            {patients.map((patient) => (
                patient.location && (
                    <Marker
                        key={patient.id}
                        position={{ lat: patient.location.latitude, lng: patient.location.longitude }}
                        title={patient.name}
                        icon={{
                            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                        }}
                    />
                )
            ))}

            {/* Safe zone circles */}
            {showSafeZones && safeZones.map((zone) => (
                <Circle
                    key={zone.id}
                    center={{ lat: zone.centerLatitude, lng: zone.centerLongitude }}
                    radius={zone.radiusInMeters}
                    options={{
                        fillColor: zone.active ? '#4CAF50' : '#9E9E9E',
                        fillOpacity: 0.2,
                        strokeColor: zone.active ? '#4CAF50' : '#9E9E9E',
                        strokeOpacity: 0.8,
                        strokeWeight: 2
                    }}
                />
            ))}
        </GoogleMap>
    );
};

export default MapView;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    AppBar,
    Toolbar,
    Card,
    CardContent,
    Grid,
    Chip
} from '@mui/material';
import { Logout, LocationOn, ContentCopy } from '@mui/icons-material';
import { locationService } from '../services/locationService';
import websocketService from '../services/websocketService';

const PatientDashboard = () => {
    const { user, logout } = useAuth();
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationHistory, setLocationHistory] = useState([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadCurrentLocation();
        loadLocationHistory();

        // Connect to WebSocket
        websocketService.connect(() => {
            websocketService.subscribeToLocation(user.patientId, (location) => {
                setCurrentLocation(location);
            });
        });

        // Request geolocation permission and update location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                updateLocation(position.coords.latitude, position.coords.longitude);
            });
        }

        return () => {
            websocketService.disconnect();
        };
    }, [user.patientId]);

    const loadCurrentLocation = async () => {
        try {
            const location = await locationService.getCurrentLocation(user.patientId);
            setCurrentLocation(location);
        } catch (error) {
            console.error('Error loading current location:', error);
        }
    };

    const loadLocationHistory = async () => {
        try {
            const history = await locationService.getLocationHistory(user.patientId);
            setLocationHistory(history.slice(0, 10)); // Show last 10 locations
        } catch (error) {
            console.error('Error loading location history:', error);
        }
    };

    const updateLocation = async (latitude, longitude) => {
        try {
            await locationService.updateLocation(user.patientId, latitude, longitude);
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    const copyPatientId = () => {
        navigator.clipboard.writeText(user.patientId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Patient Dashboard
                    </Typography>
                    <Button color="inherit" onClick={logout} startIcon={<Logout />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Profile Information
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Name:</strong> {user.username}
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                    <strong>Role:</strong> <Chip label="Patient" color="primary" size="small" />
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Shareable Patient ID:</strong>
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                            {user.patientId}
                                        </Typography>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={copyPatientId}
                                            startIcon={<ContentCopy />}
                                        >
                                            {copied ? 'Copied!' : 'Copy'}
                                        </Button>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Share this ID with your caretakers to allow them to track your location
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <LocationOn /> Current Location
                                </Typography>
                                {currentLocation ? (
                                    <Box>
                                        <Typography variant="body2">
                                            <strong>Latitude:</strong> {currentLocation.latitude.toFixed(6)}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Longitude:</strong> {currentLocation.longitude.toFixed(6)}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Last Updated:</strong> {new Date(currentLocation.timestamp).toLocaleString()}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No location data available
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Recent Location History
                                </Typography>
                                {locationHistory.length > 0 ? (
                                    <Box>
                                        {locationHistory.map((loc, index) => (
                                            <Box key={loc.id} sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                                <Typography variant="body2">
                                                    {new Date(loc.timestamp).toLocaleString()} -
                                                    Lat: {loc.latitude.toFixed(6)}, Lng: {loc.longitude.toFixed(6)}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No location history available
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default PatientDashboard;

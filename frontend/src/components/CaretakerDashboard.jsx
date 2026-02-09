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
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    ListItem,
    ListItemText,
    Chip,
    Badge,
    IconButton,
    Alert
} from '@mui/material';
import { Logout, Add, Notifications, PersonAdd } from '@mui/icons-material';
import MapView from './MapView';
import { locationService } from '../services/locationService';
import { safeZoneService } from '../services/safeZoneService';
import { alertService } from '../services/alertService';
import { userService } from '../services/userService';
import websocketService from '../services/websocketService';

const CaretakerDashboard = () => {
    const { user, logout } = useAuth();
    const [patients, setPatients] = useState([]);
    const [safeZones, setSafeZones] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [openZoneDialog, setOpenZoneDialog] = useState(false);
    const [openLinkDialog, setOpenLinkDialog] = useState(false);
    const [openAlertsDialog, setOpenAlertsDialog] = useState(false);
    const [newZone, setNewZone] = useState({
        name: '',
        centerLatitude: 0,
        centerLongitude: 0,
        radiusInMeters: 500,
        patientId: ''
    });
    const [linkPatientId, setLinkPatientId] = useState('');
    const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });

    useEffect(() => {
        loadUserData();

        // Connect to WebSocket
        websocketService.connect(() => {
            console.log('WebSocket connected for caretaker');
        });

        return () => {
            websocketService.disconnect();
        };
    }, []);

    useEffect(() => {
        if (selectedPatient) {
            loadPatientData(selectedPatient);

            // Subscribe to location updates
            websocketService.subscribeToLocation(selectedPatient, (location) => {
                updatePatientLocation(selectedPatient, location);
            });

            // Subscribe to alerts
            websocketService.subscribeToAlerts(selectedPatient, (alert) => {
                setAlerts(prev => [alert, ...prev]);
            });
        }
    }, [selectedPatient]);

    const loadUserData = async () => {
        try {
            const userData = await userService.getUser(user.userId);
            if (userData.linkedPatientIds && userData.linkedPatientIds.length > 0) {
                const patientPromises = userData.linkedPatientIds.map(async (patientId) => {
                    const location = await locationService.getCurrentLocation(patientId).catch(() => null);
                    return {
                        id: patientId,
                        name: `Patient ${patientId.substring(0, 8)}`,
                        location
                    };
                });
                const patientsData = await Promise.all(patientPromises);
                setPatients(patientsData);

                if (patientsData.length > 0) {
                    setSelectedPatient(patientsData[0].id);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadPatientData = async (patientId) => {
        try {
            const [zones, patientAlerts] = await Promise.all([
                safeZoneService.getActiveSafeZones(patientId),
                alertService.getUnacknowledgedAlerts(patientId)
            ]);

            setSafeZones(zones);
            setAlerts(patientAlerts);

            // Update map center to patient location
            const location = await locationService.getCurrentLocation(patientId);
            if (location) {
                setMapCenter({ lat: location.latitude, lng: location.longitude });
            }
        } catch (error) {
            console.error('Error loading patient data:', error);
        }
    };

    const updatePatientLocation = (patientId, location) => {
        setPatients(prev => prev.map(p =>
            p.id === patientId ? { ...p, location } : p
        ));
    };

    const handleMapClick = (coords) => {
        if (selectedPatient) {
            setNewZone({
                ...newZone,
                centerLatitude: coords.lat,
                centerLongitude: coords.lng,
                patientId: selectedPatient
            });
            setOpenZoneDialog(true);
        }
    };

    const handleCreateZone = async () => {
        try {
            await safeZoneService.createSafeZone(newZone);
            setOpenZoneDialog(false);
            loadPatientData(selectedPatient);
            setNewZone({
                name: '',
                centerLatitude: 0,
                centerLongitude: 0,
                radiusInMeters: 500,
                patientId: ''
            });
        } catch (error) {
            console.error('Error creating safe zone:', error);
        }
    };

    const handleLinkPatient = async () => {
        try {
            await userService.linkCaretakerToPatient(user.userId, linkPatientId);
            setOpenLinkDialog(false);
            setLinkPatientId('');
            loadUserData();
        } catch (error) {
            console.error('Error linking patient:', error);
            alert('Failed to link patient. Please check the Patient ID.');
        }
    };

    const handleAcknowledgeAlert = async (alertId) => {
        try {
            await alertService.acknowledgeAlert(alertId, user.userId);
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        } catch (error) {
            console.error('Error acknowledging alert:', error);
        }
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Caretaker Dashboard
                    </Typography>
                    <IconButton color="inherit" onClick={() => setOpenAlertsDialog(true)}>
                        <Badge badgeContent={alerts.length} color="error">
                            <Notifications />
                        </Badge>
                    </IconButton>
                    <Button color="inherit" onClick={() => setOpenLinkDialog(true)} startIcon={<PersonAdd />}>
                        Link Patient
                    </Button>
                    <Button color="inherit" onClick={logout} startIcon={<Logout />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Linked Patients
                                </Typography>
                                <List>
                                    {patients.map((patient) => (
                                        <ListItem
                                            key={patient.id}
                                            button
                                            selected={selectedPatient === patient.id}
                                            onClick={() => setSelectedPatient(patient.id)}
                                        >
                                            <ListItemText
                                                primary={patient.name}
                                                secondary={patient.location ? 'Location available' : 'No location'}
                                            />
                                        </ListItem>
                                    ))}
                                    {patients.length === 0 && (
                                        <Typography variant="body2" color="text.secondary">
                                            No linked patients. Click "Link Patient" to add one.
                                        </Typography>
                                    )}
                                </List>
                            </CardContent>
                        </Card>

                        <Card sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Safe Zones
                                </Typography>
                                <List dense>
                                    {safeZones.map((zone) => (
                                        <ListItem key={zone.id}>
                                            <ListItemText
                                                primary={zone.name}
                                                secondary={`Radius: ${zone.radiusInMeters}m`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={() => setOpenZoneDialog(true)}
                                    disabled={!selectedPatient}
                                    sx={{ mt: 1 }}
                                >
                                    Add Zone
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={9}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Patient Location Map
                                </Typography>
                                {selectedPatient ? (
                                    <MapView
                                        patients={patients.filter(p => p.id === selectedPatient)}
                                        safeZones={safeZones}
                                        center={mapCenter}
                                        onMapClick={handleMapClick}
                                    />
                                ) : (
                                    <Box height="500px" display="flex" alignItems="center" justifyContent="center">
                                        <Typography color="text.secondary">
                                            Select a patient to view their location
                                        </Typography>
                                    </Box>
                                )}
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Click on the map to create a new safe zone
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Create Safe Zone Dialog */}
            <Dialog open={openZoneDialog} onClose={() => setOpenZoneDialog(false)}>
                <DialogTitle>Create Safe Zone</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Zone Name"
                        margin="normal"
                        value={newZone.name}
                        onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Radius (meters)"
                        type="number"
                        margin="normal"
                        value={newZone.radiusInMeters}
                        onChange={(e) => setNewZone({ ...newZone, radiusInMeters: parseInt(e.target.value) })}
                    />
                    <Typography variant="caption" color="text.secondary">
                        Center: {newZone.centerLatitude.toFixed(6)}, {newZone.centerLongitude.toFixed(6)}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenZoneDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateZone} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Link Patient Dialog */}
            <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)}>
                <DialogTitle>Link Patient</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" gutterBottom>
                        Enter the shareable Patient ID provided by the patient
                    </Typography>
                    <TextField
                        fullWidth
                        label="Patient ID"
                        margin="normal"
                        value={linkPatientId}
                        onChange={(e) => setLinkPatientId(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLinkDialog(false)}>Cancel</Button>
                    <Button onClick={handleLinkPatient} variant="contained">Link</Button>
                </DialogActions>
            </Dialog>

            {/* Alerts Dialog */}
            <Dialog open={openAlertsDialog} onClose={() => setOpenAlertsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Active Alerts</DialogTitle>
                <DialogContent>
                    {alerts.length > 0 ? (
                        <List>
                            {alerts.map((alert) => (
                                <ListItem key={alert.id}>
                                    <ListItemText
                                        primary={alert.message}
                                        secondary={new Date(alert.triggeredAt).toLocaleString()}
                                    />
                                    <Button
                                        size="small"
                                        onClick={() => handleAcknowledgeAlert(alert.id)}
                                    >
                                        Acknowledge
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography color="text.secondary">No active alerts</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAlertsDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CaretakerDashboard;

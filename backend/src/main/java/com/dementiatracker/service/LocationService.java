package com.dementiatracker.service;

import com.dementiatracker.model.Location;
import com.dementiatracker.model.SafeZone;
import com.dementiatracker.repository.LocationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private GeofencingService geofencingService;

    @Autowired
    private AlertService alertService;

    @Autowired
    private ShipdayService shipdayService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Update patient location and check geofencing
     */
    public Location updateLocation(String patientId, double latitude, double longitude, String source) {
        log.info("Updating location for patient {}: ({}, {}) from {}", patientId, latitude, longitude, source);
        // Save new location
        Location location = new Location();
        location.setPatientId(patientId);
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        location.setTimestamp(LocalDateTime.now());
        location.setSource(source);

        Location savedLocation = locationRepository.save(location);

        // Send real-time location update via WebSocket
        messagingTemplate.convertAndSend("/topic/location/" + patientId, savedLocation);

        // Check geofencing violations
        checkGeofencing(patientId, savedLocation);

        return savedLocation;
    }

    /**
     * Check if patient has violated any safe zones
     */
    private void checkGeofencing(String patientId, Location location) {
        boolean inAnyZone = geofencingService.isInAnySafeZone(patientId, location);
        List<SafeZone> activeZones = geofencingService.getActiveSafeZones(patientId); // I need to add this method or
                                                                                      // just use repository

        if (!activeZones.isEmpty() && !inAnyZone) {
            // Patient is outside of all their safe zones
            // For now, we take the first zone as a reference for the alert
            SafeZone zone = activeZones.get(0);
            alertService.createZoneExitAlert(patientId, zone, location);
        }
    }

    /**
     * Fetch location from Shipday API and update
     */
    public Location fetchAndUpdateLocation(String patientId, String trackingId) {
        Map<String, Double> coords = shipdayService.fetchLocation(trackingId);

        return updateLocation(
                patientId,
                coords.get("latitude"),
                coords.get("longitude"),
                "SHIPDAY_API");
    }

    /**
     * Get current location for a patient
     */
    public Optional<Location> getCurrentLocation(String patientId) {
        return locationRepository.findFirstByPatientIdOrderByTimestampDesc(patientId);
    }

    /**
     * Get location history for a patient
     */
    public List<Location> getLocationHistory(String patientId) {
        return locationRepository.findByPatientIdOrderByTimestampDesc(patientId);
    }

    /**
     * Get location history within time range
     */
    public List<Location> getLocationHistory(String patientId, LocalDateTime start, LocalDateTime end) {
        return locationRepository.findByPatientIdAndTimestampBetween(patientId, start, end);
    }
}

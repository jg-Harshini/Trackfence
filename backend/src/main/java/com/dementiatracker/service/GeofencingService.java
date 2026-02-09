package com.dementiatracker.service;

import com.dementiatracker.model.Location;
import com.dementiatracker.model.SafeZone;
import com.dementiatracker.repository.SafeZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GeofencingService {

    @Autowired
    private SafeZoneRepository safeZoneRepository;

    /**
     * Calculate distance between two points using Haversine formula
     * 
     * @param lat1 Latitude of point 1
     * @param lon1 Longitude of point 1
     * @param lat2 Latitude of point 2
     * @param lon2 Longitude of point 2
     * @return Distance in meters
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371000; // Earth's radius in meters

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c; // Distance in meters
    }

    /**
     * Check if a location is within a safe zone
     * 
     * @param location Patient's current location
     * @param safeZone Safe zone to check against
     * @return true if patient is inside the safe zone, false otherwise
     */
    public boolean isWithinSafeZone(Location location, SafeZone safeZone) {
        double distance = calculateDistance(
                location.getLatitude(),
                location.getLongitude(),
                safeZone.getCenterLatitude(),
                safeZone.getCenterLongitude());

        return distance <= safeZone.getRadiusInMeters();
    }

    /**
     * Check if patient is outside ALL safe zones
     * 
     * @param patientId Patient ID
     * @param location  Current location
     * @return List of safe zones that the patient has exited (empty if still in at
     *         least one zone)
     */
    public List<SafeZone> getViolatedSafeZones(String patientId, Location location) {
        List<SafeZone> activeSafeZones = safeZoneRepository.findByPatientIdAndActiveTrue(patientId);

        return activeSafeZones.stream()
                .filter(zone -> !isWithinSafeZone(location, zone))
                .toList();
    }

    /**
     * Check if patient is within at least one safe zone
     * 
     * @param patientId Patient ID
     * @param location  Current location
     * @return true if patient is in at least one safe zone
     */
    public boolean isInAnySafeZone(String patientId, Location location) {
        List<SafeZone> activeSafeZones = safeZoneRepository.findByPatientIdAndActiveTrue(patientId);

        return activeSafeZones.stream()
                .anyMatch(zone -> isWithinSafeZone(location, zone));
    }
}

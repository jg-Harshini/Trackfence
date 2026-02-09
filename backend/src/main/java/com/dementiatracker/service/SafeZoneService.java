package com.dementiatracker.service;

import com.dementiatracker.model.SafeZone;
import com.dementiatracker.repository.SafeZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SafeZoneService {

    @Autowired
    private SafeZoneRepository safeZoneRepository;

    /**
     * Create a new safe zone
     */
    public SafeZone createSafeZone(SafeZone safeZone) {
        safeZone.setCreatedAt(LocalDateTime.now());
        safeZone.setUpdatedAt(LocalDateTime.now());
        safeZone.setActive(true);

        return safeZoneRepository.save(safeZone);
    }

    /**
     * Get all safe zones for a patient
     */
    public List<SafeZone> getPatientSafeZones(String patientId) {
        return safeZoneRepository.findByPatientId(patientId);
    }

    /**
     * Get active safe zones for a patient
     */
    public List<SafeZone> getActiveSafeZones(String patientId) {
        return safeZoneRepository.findByPatientIdAndActiveTrue(patientId);
    }

    /**
     * Update safe zone
     */
    public SafeZone updateSafeZone(String zoneId, SafeZone updatedZone) {
        SafeZone zone = safeZoneRepository.findById(zoneId)
                .orElseThrow(() -> new RuntimeException("Safe zone not found"));

        zone.setName(updatedZone.getName());
        zone.setCenterLatitude(updatedZone.getCenterLatitude());
        zone.setCenterLongitude(updatedZone.getCenterLongitude());
        zone.setRadiusInMeters(updatedZone.getRadiusInMeters());
        zone.setUpdatedAt(LocalDateTime.now());

        return safeZoneRepository.save(zone);
    }

    /**
     * Delete (deactivate) safe zone
     */
    public void deleteSafeZone(String zoneId) {
        SafeZone zone = safeZoneRepository.findById(zoneId)
                .orElseThrow(() -> new RuntimeException("Safe zone not found"));

        zone.setActive(false);
        safeZoneRepository.save(zone);
    }

    /**
     * Permanently delete safe zone
     */
    public void permanentlyDeleteSafeZone(String zoneId) {
        safeZoneRepository.deleteById(zoneId);
    }
}

package com.dementiatracker.service;

import com.dementiatracker.model.Alert;
import com.dementiatracker.model.Location;
import com.dementiatracker.model.SafeZone;
import com.dementiatracker.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Create and send alert when patient exits safe zone
     */
    public Alert createZoneExitAlert(String patientId, SafeZone safeZone, Location location) {
        Alert alert = new Alert();
        alert.setPatientId(patientId);
        alert.setSafeZoneId(safeZone.getId());
        alert.setType(Alert.AlertType.ZONE_EXIT);
        alert.setMessage(String.format("Patient has exited safe zone: %s", safeZone.getName()));
        alert.setPatientLatitude(location.getLatitude());
        alert.setPatientLongitude(location.getLongitude());
        alert.setTriggeredAt(LocalDateTime.now());
        alert.setAcknowledged(false);

        Alert savedAlert = alertRepository.save(alert);

        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSend("/topic/alerts/" + patientId, savedAlert);

        return savedAlert;
    }

    /**
     * Create alert when patient re-enters safe zone
     */
    public Alert createZoneEntryAlert(String patientId, SafeZone safeZone, Location location) {
        Alert alert = new Alert();
        alert.setPatientId(patientId);
        alert.setSafeZoneId(safeZone.getId());
        alert.setType(Alert.AlertType.ZONE_ENTRY);
        alert.setMessage(String.format("Patient has re-entered safe zone: %s", safeZone.getName()));
        alert.setPatientLatitude(location.getLatitude());
        alert.setPatientLongitude(location.getLongitude());
        alert.setTriggeredAt(LocalDateTime.now());
        alert.setAcknowledged(false);

        Alert savedAlert = alertRepository.save(alert);

        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSend("/topic/alerts/" + patientId, savedAlert);

        return savedAlert;
    }

    /**
     * Get all alerts for a patient
     */
    public List<Alert> getPatientAlerts(String patientId) {
        return alertRepository.findByPatientIdOrderByTriggeredAtDesc(patientId);
    }

    /**
     * Get unacknowledged alerts for a patient
     */
    public List<Alert> getUnacknowledgedAlerts(String patientId) {
        return alertRepository.findByPatientIdAndAcknowledgedFalseOrderByTriggeredAtDesc(patientId);
    }

    /**
     * Acknowledge an alert
     */
    public Alert acknowledgeAlert(String alertId, String caretakerId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedByCaretakerId(caretakerId);

        return alertRepository.save(alert);
    }
}

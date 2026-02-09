package com.dementiatracker.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "safe_zones")
public class SafeZone {
    @Id
    private String id;

    private String patientId;

    private String name; // e.g., "Home", "Park", "Community Center"

    private double centerLatitude;

    private double centerLongitude;

    private double radiusInMeters; // Radius of the safe zone

    private boolean active = true; // Can be disabled without deleting

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdByCaretakerId;
}

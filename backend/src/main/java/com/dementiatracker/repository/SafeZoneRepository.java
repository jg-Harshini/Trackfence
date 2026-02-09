package com.dementiatracker.repository;

import com.dementiatracker.model.SafeZone;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SafeZoneRepository extends MongoRepository<SafeZone, String> {
    List<SafeZone> findByPatientId(String patientId);

    List<SafeZone> findByPatientIdAndActiveTrue(String patientId);
}

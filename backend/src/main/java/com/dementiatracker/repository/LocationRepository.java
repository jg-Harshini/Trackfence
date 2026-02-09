package com.dementiatracker.repository;

import com.dementiatracker.model.Location;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends MongoRepository<Location, String> {
    List<Location> findByPatientIdOrderByTimestampDesc(String patientId);

    Optional<Location> findFirstByPatientIdOrderByTimestampDesc(String patientId);

    List<Location> findByPatientIdAndTimestampBetween(String patientId, LocalDateTime start, LocalDateTime end);
}

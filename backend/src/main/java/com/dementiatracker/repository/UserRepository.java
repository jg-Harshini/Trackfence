package com.dementiatracker.repository;

import com.dementiatracker.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPatientId(String patientId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}

package com.gym360.repository;

import com.gym360.entity.Gym;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GymRepository extends JpaRepository<Gym, Long> {
    Optional<Gym> findByName(String name);
    Optional<Gym> findByCode(String code);
    Optional<Gym> findByEmail(String email);
    boolean existsByName(String name);
    boolean existsByCode(String code);
    boolean existsByEmail(String email);
}


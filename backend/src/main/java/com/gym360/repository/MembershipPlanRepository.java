package com.gym360.repository;

import com.gym360.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {
    Optional<MembershipPlan> findByNameIgnoreCase(String name);

    @Query("SELECT p FROM MembershipPlan p WHERE p.gym.id = :gymId")
    List<MembershipPlan> findByGymId(@Param("gymId") Long gymId);

    @Query("SELECT p FROM MembershipPlan p WHERE p.id = :id AND p.gym.id = :gymId")
    Optional<MembershipPlan> findByIdAndGymId(@Param("id") Long id, @Param("gymId") Long gymId);

    @Query("SELECT p FROM MembershipPlan p WHERE LOWER(p.name) = LOWER(:name) AND p.gym.id = :gymId")
    Optional<MembershipPlan> findByNameIgnoreCaseAndGymId(@Param("name") String name, @Param("gymId") Long gymId);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM MembershipPlan p WHERE LOWER(p.name) = LOWER(:name) AND p.gym.id = :gymId")
    boolean existsByNameIgnoreCaseAndGymId(@Param("name") String name, @Param("gymId") Long gymId);

    @Query("SELECT COUNT(p) FROM MembershipPlan p WHERE p.gym.id = :gymId")
    long countByGymId(@Param("gymId") Long gymId);
}

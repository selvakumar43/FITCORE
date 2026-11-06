package com.gym360.repository;

import com.gym360.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    List<Membership> findByUserId(Long userId);
    List<Membership> findByUserIdOrderByStartDateDesc(Long userId);
    List<Membership> findByUserIdOrderByStartDateDescIdDesc(Long userId);
    Optional<Membership> findByUserIdAndStatus(Long userId, Membership.Status status);
    List<Membership> findByStatus(Membership.Status status);
    long countByStatus(Membership.Status status);
    boolean existsByPlanId(Long planId);
    List<Membership> findByPlanId(Long planId);

    @Query("SELECT m FROM Membership m WHERE m.gym.id = :gymId")
    List<Membership> findByGymId(@Param("gymId") Long gymId);

    @Query("SELECT m FROM Membership m WHERE m.id = :id AND m.gym.id = :gymId")
    Optional<Membership> findByIdAndGymId(@Param("id") Long id, @Param("gymId") Long gymId);

    @Query("SELECT m FROM Membership m WHERE m.gym.id = :gymId AND m.user.id = :userId ORDER BY m.startDate DESC, m.id DESC")
    List<Membership> findByGymIdAndUserIdOrderByStartDateDescIdDesc(@Param("gymId") Long gymId, @Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Membership m WHERE m.gym.id = :gymId")
    long countByGymId(@Param("gymId") Long gymId);

    @Query("SELECT COUNT(m) FROM Membership m WHERE m.gym.id = :gymId AND m.status = :status")
    long countByGymIdAndStatus(@Param("gymId") Long gymId, @Param("status") Membership.Status status);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Membership m WHERE m.plan.id = :planId AND m.gym.id = :gymId")
    boolean existsByPlanIdAndGymId(@Param("planId") Long planId, @Param("gymId") Long gymId);
}

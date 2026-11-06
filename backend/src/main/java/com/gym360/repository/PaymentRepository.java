package com.gym360.repository;

import com.gym360.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByMembershipId(Long membershipId);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0.0) FROM Payment p")
    Double sumTotalAmountCollected();

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0.0) FROM Payment p WHERE p.updatedAt >= :startDate AND p.updatedAt <= :endDate")
    Double sumRevenueBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0.0) FROM Payment p WHERE p.membership.gym.id = :gymId AND p.updatedAt >= :startDate AND p.updatedAt <= :endDate")
    Double sumRevenueBetweenDatesForGym(@Param("gymId") Long gymId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}

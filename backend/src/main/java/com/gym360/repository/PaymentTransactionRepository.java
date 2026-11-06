package com.gym360.repository;

import com.gym360.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByPaymentIdOrderByTransactionDateDesc(Long paymentId);
    boolean existsByTransactionReference(String transactionReference);
    Optional<PaymentTransaction> findByTransactionReference(String transactionReference);
}


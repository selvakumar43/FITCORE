package com.gym360.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payments")
public class Payment {

    public enum PaymentStatus {
        UNPAID,
        NOT_PAID,
        PARTIALLY_PAID,
        PAID,
        OVERPAID
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id", nullable = false, unique = true)
    @JsonIgnore
    private Membership membership;

    @Column(nullable = false)
    private Double amountPaid = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 32)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    private LocalDate updatedAt;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("transactionDate DESC")
    private List<PaymentTransaction> transactions = new ArrayList<>();

    public Payment() {}

    public Payment(Membership membership, Double amountPaid, PaymentStatus paymentStatus, LocalDate updatedAt) {
        this.membership = membership;
        this.amountPaid = amountPaid != null ? amountPaid : 0.0;
        this.paymentStatus = paymentStatus != null ? paymentStatus : PaymentStatus.UNPAID;
        this.updatedAt = updatedAt != null ? updatedAt : LocalDate.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Membership getMembership() {
        return membership;
    }

    public void setMembership(Membership membership) {
        this.membership = membership;
    }

    public Double getAmountPaid() {
        return amountPaid != null ? Math.round(amountPaid * 100.0) / 100.0 : 0.0;
    }

    public void setAmountPaid(Double amountPaid) {
        this.amountPaid = amountPaid != null ? Math.round(amountPaid * 100.0) / 100.0 : 0.0;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDate getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDate updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<PaymentTransaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<PaymentTransaction> transactions) {
        this.transactions = transactions;
    }

    public void addTransaction(PaymentTransaction tx) {
        transactions.add(tx);
        tx.setPayment(this);
    }

    // Remaining Balance = max(Agreed Fee - Amount Paid, 0)
    public Double getRemainingBalance() {
        if (membership == null || membership.getPrice() == null) {
            return 0.0;
        }
        double fee = membership.getPrice();
        double paid = amountPaid != null ? amountPaid : 0.0;
        double remaining = fee - paid;
        return remaining > 0.0 ? Math.round(remaining * 100.0) / 100.0 : 0.0;
    }

    // Customer Credit = max(Amount Paid - Agreed Fee, 0)
    public Double getCustomerCredit() {
        if (membership == null || membership.getPrice() == null) {
            return 0.0;
        }
        double fee = membership.getPrice();
        double paid = amountPaid != null ? amountPaid : 0.0;
        double credit = paid - fee;
        return credit > 0.0 ? Math.round(credit * 100.0) / 100.0 : 0.0;
    }

    // Recalculates payment status based on amountPaid vs membership price
    public void recalculateStatus() {
        double fee = (membership != null && membership.getPrice() != null) ? membership.getPrice() : 0.0;
        double paid = amountPaid != null ? amountPaid : 0.0;
        fee = Math.round(fee * 100.0) / 100.0;
        paid = Math.round(paid * 100.0) / 100.0;

        if (paid <= 0.0) {
            this.paymentStatus = PaymentStatus.UNPAID;
        } else if (paid < fee) {
            this.paymentStatus = PaymentStatus.PARTIALLY_PAID;
        } else if (Double.compare(paid, fee) == 0) {
            this.paymentStatus = PaymentStatus.PAID;
        } else {
            this.paymentStatus = PaymentStatus.OVERPAID;
        }
    }
}

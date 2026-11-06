package com.gym360.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    public enum Type {
        PAYMENT,
        REFUND
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    @JsonIgnore
    private Payment payment;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Type type = Type.PAYMENT;

    @Column(length = 100)
    private String transactionReference;

    private String notes;

    @Column(nullable = false)
    private LocalDateTime transactionDate;

    public PaymentTransaction() {}

    public PaymentTransaction(Payment payment, Double amount, Type type, String transactionReference, String notes, LocalDateTime transactionDate) {
        this.payment = payment;
        this.amount = amount;
        this.type = type != null ? type : Type.PAYMENT;
        this.transactionReference = transactionReference;
        this.notes = notes;
        this.transactionDate = transactionDate != null ? transactionDate : LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }
}


package com.gym360.dto;

import com.gym360.entity.PaymentTransaction;
import java.time.LocalDateTime;

public class PaymentTransactionDto {
    private Long id;
    private Double amount;
    private String type;
    private String transactionReference;
    private String notes;
    private LocalDateTime transactionDate;

    public PaymentTransactionDto() {}

    public PaymentTransactionDto(PaymentTransaction tx) {
        this.id = tx.getId();
        this.amount = tx.getAmount();
        this.type = tx.getType().name();
        this.transactionReference = tx.getTransactionReference();
        this.notes = tx.getNotes();
        this.transactionDate = tx.getTransactionDate();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
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


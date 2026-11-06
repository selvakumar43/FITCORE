package com.gym360.dto;

import com.gym360.entity.PaymentTransaction;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class PaymentTransactionRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private Double amount;

    private PaymentTransaction.Type type = PaymentTransaction.Type.PAYMENT;

    private String transactionReference;

    private String notes;

    public PaymentTransactionRequest() {}

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public PaymentTransaction.Type getType() {
        return type;
    }

    public void setType(PaymentTransaction.Type type) {
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
}


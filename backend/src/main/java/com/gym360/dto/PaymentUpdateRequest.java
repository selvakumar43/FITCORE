package com.gym360.dto;

import com.gym360.entity.Payment;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class PaymentUpdateRequest {
    @NotNull
    @Min(0)
    private Double amountPaid;

    @NotNull
    private Payment.PaymentStatus paymentStatus;

    public PaymentUpdateRequest() {}

    public Double getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(Double amountPaid) {
        this.amountPaid = amountPaid;
    }

    public Payment.PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(Payment.PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}


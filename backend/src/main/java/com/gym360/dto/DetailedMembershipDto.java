package com.gym360.dto;

import com.gym360.entity.Membership;
import com.gym360.entity.Payment;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DetailedMembershipDto {
    private Long id;
    private Long gymId;
    private String gymName;
    private Long userId;
    private String clientName;
    private String clientEmail;
    private String clientPhone;

    private Long planId;
    private String planName;
    private Integer planDurationMonths;
    private String planDescription;

    private LocalDate startDate;
    private LocalDate expiryDate;
    private String status;
    private String effectiveStatus;

    private Double price;
    private Double amountPaid;
    private Double remainingBalance;
    private Double customerCredit;
    private String paymentStatus;
    private Long paymentId;

    private List<PaymentTransactionDto> transactions = new ArrayList<>();

    public DetailedMembershipDto() {}

    public DetailedMembershipDto(Membership m) {
        this.id = m.getId();
        if (m.getGym() != null) {
            this.gymId = m.getGym().getId();
            this.gymName = m.getGym().getName();
        } else if (m.getUser() != null && m.getUser().getGym() != null) {
            this.gymId = m.getUser().getGym().getId();
            this.gymName = m.getUser().getGym().getName();
        }

        if (m.getUser() != null) {
            this.userId = m.getUser().getId();
            this.clientName = m.getUser().getName();
            this.clientEmail = m.getUser().getEmail();
            this.clientPhone = m.getUser().getPhone();
        }

        if (m.getPlan() != null) {
            this.planId = m.getPlan().getId();
            this.planName = m.getPlan().getName();
            this.planDurationMonths = m.getPlan().getDurationMonths();
            this.planDescription = m.getPlan().getDescription();
        }

        this.startDate = m.getStartDate();
        this.expiryDate = m.getExpiryDate();
        this.status = m.getStatus() != null ? m.getStatus().name() : "ACTIVE";
        this.effectiveStatus = m.getEffectiveStatus().name();
        this.price = m.getPrice() != null ? Math.round(m.getPrice() * 100.0) / 100.0 : 0.0;

        Payment p = m.getPayment();
        if (p != null) {
            this.amountPaid = p.getAmountPaid();
            this.remainingBalance = p.getRemainingBalance();
            this.customerCredit = p.getCustomerCredit();
            this.paymentStatus = p.getPaymentStatus() != null ? p.getPaymentStatus().name() : "UNPAID";
            this.paymentId = p.getId();

            if (p.getTransactions() != null) {
                this.transactions = p.getTransactions().stream()
                        .map(PaymentTransactionDto::new)
                        .collect(Collectors.toList());
            }
        } else {
            this.amountPaid = 0.0;
            this.remainingBalance = this.price;
            this.customerCredit = 0.0;
            this.paymentStatus = "UNPAID";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGymId() {
        return gymId;
    }

    public void setGymId(Long gymId) {
        this.gymId = gymId;
    }

    public String getGymName() {
        return gymName;
    }

    public void setGymName(String gymName) {
        this.gymName = gymName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getClientPhone() {
        return clientPhone;
    }

    public void setClientPhone(String clientPhone) {
        this.clientPhone = clientPhone;
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public Integer getPlanDurationMonths() {
        return planDurationMonths;
    }

    public void setPlanDurationMonths(Integer planDurationMonths) {
        this.planDurationMonths = planDurationMonths;
    }

    public String getPlanDescription() {
        return planDescription;
    }

    public void setPlanDescription(String planDescription) {
        this.planDescription = planDescription;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEffectiveStatus() {
        return effectiveStatus;
    }

    public void setEffectiveStatus(String effectiveStatus) {
        this.effectiveStatus = effectiveStatus;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(Double amountPaid) {
        this.amountPaid = amountPaid;
    }

    public Double getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(Double remainingBalance) {
        this.remainingBalance = remainingBalance;
    }

    public Double getCustomerCredit() {
        return customerCredit;
    }

    public void setCustomerCredit(Double customerCredit) {
        this.customerCredit = customerCredit;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public List<PaymentTransactionDto> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<PaymentTransactionDto> transactions) {
        this.transactions = transactions;
    }
}

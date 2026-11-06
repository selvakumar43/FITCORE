package com.gym360.dto;

import java.time.LocalDate;

public class ExtendMembershipRequest {
    private Integer extraDays;
    private LocalDate newExpiryDate;
    private String reason;

    public ExtendMembershipRequest() {}

    public Integer getExtraDays() {
        return extraDays;
    }

    public void setExtraDays(Integer extraDays) {
        this.extraDays = extraDays;
    }

    public LocalDate getNewExpiryDate() {
        return newExpiryDate;
    }

    public void setNewExpiryDate(LocalDate newExpiryDate) {
        this.newExpiryDate = newExpiryDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}


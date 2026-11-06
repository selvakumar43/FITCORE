package com.gym360.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AssignMembershipRequest {
    @NotNull
    private Long userId;

    @NotNull
    private Long planId;

    private LocalDate startDate;

    private Double price;

    private Boolean isRenewal = false;

    public AssignMembershipRequest() {}

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Boolean getIsRenewal() {
        return isRenewal != null && isRenewal;
    }

    public void setIsRenewal(Boolean isRenewal) {
        this.isRenewal = isRenewal;
    }
}


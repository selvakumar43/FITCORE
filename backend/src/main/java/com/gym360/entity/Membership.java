package com.gym360.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "memberships")
public class Membership {

    public enum Status {
        UPCOMING,
        ACTIVE,
        EXPIRED,
        CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gym_id")
    @JsonIgnoreProperties({"memberships", "users", "plans"})
    private Gym gym;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"memberships", "password"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plan_id", nullable = false)
    private MembershipPlan plan;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Status status = Status.ACTIVE;

    @Column(nullable = false)
    private Double price;

    @OneToOne(mappedBy = "membership", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("membership")
    private Payment payment;

    public Membership() {}

    public Membership(User user, MembershipPlan plan, LocalDate startDate, LocalDate expiryDate, Status status, Double price) {
        this.user = user;
        this.plan = plan;
        this.startDate = startDate;
        this.expiryDate = expiryDate;
        this.status = status != null ? status : Status.ACTIVE;
        this.price = price != null ? Math.round(price * 100.0) / 100.0 : 0.0;
        if (user != null && user.getGym() != null) {
            this.gym = user.getGym();
        }
    }

    public Membership(Gym gym, User user, MembershipPlan plan, LocalDate startDate, LocalDate expiryDate, Status status, Double price) {
        this.gym = gym;
        this.user = user;
        this.plan = plan;
        this.startDate = startDate;
        this.expiryDate = expiryDate;
        this.status = status != null ? status : Status.ACTIVE;
        this.price = price != null ? Math.round(price * 100.0) / 100.0 : 0.0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public MembershipPlan getPlan() {
        return plan;
    }

    public void setPlan(MembershipPlan plan) {
        this.plan = plan;
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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Double getPrice() {
        return price != null ? Math.round(price * 100.0) / 100.0 : 0.0;
    }

    public void setPrice(Double price) {
        this.price = price != null ? Math.round(price * 100.0) / 100.0 : 0.0;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    /**
     * Calculates the dynamic, effective status based on current date.
     * - Cancelled: if explicitly cancelled
     * - Upcoming: if current date is before start date
     * - Expired: if current date is after expiry date
     * - Active: if current date is within start and expiry date (inclusive)
     */
    public Status getEffectiveStatus() {
        if (this.status == Status.CANCELLED) {
            return Status.CANCELLED;
        }
        if (this.status == Status.EXPIRED) {
            return Status.EXPIRED;
        }
        LocalDate today = LocalDate.now();
        if (today.isBefore(this.startDate)) {
            return Status.UPCOMING;
        } else if (today.isAfter(this.expiryDate)) {
            return Status.EXPIRED;
        } else {
            return Status.ACTIVE;
        }
    }

    public Gym getGym() {
        return gym;
    }

    public void setGym(Gym gym) {
        this.gym = gym;
    }

    public Long getGymId() {
        return gym != null ? gym.getId() : null;
    }

    public String getGymName() {
        return gym != null ? gym.getName() : null;
    }
}

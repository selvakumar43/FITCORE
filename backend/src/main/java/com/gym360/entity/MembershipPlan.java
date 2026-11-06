package com.gym360.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "membership_plans")
public class MembershipPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gym_id")
    @JsonIgnoreProperties({"plans", "users", "memberships"})
    private Gym gym;

    @Column(nullable = false)
    private String name; // Monthly, Quarterly, Yearly

    @Column(nullable = false)
    private Integer durationMonths;

    @Column(nullable = false)
    private Double price;

    private String description;

    public MembershipPlan() {}

    public MembershipPlan(String name, Integer durationMonths, Double price, String description) {
        this.name = name;
        this.durationMonths = durationMonths;
        this.price = price;
        this.description = description;
    }

    public MembershipPlan(Gym gym, String name, Integer durationMonths, Double price, String description) {
        this.gym = gym;
        this.name = name;
        this.durationMonths = durationMonths;
        this.price = price;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getDurationMonths() {
        return durationMonths;
    }

    public void setDurationMonths(Integer durationMonths) {
        this.durationMonths = durationMonths;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
}


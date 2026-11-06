package com.gym360.dto;

import com.gym360.entity.MembershipPlan;
import com.gym360.entity.User;
import java.util.ArrayList;
import java.util.List;

public class AdminDashboardResponse {
    private StatsDto stats;
    private List<User> clients;
    private List<MembershipPlan> plans;
    private List<DetailedMembershipDto> detailedMemberships;
    private List<PlanStatDto> planStats = new ArrayList<>();

    public AdminDashboardResponse() {}

    public AdminDashboardResponse(StatsDto stats, List<User> clients, List<MembershipPlan> plans,
                                  List<DetailedMembershipDto> detailedMemberships, List<PlanStatDto> planStats) {
        this.stats = stats;
        this.clients = clients;
        this.plans = plans;
        this.detailedMemberships = detailedMemberships;
        this.planStats = planStats != null ? planStats : new ArrayList<>();
    }

    public StatsDto getStats() {
        return stats;
    }

    public void setStats(StatsDto stats) {
        this.stats = stats;
    }

    public List<User> getClients() {
        return clients;
    }

    public void setClients(List<User> clients) {
        this.clients = clients;
    }

    public List<MembershipPlan> getPlans() {
        return plans;
    }

    public void setPlans(List<MembershipPlan> plans) {
        this.plans = plans;
    }

    public List<DetailedMembershipDto> getDetailedMemberships() {
        return detailedMemberships;
    }

    public void setDetailedMemberships(List<DetailedMembershipDto> detailedMemberships) {
        this.detailedMemberships = detailedMemberships;
    }

    public List<PlanStatDto> getPlanStats() {
        return planStats;
    }

    public void setPlanStats(List<PlanStatDto> planStats) {
        this.planStats = planStats;
    }

    public static class StatsDto {
        private long totalClients;
        private long activeClients;
        private long activeMemberships;
        private long upcomingMemberships;
        private long expiredMemberships;
        private long cancelledMemberships;

        private double totalRevenue;
        private double monthlyRevenue;
        private double pendingPayments;
        private double totalCustomerCredit;

        private long fullyPaidMemberships;
        private long partiallyPaidMemberships;
        private long unpaidMemberships;
        private long overpaidMemberships;

        public StatsDto() {}

        public StatsDto(long totalClients, long activeClients, long activeMemberships, long upcomingMemberships,
                        long expiredMemberships, long cancelledMemberships, double totalRevenue, double monthlyRevenue,
                        double pendingPayments, double totalCustomerCredit, long fullyPaidMemberships,
                        long partiallyPaidMemberships, long unpaidMemberships, long overpaidMemberships) {
            this.totalClients = totalClients;
            this.activeClients = activeClients;
            this.activeMemberships = activeMemberships;
            this.upcomingMemberships = upcomingMemberships;
            this.expiredMemberships = expiredMemberships;
            this.cancelledMemberships = cancelledMemberships;
            this.totalRevenue = Math.round(totalRevenue * 100.0) / 100.0;
            this.monthlyRevenue = Math.round(monthlyRevenue * 100.0) / 100.0;
            this.pendingPayments = Math.round(pendingPayments * 100.0) / 100.0;
            this.totalCustomerCredit = Math.round(totalCustomerCredit * 100.0) / 100.0;
            this.fullyPaidMemberships = fullyPaidMemberships;
            this.partiallyPaidMemberships = partiallyPaidMemberships;
            this.unpaidMemberships = unpaidMemberships;
            this.overpaidMemberships = overpaidMemberships;
        }

        public long getTotalClients() { return totalClients; }
        public void setTotalClients(long totalClients) { this.totalClients = totalClients; }

        public long getActiveClients() { return activeClients; }
        public void setActiveClients(long activeClients) { this.activeClients = activeClients; }

        public long getActiveMemberships() { return activeMemberships; }
        public void setActiveMemberships(long activeMemberships) { this.activeMemberships = activeMemberships; }

        public long getUpcomingMemberships() { return upcomingMemberships; }
        public void setUpcomingMemberships(long upcomingMemberships) { this.upcomingMemberships = upcomingMemberships; }

        public long getExpiredMemberships() { return expiredMemberships; }
        public void setExpiredMemberships(long expiredMemberships) { this.expiredMemberships = expiredMemberships; }

        public long getCancelledMemberships() { return cancelledMemberships; }
        public void setCancelledMemberships(long cancelledMemberships) { this.cancelledMemberships = cancelledMemberships; }

        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

        public double getTotalAmountCollected() { return totalRevenue; }
        public void setTotalAmountCollected(double totalAmountCollected) { this.totalRevenue = totalAmountCollected; }

        public double getMonthlyRevenue() { return monthlyRevenue; }
        public void setMonthlyRevenue(double monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }

        public double getPendingPayments() { return pendingPayments; }
        public void setPendingPayments(double pendingPayments) { this.pendingPayments = pendingPayments; }

        public double getTotalCustomerCredit() { return totalCustomerCredit; }
        public void setTotalCustomerCredit(double totalCustomerCredit) { this.totalCustomerCredit = totalCustomerCredit; }

        public long getFullyPaidMemberships() { return fullyPaidMemberships; }
        public void setFullyPaidMemberships(long fullyPaidMemberships) { this.fullyPaidMemberships = fullyPaidMemberships; }

        public long getPartiallyPaidMemberships() { return partiallyPaidMemberships; }
        public void setPartiallyPaidMemberships(long partiallyPaidMemberships) { this.partiallyPaidMemberships = partiallyPaidMemberships; }

        public long getUnpaidMemberships() { return unpaidMemberships; }
        public void setUnpaidMemberships(long unpaidMemberships) { this.unpaidMemberships = unpaidMemberships; }

        public long getOverpaidMemberships() { return overpaidMemberships; }
        public void setOverpaidMemberships(long overpaidMemberships) { this.overpaidMemberships = overpaidMemberships; }
    }

    public static class PlanStatDto {
        private Long planId;
        private String planName;
        private long membershipCount;
        private double revenueGenerated;

        public PlanStatDto() {}

        public PlanStatDto(Long planId, String planName, long membershipCount, double revenueGenerated) {
            this.planId = planId;
            this.planName = planName;
            this.membershipCount = membershipCount;
            this.revenueGenerated = Math.round(revenueGenerated * 100.0) / 100.0;
        }

        public Long getPlanId() { return planId; }
        public void setPlanId(Long planId) { this.planId = planId; }

        public String getPlanName() { return planName; }
        public void setPlanName(String planName) { this.planName = planName; }

        public long getMembershipCount() { return membershipCount; }
        public void setMembershipCount(long membershipCount) { this.membershipCount = membershipCount; }

        public double getRevenueGenerated() { return revenueGenerated; }
        public void setRevenueGenerated(double revenueGenerated) { this.revenueGenerated = revenueGenerated; }
    }
}

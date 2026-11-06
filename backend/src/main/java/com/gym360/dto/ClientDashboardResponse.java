package com.gym360.dto;

import com.gym360.entity.User;
import java.util.List;

public class ClientDashboardResponse {
    private AuthResponse.UserDto client;
    private DetailedMembershipDto currentMembership;
    private List<DetailedMembershipDto> membershipHistory;

    public ClientDashboardResponse() {}

    public ClientDashboardResponse(User client, DetailedMembershipDto currentMembership, List<DetailedMembershipDto> membershipHistory) {
        this.client = new AuthResponse.UserDto(client);
        this.currentMembership = currentMembership;
        this.membershipHistory = membershipHistory;
    }

    public AuthResponse.UserDto getClient() {
        return client;
    }

    public void setClient(AuthResponse.UserDto client) {
        this.client = client;
    }

    public DetailedMembershipDto getCurrentMembership() {
        return currentMembership;
    }

    public void setCurrentMembership(DetailedMembershipDto currentMembership) {
        this.currentMembership = currentMembership;
    }

    public List<DetailedMembershipDto> getMembershipHistory() {
        return membershipHistory;
    }

    public void setMembershipHistory(List<DetailedMembershipDto> membershipHistory) {
        this.membershipHistory = membershipHistory;
    }
}


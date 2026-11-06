package com.gym360.dto;

import com.gym360.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Admin profile information")
public class AdminProfileResponse {

    @Schema(description = "Admin User ID", example = "1")
    private Long id;

    @Schema(description = "Administrator full name", example = "Alex Carter (Admin)")
    private String name;

    @Schema(description = "Registered email address", example = "admin@gym360.com")
    private String email;

    @Schema(description = "Contact phone number", example = "9876543210")
    private String phone;

    @Schema(description = "System role", example = "ADMIN")
    private String role;

    @Schema(description = "Account status", example = "ACTIVE")
    private String status;

    @Schema(description = "Whether the administrator must change their temporary password", example = "false")
    private Boolean mustChangePassword;

    @Schema(description = "Gym ID associated with admin", example = "1")
    private Long gymId;

    @Schema(description = "Gym Name associated with admin", example = "FITCORE Flagship Gym")
    private String gymName;

    public AdminProfileResponse() {}

    public AdminProfileResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole().name();
        this.status = user.getStatus().name();
        this.mustChangePassword = user.getMustChangePassword();
        if (user.getGym() != null) {
            this.gymId = user.getGym().getId();
            this.gymName = user.getGym().getName();
        }
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(Boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
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
}


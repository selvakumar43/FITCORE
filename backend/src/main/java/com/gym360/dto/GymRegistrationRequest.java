package com.gym360.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Request payload for self-service gym registration")
public class GymRegistrationRequest {

    @Schema(description = "Name of the gym facility", example = "Titan Fitness Center")
    @NotBlank(message = "Gym name is required")
    private String gymName;

    @Schema(description = "Full name of the gym owner", example = "Marcus Vance")
    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @Schema(description = "Owner email address (used for login)", example = "marcus@titanfitness.com")
    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email format")
    private String email;

    @Schema(description = "Contact phone number", example = "9876543210")
    @NotBlank(message = "Phone number is required")
    private String phone;

    @Schema(description = "Account password (min 6 characters)", example = "OwnerPass123!")
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Schema(description = "Password confirmation", example = "OwnerPass123!")
    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;

    public GymRegistrationRequest() {}

    public GymRegistrationRequest(String gymName, String ownerName, String email, String phone, String password, String confirmPassword) {
        this.gymName = gymName;
        this.ownerName = ownerName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }

    public String getGymName() {
        return gymName;
    }

    public void setGymName(String gymName) {
        this.gymName = gymName;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}


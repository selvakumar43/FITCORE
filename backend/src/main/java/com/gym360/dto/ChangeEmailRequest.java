package com.gym360.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request to update administrator email address")
public class ChangeEmailRequest {

    @NotBlank(message = "New email is required")
    @Email(message = "New email must be a valid email address")
    @Schema(description = "New verified email address", example = "newadmin@gym360.com")
    private String newEmail;

    @NotBlank(message = "Current password is required to verify email change")
    @Schema(description = "Current administrator password for verification", example = "admin123")
    private String password;

    public ChangeEmailRequest() {}

    public ChangeEmailRequest(String newEmail, String password) {
        this.newEmail = newEmail;
        this.password = password;
    }

    public String getNewEmail() {
        return newEmail;
    }

    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}


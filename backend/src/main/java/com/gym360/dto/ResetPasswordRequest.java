package com.gym360.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Request to complete password reset using recovery token")
public class ResetPasswordRequest {

    @NotBlank(message = "Reset token is required")
    @Schema(description = "Valid password reset token", example = "a9b8c7d6-e5f4-3210-9876-543210fedcba")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "New password must be at least 6 characters long")
    @Schema(description = "New password (minimum 6 characters)", example = "NewStrongPassword#2026")
    private String newPassword;

    public ResetPasswordRequest() {}

    public ResetPasswordRequest(String token, String newPassword) {
        this.token = token;
        this.newPassword = newPassword;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}


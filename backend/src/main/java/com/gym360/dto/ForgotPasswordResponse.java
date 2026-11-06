package com.gym360.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response containing password recovery status and reset token")
public class ForgotPasswordResponse {

    @Schema(description = "Indicates whether recovery request succeeded", example = "true")
    private boolean success = true;

    @Schema(description = "Instructional message", example = "Password reset token generated. Use it within 15 minutes to reset your password.")
    private String message;

    @Schema(description = "Secure password reset recovery token", example = "a9b8c7d6-e5f4-3210-9876-543210fedcba")
    private String resetToken;

    public ForgotPasswordResponse() {}

    public ForgotPasswordResponse(boolean success, String message, String resetToken) {
        this.success = success;
        this.message = message;
        this.resetToken = resetToken;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }
}


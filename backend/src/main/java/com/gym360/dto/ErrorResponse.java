package com.gym360.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Standard API error response format")
public class ErrorResponse {

    @Schema(description = "Indicates whether the request failed", example = "true")
    private boolean error = true;

    @Schema(description = "Detailed error or validation message", example = "Invalid credentials or request parameters")
    private String message;

    public ErrorResponse() {
        this.error = true;
    }

    public ErrorResponse(boolean error, String message) {
        this.error = error;
        this.message = message;
    }

    public boolean isError() {
        return error;
    }

    public void setError(boolean error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}


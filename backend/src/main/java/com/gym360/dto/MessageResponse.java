package com.gym360.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Standard API success message response format")
public class MessageResponse {

    @Schema(description = "Informative status message", example = "Operation completed successfully.")
    private String message;

    public MessageResponse() {}

    public MessageResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}


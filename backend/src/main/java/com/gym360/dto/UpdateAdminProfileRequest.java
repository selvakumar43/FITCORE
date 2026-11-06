package com.gym360.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request to update administrator profile information")
public class UpdateAdminProfileRequest {

    @NotBlank(message = "Name cannot be blank")
    @Schema(description = "Updated full name", example = "Alex Carter (Gym Owner)")
    private String name;

    @Schema(description = "Updated phone number", example = "9876543210")
    private String phone;

    public UpdateAdminProfileRequest() {}

    public UpdateAdminProfileRequest(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}


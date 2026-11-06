package com.gym360.dto;

import com.gym360.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ClientRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    private String phone;
    private String password;
    private String confirmPassword;
    private User.Status status = User.Status.ACTIVE;

    public ClientRequest() {}

    public ClientRequest(String name, String email, String phone, String password, String confirmPassword, User.Status status) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.status = status != null ? status : User.Status.ACTIVE;
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

    public User.Status getStatus() {
        return status;
    }

    public void setStatus(User.Status status) {
        this.status = status;
    }
}


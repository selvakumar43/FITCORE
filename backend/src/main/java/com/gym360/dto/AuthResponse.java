package com.gym360.dto;

import com.gym360.entity.User;

public class AuthResponse {
    private String token;
    private UserDto user;

    public AuthResponse() {}

    public AuthResponse(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String role;
        private String status;
        private Boolean mustChangePassword;
        private Long gymId;
        private String gymName;

        public UserDto() {}

        public UserDto(User user) {
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
}


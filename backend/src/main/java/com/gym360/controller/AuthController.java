package com.gym360.controller;

import com.gym360.dto.*;
import com.gym360.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication, password recovery, and profile retrieval")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Operation(summary = "Register Gym (Self-Service Multi-Tenant Onboarding)", description = "Allows a gym owner to register a new gym, establish an ADMIN account, and auto-initialize default membership plans.")
    @SecurityRequirements
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Gym registered successfully, token and owner details returned",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error, duplicate email, or passwords do not match",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/register-gym")
    public ResponseEntity<AuthResponse> registerGym(@Valid @RequestBody GymRegistrationRequest request) {
        return ResponseEntity.ok(authService.registerGym(request));
    }

    @Operation(summary = "User Login", description = "Authenticate with email and password to receive a JWT Bearer token")
    @SecurityRequirements
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid email or password",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "User account deactivated",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Current User Profile", description = "Retrieve profile details of the authenticated user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User profile retrieved",
                    content = @Content(schema = @Schema(implementation = AuthResponse.UserDto.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid Bearer token",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }

    @Operation(summary = "Forgot Password (Recovery Request)", description = "Generate a secure 15-minute recovery token to reset account password")
    @SecurityRequirements
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recovery token generated",
                    content = @Content(schema = @Schema(implementation = ForgotPasswordResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid email or account not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @Operation(summary = "Reset Password (Complete Recovery)", description = "Set a new password using a valid recovery token")
    @SecurityRequirements
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password reset successfully",
                    content = @Content(schema = @Schema(implementation = MessageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid/expired token or password too short",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @Operation(summary = "Public Admin Registration (Disabled)", description = "Public registration of administrator accounts is disabled. Only the system developer/data initialization may establish the administrator account.")
    @SecurityRequirements
    @ApiResponses({
            @ApiResponse(responseCode = "403", description = "Public admin registration is strictly forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/register-admin")
    public ResponseEntity<Void> registerAdmin() {
        throw new org.springframework.security.access.AccessDeniedException("Public registration of Administrator accounts is disabled. Only the initial system administrator exists.");
    }
}

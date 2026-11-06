package com.gym360.controller;

import com.gym360.dto.ChangePasswordRequest;
import com.gym360.dto.ClientDashboardResponse;
import com.gym360.dto.ErrorResponse;
import com.gym360.dto.MessageResponse;
import com.gym360.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/client")
@Tag(name = "Client Portal", description = "Endpoints for authenticated gym clients to view their membership and payment status")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @Operation(
            summary = "Get Client Dashboard",
            description = "Retrieve personal membership details, start/expiry dates, payment status, remaining balance, and past membership history"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Client dashboard details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ClientDashboardResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT Bearer token required",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - Access denied",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/dashboard")
    public ResponseEntity<ClientDashboardResponse> getClientDashboard(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(clientService.getClientDashboard(authentication.getName()));
    }

    @Operation(
            summary = "Client Change Password",
            description = "Allows an authenticated gym member / client to securely change their login password"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password changed successfully",
                    content = @Content(schema = @Schema(implementation = MessageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error, password mismatch, or identical to current",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Current password verification failed",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - Access denied",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/change-password")
    public ResponseEntity<MessageResponse> changeClientPassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(clientService.changeClientPassword(authentication.getName(), request));
    }
}

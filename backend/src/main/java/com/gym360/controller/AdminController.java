package com.gym360.controller;

import com.gym360.dto.*;
import com.gym360.entity.MembershipPlan;
import com.gym360.entity.User;
import com.gym360.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
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

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Management", description = "Endpoints for managing gym analytics, clients, plans, memberships, and payments")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // --- Admin Profile & Account Management ---
    @Operation(summary = "Get Admin Profile", description = "Retrieve current administrator's account details, role, and temporary password status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Admin profile retrieved",
                    content = @Content(schema = @Schema(implementation = AdminProfileResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid Bearer token",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/profile")
    public ResponseEntity<AdminProfileResponse> getAdminProfile(Authentication authentication) {
        return ResponseEntity.ok(adminService.getAdminProfile(authentication.getName()));
    }

    @Operation(summary = "Update Admin Profile", description = "Update administrator name and contact phone number")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile updated successfully",
                    content = @Content(schema = @Schema(implementation = AdminProfileResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/profile")
    public ResponseEntity<AdminProfileResponse> updateAdminProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateAdminProfileRequest request) {
        return ResponseEntity.ok(adminService.updateAdminProfile(authentication.getName(), request));
    }

    @Operation(summary = "Change Admin Email", description = "Update administrator email address with password verification. Issues a fresh JWT token with the new email.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Email updated successfully, new token issued",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Duplicate email or validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Current password verification failed",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/profile/email")
    public ResponseEntity<AuthResponse> changeAdminEmail(
            Authentication authentication,
            @Valid @RequestBody ChangeEmailRequest request) {
        return ResponseEntity.ok(adminService.changeAdminEmail(authentication.getName(), request));
    }

    @Operation(summary = "Change Admin Password", description = "Update administrator account password. Requires verification of current password and removes first-login password change requirement.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password changed successfully",
                    content = @Content(schema = @Schema(implementation = MessageResponse.class))),
            @ApiResponse(responseCode = "400", description = "New password identical to current or too short",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Current password verification failed",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/profile/change-password")
    public ResponseEntity<MessageResponse> changeAdminPassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(adminService.changeAdminPassword(authentication.getName(), request));
    }

    // --- Dashboard ---
    @Operation(summary = "Get Admin Dashboard Analytics", description = "Returns aggregated gym metrics (total/active clients, active/upcoming/expired/cancelled memberships, total/monthly revenue, pending payments, customer credit, and membership plan breakdown)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dashboard analytics retrieved",
                    content = @Content(schema = @Schema(implementation = AdminDashboardResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid Bearer token",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard(Authentication authentication) {
        return ResponseEntity.ok(adminService.getDashboardData(authentication));
    }

    // --- Clients ---
    @Operation(summary = "List All Clients", description = "Retrieve list of all gym clients registered in this gym facility")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Clients list retrieved",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = User.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/clients")
    public ResponseEntity<List<User>> getAllClients(Authentication authentication) {
        return ResponseEntity.ok(adminService.getAllClients(authentication));
    }

    @Operation(summary = "Register New Client", description = "Create a new client account in this gym with unique email, unique phone, and default status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Client registered successfully",
                    content = @Content(schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "400", description = "Validation error or duplicate email/phone",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/clients")
    public ResponseEntity<User> addClient(
            Authentication authentication,
            @Valid @RequestBody ClientRequest request) {
        return ResponseEntity.ok(adminService.addClient(authentication, request));
    }

    @Operation(summary = "Update Client Details", description = "Modify client profile including name, email, phone, status, or reset password within this gym")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Client updated successfully",
                    content = @Content(schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "400", description = "Client not found or email/phone already taken",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/clients/{id}")
    public ResponseEntity<User> updateClient(
            Authentication authentication,
            @Parameter(description = "Client ID to update", required = true) @PathVariable Long id,
            @Valid @RequestBody ClientRequest request) {
        return ResponseEntity.ok(adminService.updateClient(authentication, id, request));
    }

    @Operation(summary = "Toggle Client Status", description = "Toggle client status between ACTIVE and INACTIVE (blocking / unblocking login)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status toggled successfully",
                    content = @Content(schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "400", description = "Client not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PatchMapping("/clients/{id}/status")
    public ResponseEntity<User> toggleClientStatus(
            Authentication authentication,
            @Parameter(description = "Client ID to toggle", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleClientStatus(authentication, id));
    }

    @Operation(summary = "Delete Client", description = "Delete client without memberships. Rejects hard deletion if client has historical records to preserve financial integrity.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Client deleted successfully",
                    content = @Content(schema = @Schema(implementation = MessageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Client has existing memberships/payments or not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/clients/{id}")
    public ResponseEntity<MessageResponse> deleteClient(
            Authentication authentication,
            @Parameter(description = "Client ID to delete", required = true) @PathVariable Long id) {
        adminService.deleteClient(authentication, id);
        return ResponseEntity.ok(new MessageResponse("Client successfully deleted."));
    }

    // --- Membership Plans ---
    @Operation(summary = "List All Membership Plans", description = "Retrieve all gym membership plans (Monthly, Quarterly, Yearly, etc.) configured for this gym facility")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plans list retrieved",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = MembershipPlan.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/plans")
    public ResponseEntity<List<MembershipPlan>> getAllPlans(Authentication authentication) {
        return ResponseEntity.ok(adminService.getAllPlans(authentication));
    }

    @Operation(summary = "Create Membership Plan", description = "Add a new membership plan with duration in months and price for this gym facility")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plan created successfully",
                    content = @Content(schema = @Schema(implementation = MembershipPlan.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/plans")
    public ResponseEntity<MembershipPlan> createPlan(
            Authentication authentication,
            @Valid @RequestBody PlanRequest request) {
        return ResponseEntity.ok(adminService.createPlan(authentication, request));
    }

    @Operation(summary = "Update Membership Plan", description = "Update duration or price of an existing plan without altering historical agreed prices")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plan updated successfully",
                    content = @Content(schema = @Schema(implementation = MembershipPlan.class))),
            @ApiResponse(responseCode = "400", description = "Plan not found or validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/plans/{id}")
    public ResponseEntity<MembershipPlan> updatePlan(
            Authentication authentication,
            @Parameter(description = "Plan ID to update", required = true) @PathVariable Long id,
            @Valid @RequestBody PlanRequest request) {
        return ResponseEntity.ok(adminService.updatePlan(authentication, id, request));
    }

    @Operation(summary = "Delete Membership Plan", description = "Delete a membership plan if no active or past memberships are assigned to it")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plan deleted successfully",
                    content = @Content(schema = @Schema(implementation = MessageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Plan has assigned memberships or not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/plans/{id}")
    public ResponseEntity<MessageResponse> deletePlan(
            Authentication authentication,
            @Parameter(description = "Plan ID to delete", required = true) @PathVariable Long id) {
        adminService.deletePlan(authentication, id);
        return ResponseEntity.ok(new MessageResponse("Membership plan successfully deleted."));
    }

    // --- Memberships & Renewals ---
    @Operation(summary = "Assign or Renew Membership", description = "Assign a membership plan to a client or renew an existing membership within this gym. Automatically calculates expiry date based on plan duration. Preserves agreed price and historical records.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Membership assigned or renewed successfully",
                    content = @Content(schema = @Schema(implementation = DetailedMembershipDto.class))),
            @ApiResponse(responseCode = "400", description = "Client already has active membership without renewal flag or invalid plan",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/memberships/assign")
    public ResponseEntity<DetailedMembershipDto> assignOrRenewMembership(
            Authentication authentication,
            @Valid @RequestBody AssignMembershipRequest request) {
        return ResponseEntity.ok(adminService.assignOrRenewMembership(authentication, request));
    }

    @Operation(summary = "Cancel Membership", description = "Explicitly cancel a membership within this gym, transitioning its status to CANCELLED")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Membership cancelled successfully",
                    content = @Content(schema = @Schema(implementation = DetailedMembershipDto.class))),
            @ApiResponse(responseCode = "400", description = "Membership not found or already cancelled",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/memberships/{id}/cancel")
    public ResponseEntity<DetailedMembershipDto> cancelMembership(
            Authentication authentication,
            @Parameter(description = "Membership ID to cancel", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(adminService.cancelMembership(authentication, id));
    }

    @Operation(summary = "Extend Membership", description = "Extend an active membership by a number of extra days or to a specific new expiry date")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Membership expiry date extended",
                    content = @Content(schema = @Schema(implementation = DetailedMembershipDto.class))),
            @ApiResponse(responseCode = "400", description = "Membership not found or cannot extend cancelled/expired membership",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/memberships/{id}/extend")
    public ResponseEntity<DetailedMembershipDto> extendMembership(
            Authentication authentication,
            @Parameter(description = "Membership ID to extend", required = true) @PathVariable Long id,
            @RequestBody ExtendMembershipRequest request) {
        return ResponseEntity.ok(adminService.extendMembership(authentication, id, request));
    }

    // --- Payments ---
    @Operation(summary = "Update Payment Details Manually", description = "Manually update amount paid and payment status (UNPAID, PARTIALLY_PAID, PAID, OVERPAID). Automatically calculates remaining balance and customer credit.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Payment details updated successfully",
                    content = @Content(schema = @Schema(implementation = DetailedMembershipDto.class))),
            @ApiResponse(responseCode = "400", description = "Membership not found or invalid payment data",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/payments/{membershipId}")
    public ResponseEntity<DetailedMembershipDto> updatePayment(
            Authentication authentication,
            @Parameter(description = "Membership ID associated with payment", required = true) @PathVariable Long membershipId,
            @Valid @RequestBody PaymentUpdateRequest request) {
        return ResponseEntity.ok(adminService.updatePayment(authentication, membershipId, request));
    }

    @Operation(summary = "Record Payment Transaction or Refund", description = "Record an installment payment or refund transaction against a membership with duplicate reference check and transaction audit log")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Payment transaction recorded",
                    content = @Content(schema = @Schema(implementation = DetailedMembershipDto.class))),
            @ApiResponse(responseCode = "400", description = "Duplicate transaction reference or refund exceeds paid amount",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/payments/{membershipId}/transactions")
    public ResponseEntity<DetailedMembershipDto> addPaymentTransaction(
            Authentication authentication,
            @Parameter(description = "Membership ID to apply transaction", required = true) @PathVariable Long membershipId,
            @Valid @RequestBody PaymentTransactionRequest request) {
        return ResponseEntity.ok(adminService.addPaymentTransaction(authentication, membershipId, request));
    }
}

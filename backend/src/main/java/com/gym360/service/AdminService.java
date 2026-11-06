package com.gym360.service;

import com.gym360.dto.*;
import com.gym360.entity.*;
import com.gym360.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    @Autowired
    private GymRepository gymRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentTransactionRepository transactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.gym360.security.JwtUtils jwtUtils;

    private User getAuthenticatedAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required. Please provide a valid Bearer token.");
        }
        User admin = userRepository.findByEmail(authentication.getName().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Administrator not found with email: " + authentication.getName()));
        if (admin.getRole() != User.Role.ADMIN && admin.getRole() != User.Role.SUPER_ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: User is not an administrator");
        }
        if (admin.getGym() == null) {
            // Self-heal or assign to default gym if unlinked
            Gym defaultGym = gymRepository.findById(1L).orElseGet(() -> gymRepository.findAll().stream().findFirst().orElse(null));
            if (defaultGym != null) {
                admin.setGym(defaultGym);
                admin = userRepository.save(admin);
            } else {
                throw new IllegalStateException("Administrator account is not associated with any gym facility.");
            }
        }
        return admin;
    }

    // --- Admin Profile & Account Management ---
    @Transactional(readOnly = true)
    public AdminProfileResponse getAdminProfile(String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Administrator not found with email: " + email));
        if (admin.getRole() != User.Role.ADMIN && admin.getRole() != User.Role.SUPER_ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("User is not an administrator");
        }
        return new AdminProfileResponse(admin);
    }

    public AdminProfileResponse updateAdminProfile(String currentEmail, UpdateAdminProfileRequest request) {
        User admin = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Administrator not found with email: " + currentEmail));
        if (admin.getRole() != User.Role.ADMIN && admin.getRole() != User.Role.SUPER_ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("User is not an administrator");
        }

        admin.setName(request.getName().trim());
        if (request.getPhone() != null) {
            admin.setPhone(request.getPhone().trim());
        }

        User saved = userRepository.save(admin);
        return new AdminProfileResponse(saved);
    }

    public AuthResponse changeAdminEmail(String currentEmail, ChangeEmailRequest request) {
        User admin = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Administrator not found with email: " + currentEmail));
        if (admin.getRole() != User.Role.ADMIN && admin.getRole() != User.Role.SUPER_ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("User is not an administrator");
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new org.springframework.security.authentication.BadCredentialsException("Current password verification failed");
        }

        String newEmail = request.getNewEmail().trim().toLowerCase();
        if (userRepository.existsByEmailAndIdNot(newEmail, admin.getId())) {
            throw new IllegalArgumentException("Email '" + newEmail + "' is already registered to another account");
        }

        admin.setEmail(newEmail);
        User saved = userRepository.save(admin);

        Long gymId = saved.getGym() != null ? saved.getGym().getId() : null;
        String newToken = jwtUtils.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId(), gymId);
        return new AuthResponse(newToken, new AuthResponse.UserDto(saved));
    }

    public MessageResponse changeAdminPassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new org.springframework.security.authentication.BadCredentialsException("Current password is incorrect");
        }

        String newPassword = request.getNewPassword().trim();
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("New password cannot be identical to your current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);

        return new MessageResponse("Password has been changed successfully. Your account is now secured.");
    }

    // --- Multi-Tenant Dashboard ---
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardData(Authentication auth) {
        User admin = getAuthenticatedAdmin(auth);
        Long gymId = admin.getGym().getId();

        long totalClients = userRepository.countByGymIdAndRole(gymId, User.Role.CLIENT);
        long activeClients = userRepository.countByGymIdAndRoleAndStatus(gymId, User.Role.CLIENT, User.Status.ACTIVE);
        List<User> clients = userRepository.findByGymIdAndRole(gymId, User.Role.CLIENT);
        List<MembershipPlan> plans = planRepository.findByGymId(gymId);

        List<Membership> allMemberships = membershipRepository.findByGymId(gymId);

        long activeMemberships = 0;
        long upcomingMemberships = 0;
        long expiredMemberships = 0;
        long cancelledMemberships = 0;

        long fullyPaidMemberships = 0;
        long partiallyPaidMemberships = 0;
        long unpaidMemberships = 0;
        long overpaidMemberships = 0;

        double totalRevenue = 0.0;
        double pendingPayments = 0.0;
        double totalCustomerCredit = 0.0;

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        Map<Long, PlanStatAccumulator> planStatMap = new HashMap<>();
        for (MembershipPlan plan : plans) {
            planStatMap.put(plan.getId(), new PlanStatAccumulator(plan.getId(), plan.getName()));
        }

        for (Membership m : allMemberships) {
            Membership.Status effectiveStatus = m.getEffectiveStatus();
            switch (effectiveStatus) {
                case ACTIVE -> activeMemberships++;
                case UPCOMING -> upcomingMemberships++;
                case EXPIRED -> expiredMemberships++;
                case CANCELLED -> cancelledMemberships++;
            }

            Payment p = m.getPayment();
            if (p != null) {
                double paid = p.getAmountPaid();
                totalRevenue += paid;
                pendingPayments += p.getRemainingBalance();
                totalCustomerCredit += p.getCustomerCredit();

                Payment.PaymentStatus pStatus = p.getPaymentStatus();
                if (pStatus == Payment.PaymentStatus.PAID) {
                    fullyPaidMemberships++;
                } else if (pStatus == Payment.PaymentStatus.PARTIALLY_PAID) {
                    partiallyPaidMemberships++;
                } else if (pStatus == Payment.PaymentStatus.OVERPAID) {
                    overpaidMemberships++;
                } else {
                    unpaidMemberships++;
                }

                if (m.getPlan() != null && planStatMap.containsKey(m.getPlan().getId())) {
                    PlanStatAccumulator acc = planStatMap.get(m.getPlan().getId());
                    acc.count++;
                    acc.revenue += paid;
                }
            } else {
                unpaidMemberships++;
                pendingPayments += m.getPrice();
            }
        }

        Double monthlyRevenue = paymentRepository.sumRevenueBetweenDatesForGym(gymId, startOfMonth, endOfMonth);
        if (monthlyRevenue == null) monthlyRevenue = 0.0;

        AdminDashboardResponse.StatsDto stats = new AdminDashboardResponse.StatsDto(
                totalClients,
                activeClients,
                activeMemberships,
                upcomingMemberships,
                expiredMemberships,
                cancelledMemberships,
                totalRevenue,
                monthlyRevenue,
                pendingPayments,
                totalCustomerCredit,
                fullyPaidMemberships,
                partiallyPaidMemberships,
                unpaidMemberships,
                overpaidMemberships
        );

        List<AdminDashboardResponse.PlanStatDto> planStats = planStatMap.values().stream()
                .map(acc -> new AdminDashboardResponse.PlanStatDto(acc.planId, acc.planName, acc.count, acc.revenue))
                .collect(Collectors.toList());

        List<DetailedMembershipDto> detailedMemberships = allMemberships.stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .map(DetailedMembershipDto::new)
                .collect(Collectors.toList());

        return new AdminDashboardResponse(stats, clients, plans, detailedMemberships, planStats);
    }

    private static class PlanStatAccumulator {
        Long planId;
        String planName;
        long count = 0;
        double revenue = 0.0;
        PlanStatAccumulator(Long planId, String planName) {
            this.planId = planId;
            this.planName = planName;
        }
    }

    // --- Multi-Tenant Clients Management ---
    @Transactional(readOnly = true)
    public List<User> getAllClients(Authentication auth) {
        User admin = getAuthenticatedAdmin(auth);
        return userRepository.findByGymIdAndRole(admin.getGym().getId(), User.Role.CLIENT);
    }

    public User addClient(Authentication auth, ClientRequest request) {
        User admin = getAuthenticatedAdmin(auth);

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("A client with email '" + email + "' already exists");
        }

        String phone = (request.getPhone() != null) ? request.getPhone().trim() : "";
        if (!phone.isEmpty() && userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("A client with phone number '" + phone + "' already exists");
        }

        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : "client123";

        if (rawPassword.length() < 6) {
            throw new IllegalArgumentException("Initial password must be at least 6 characters long");
        }

        if (request.getConfirmPassword() != null && !request.getConfirmPassword().trim().isEmpty()) {
            if (!rawPassword.equals(request.getConfirmPassword().trim())) {
                throw new IllegalArgumentException("Initial password and confirmation password do not match");
            }
        }

        User client = new User(
                request.getName().trim(),
                email,
                passwordEncoder.encode(rawPassword),
                phone,
                User.Role.CLIENT,
                request.getStatus() != null ? request.getStatus() : User.Status.ACTIVE
        );
        client.setGym(admin.getGym());

        return userRepository.save(client);
    }

    public User updateClient(Authentication auth, Long id, ClientRequest request) {
        User admin = getAuthenticatedAdmin(auth);
        User client = userRepository.findByIdAndGymId(id, admin.getGym().getId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with id: " + id + " in your gym"));

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!client.getEmail().equalsIgnoreCase(newEmail)) {
            if (userRepository.existsByEmailAndIdNot(newEmail, client.getId())) {
                throw new IllegalArgumentException("Email '" + newEmail + "' is already taken by another account");
            }
            client.setEmail(newEmail);
        }

        String newPhone = (request.getPhone() != null) ? request.getPhone().trim() : "";
        if (!newPhone.isEmpty() && !newPhone.equalsIgnoreCase(client.getPhone())) {
            if (userRepository.existsByPhoneAndIdNot(newPhone, client.getId())) {
                throw new IllegalArgumentException("Phone number '" + newPhone + "' is already registered to another account");
            }
            client.setPhone(newPhone);
        } else if (request.getPhone() != null) {
            client.setPhone(newPhone);
        }

        client.setName(request.getName().trim());
        if (request.getStatus() != null) {
            client.setStatus(request.getStatus());
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            String newPass = request.getPassword().trim();
            if (newPass.length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters long");
            }
            if (request.getConfirmPassword() != null && !request.getConfirmPassword().trim().isEmpty()) {
                if (!newPass.equals(request.getConfirmPassword().trim())) {
                    throw new IllegalArgumentException("Password and confirmation password do not match");
                }
            }
            client.setPassword(passwordEncoder.encode(newPass));
        }

        return userRepository.save(client);
    }

    public User toggleClientStatus(Authentication auth, Long id) {
        User admin = getAuthenticatedAdmin(auth);
        User client = userRepository.findByIdAndGymId(id, admin.getGym().getId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with id: " + id + " in your gym"));

        client.setStatus(client.getStatus() == User.Status.ACTIVE ? User.Status.INACTIVE : User.Status.ACTIVE);
        return userRepository.save(client);
    }

    public void deleteClient(Authentication auth, Long id) {
        User admin = getAuthenticatedAdmin(auth);
        User client = userRepository.findByIdAndGymId(id, admin.getGym().getId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with id: " + id + " in your gym"));

        List<Membership> memberships = membershipRepository.findByGymIdAndUserIdOrderByStartDateDescIdDesc(admin.getGym().getId(), id);
        if (!memberships.isEmpty()) {
            throw new IllegalStateException("Cannot delete client with existing memberships or financial records. Deactivate the client instead to preserve transaction history.");
        }

        userRepository.delete(client);
    }

    // --- Multi-Tenant Membership Plans ---
    @Transactional(readOnly = true)
    public List<MembershipPlan> getAllPlans(Authentication auth) {
        User admin = getAuthenticatedAdmin(auth);
        return planRepository.findByGymId(admin.getGym().getId());
    }

    public MembershipPlan createPlan(Authentication auth, PlanRequest request) {
        User admin = getAuthenticatedAdmin(auth);

        MembershipPlan plan = new MembershipPlan(
                admin.getGym(),
                request.getName().trim(),
                request.getDurationMonths(),
                request.getPrice(),
                request.getDescription() != null ? request.getDescription().trim() : ""
        );
        return planRepository.save(plan);
    }

    public MembershipPlan updatePlan(Authentication auth, Long id, PlanRequest request) {
        User admin = getAuthenticatedAdmin(auth);
        MembershipPlan plan = planRepository.findByIdAndGymId(id, admin.getGym().getId())
                .orElseThrow(() -> new IllegalArgumentException("Membership plan not found with id: " + id + " in your gym"));

        plan.setName(request.getName().trim());
        plan.setDurationMonths(request.getDurationMonths());
        plan.setPrice(request.getPrice());
        if (request.getDescription() != null) {
            plan.setDescription(request.getDescription().trim());
        }

        return planRepository.save(plan);
    }

    public void deletePlan(Authentication auth, Long id) {
        User admin = getAuthenticatedAdmin(auth);
        MembershipPlan plan = planRepository.findByIdAndGymId(id, admin.getGym().getId())
                .orElseThrow(() -> new IllegalArgumentException("Membership plan not found with id: " + id + " in your gym"));

        if (membershipRepository.existsByPlanId(id)) {
            throw new IllegalStateException("Cannot delete plan '" + plan.getName() + "': Memberships are currently assigned to it. Please retain or edit the plan instead.");
        }

        planRepository.delete(plan);
    }

    // --- Multi-Tenant Assign & Renew Memberships ---
    public DetailedMembershipDto assignOrRenewMembership(Authentication auth, AssignMembershipRequest request) {
        User admin = getAuthenticatedAdmin(auth);
        Long gymId = admin.getGym().getId();

        User client = userRepository.findByIdAndGymId(request.getUserId(), gymId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with id: " + request.getUserId() + " in your gym"));

        MembershipPlan plan = planRepository.findByIdAndGymId(request.getPlanId(), gymId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found with id: " + request.getPlanId() + " in your gym"));

        LocalDate today = LocalDate.now();

        // Find existing non-expired, non-cancelled memberships for this client in this gym
        List<Membership> userMemberships = membershipRepository.findByGymIdAndUserIdOrderByStartDateDescIdDesc(gymId, client.getId());
        Optional<Membership> ongoingActiveOpt = userMemberships.stream()
                .filter(m -> m.getStatus() != Membership.Status.CANCELLED &&
                             m.getStatus() != Membership.Status.EXPIRED &&
                             (m.getEffectiveStatus() == Membership.Status.ACTIVE || m.getEffectiveStatus() == Membership.Status.UPCOMING))
                .findFirst();

        LocalDate startDate;
        if (request.getStartDate() != null) {
            startDate = request.getStartDate();
        } else if (request.getIsRenewal() && ongoingActiveOpt.isPresent()) {
            startDate = ongoingActiveOpt.get().getExpiryDate().plusDays(1);
        } else {
            startDate = today;
        }

        LocalDate expiryDate = startDate.plusMonths(plan.getDurationMonths());
        Double agreedPrice = (request.getPrice() != null && request.getPrice() >= 0)
                ? Math.round(request.getPrice() * 100.0) / 100.0
                : plan.getPrice();

        if (ongoingActiveOpt.isPresent()) {
            if (request.getIsRenewal()) {
                Membership previous = ongoingActiveOpt.get();
                if (!startDate.isAfter(today) || !startDate.isAfter(previous.getExpiryDate())) {
                    previous.setStatus(Membership.Status.EXPIRED);
                    if (previous.getExpiryDate().isAfter(startDate)) {
                        LocalDate adjustedExpiry = startDate.minusDays(1);
                        if (adjustedExpiry.isBefore(previous.getStartDate())) {
                            adjustedExpiry = previous.getStartDate();
                        }
                        previous.setExpiryDate(adjustedExpiry);
                    }
                }
                membershipRepository.save(previous);
            } else {
                throw new IllegalArgumentException(
                        "Client already has an active or upcoming membership (Plan: " +
                        ongoingActiveOpt.get().getPlan().getName() + ", Expires: " +
                        ongoingActiveOpt.get().getExpiryDate() + "). Please choose 'Renew' to extend or renew their membership."
                );
            }
        }

        Membership.Status initialStatus = startDate.isAfter(today) ? Membership.Status.UPCOMING : Membership.Status.ACTIVE;

        Membership newMembership = new Membership(
                admin.getGym(),
                client,
                plan,
                startDate,
                expiryDate,
                initialStatus,
                agreedPrice
        );
        Membership savedMembership = membershipRepository.save(newMembership);

        // Initialize associated Payment record
        Payment payment = new Payment(
                savedMembership,
                0.0,
                Payment.PaymentStatus.UNPAID,
                startDate
        );
        Payment savedPayment = paymentRepository.save(payment);
        savedMembership.setPayment(savedPayment);

        return new DetailedMembershipDto(savedMembership);
    }

    // --- Multi-Tenant Membership Extension ---
    public DetailedMembershipDto extendMembership(Authentication auth, Long membershipId, ExtendMembershipRequest request) {
        User admin = getAuthenticatedAdmin(auth);
        Membership membership = membershipRepository.findByIdAndGymId(membershipId, admin.getGym().getId())
                .orElseThrow(() -> new IllegalArgumentException("Membership not found with id: " + membershipId + " in your gym"));

        if (membership.getStatus() == Membership.Status.CANCELLED) {
            throw new IllegalStateException("Cannot extend a cancelled membership.");
        }

        if (request.getNewExpiryDate() != null) {
            if (request.getNewExpiryDate().isBefore(membership.getStartDate())) {
                throw new IllegalArgumentException("New expiry date cannot be before start date (" + membership.getStartDate() + ")");
            }
            membership.setExpiryDate(request.getNewExpiryDate());
        } else if (request.getExtraDays() != null && request.getExtraDays() > 0) {
            membership.setExpiryDate(membership.getExpiryDate().plusDays(request.getExtraDays()));
        } else {
            throw new IllegalArgumentException("Please provide valid extra days (e.g. 15, 30) or a new expiry date.");
        }

        // Re-evaluate status
        if (membership.getStatus() == Membership.Status.EXPIRED && !LocalDate.now().isAfter(membership.getExpiryDate())) {
            membership.setStatus(LocalDate.now().isBefore(membership.getStartDate()) ? Membership.Status.UPCOMING : Membership.Status.ACTIVE);
        }

        membershipRepository.save(membership);
        return new DetailedMembershipDto(membership);
    }

    // --- Multi-Tenant Membership Cancellation ---
    public DetailedMembershipDto cancelMembership(Authentication auth, Long membershipId) {
        User admin = getAuthenticatedAdmin(auth);
        Membership membership = membershipRepository.findByIdAndGymId(membershipId, admin.getGym().getId())
                .orElseThrow(() -> new IllegalArgumentException("Membership not found with id: " + membershipId + " in your gym"));

        membership.setStatus(Membership.Status.CANCELLED);
        membershipRepository.save(membership);
        return new DetailedMembershipDto(membership);
    }

    // --- Multi-Tenant Payments ---
    public DetailedMembershipDto updatePayment(Authentication auth, Long membershipId, PaymentUpdateRequest request) {
        User admin = getAuthenticatedAdmin(auth);
        Membership membership = membershipRepository.findByIdAndGymId(membershipId, admin.getGym().getId())
                .orElseThrow(() -> new IllegalArgumentException("Membership not found with id: " + membershipId + " in your gym"));

        Payment payment = paymentRepository.findByMembershipId(membershipId)
                .orElseGet(() -> {
                    Payment p = new Payment(membership, 0.0, Payment.PaymentStatus.UNPAID, LocalDate.now());
                    return paymentRepository.save(p);
                });

        double amount = Math.round(request.getAmountPaid() * 100.0) / 100.0;
        if (amount < 0) {
            throw new IllegalArgumentException("Paid amount cannot be negative.");
        }

        payment.setAmountPaid(amount);
        payment.setUpdatedAt(LocalDate.now());

        // Automatically determine valid payment status based on amountPaid vs agreed price
        payment.recalculateStatus();

        paymentRepository.save(payment);
        membership.setPayment(payment);

        return new DetailedMembershipDto(membership);
    }

    // --- Multi-Tenant Payment Transactions (Installments & Refunds) ---
    public DetailedMembershipDto addPaymentTransaction(Authentication auth, Long membershipId, PaymentTransactionRequest request) {
        User admin = getAuthenticatedAdmin(auth);
        Membership membership = membershipRepository.findByIdAndGymId(membershipId, admin.getGym().getId())
                .orElseThrow(() -> new IllegalArgumentException("Membership not found with id: " + membershipId + " in your gym"));

        Payment payment = paymentRepository.findByMembershipId(membershipId)
                .orElseGet(() -> {
                    Payment p = new Payment(membership, 0.0, Payment.PaymentStatus.UNPAID, LocalDate.now());
                    return paymentRepository.save(p);
                });

        double txAmount = Math.round(request.getAmount() * 100.0) / 100.0;
        if (txAmount <= 0) {
            throw new IllegalArgumentException("Transaction amount must be strictly greater than zero.");
        }

        // Duplicate transaction prevention
        if (request.getTransactionReference() != null && !request.getTransactionReference().trim().isEmpty()) {
            String ref = request.getTransactionReference().trim();
            if (transactionRepository.existsByTransactionReference(ref)) {
                throw new IllegalStateException("Duplicate transaction reference '" + ref + "'. This transaction has already been processed.");
            }
        }

        PaymentTransaction.Type type = request.getType() != null ? request.getType() : PaymentTransaction.Type.PAYMENT;

        if (type == PaymentTransaction.Type.REFUND) {
            if (txAmount > payment.getAmountPaid()) {
                throw new IllegalArgumentException("Refund amount ($" + txAmount + ") cannot exceed total amount paid so far ($" + payment.getAmountPaid() + ").");
            }
            payment.setAmountPaid(payment.getAmountPaid() - txAmount);
        } else {
            payment.setAmountPaid(payment.getAmountPaid() + txAmount);
        }

        payment.recalculateStatus();
        payment.setUpdatedAt(LocalDate.now());

        PaymentTransaction tx = new PaymentTransaction(
                payment,
                txAmount,
                type,
                request.getTransactionReference() != null ? request.getTransactionReference().trim() : null,
                request.getNotes() != null ? request.getNotes().trim() : null,
                LocalDateTime.now()
        );

        payment.addTransaction(tx);
        transactionRepository.save(tx);
        paymentRepository.save(payment);
        membership.setPayment(payment);

        return new DetailedMembershipDto(membership);
    }
}

package com.gym360.service;

import com.gym360.dto.*;
import com.gym360.entity.Gym;
import com.gym360.entity.MembershipPlan;
import com.gym360.entity.User;
import com.gym360.repository.GymRepository;
import com.gym360.repository.MembershipPlanRepository;
import com.gym360.repository.UserRepository;
import com.gym360.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private GymRepository gymRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse registerGym(GymRegistrationRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email '" + email + "' is already registered. Please log in or use another email.");
        }

        String gymName = request.getGymName().trim();
        String code = gymName.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (code.isEmpty()) {
            code = "gym-" + System.currentTimeMillis();
        } else if (gymRepository.existsByCode(code)) {
            code = code + "-" + System.currentTimeMillis();
        }

        // 1. Create Gym entity
        Gym gym = new Gym(
                gymName,
                code,
                email,
                request.getPhone().trim(),
                null,
                Gym.Status.ACTIVE
        );
        gym = gymRepository.save(gym);

        // 2. Create Gym Owner account with ADMIN role
        User owner = new User(
                request.getOwnerName().trim(),
                email,
                passwordEncoder.encode(request.getPassword().trim()),
                request.getPhone().trim(),
                User.Role.ADMIN,
                User.Status.ACTIVE
        );
        owner.setGym(gym);
        owner.setMustChangePassword(false);
        owner = userRepository.save(owner);

        // 3. Seed default membership plans for this newly registered gym
        planRepository.save(new MembershipPlan(gym, "Monthly", 1, 50.0, "Standard gym access for 30 days."));
        planRepository.save(new MembershipPlan(gym, "Quarterly", 3, 130.0, "Full gym access for 90 days with discount."));
        planRepository.save(new MembershipPlan(gym, "Yearly", 12, 450.0, "Full gym access for 365 days best value."));

        // 4. Generate JWT Token
        String token = jwtUtils.generateToken(owner.getEmail(), owner.getRole().name(), owner.getId(), gym.getId());

        return new AuthResponse(token, new AuthResponse.UserDto(owner));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getStatus() == User.Status.INACTIVE) {
            throw new org.springframework.security.authentication.DisabledException(
                    "Your account is currently inactive. Please contact the administrator."
            );
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        Long gymId = (user.getGym() != null) ? user.getGym().getId() : null;
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getId(), gymId);

        return new AuthResponse(token, new AuthResponse.UserDto(user));
    }

    public AuthResponse.UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
        return new AuthResponse.UserDto(user);
    }

    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account registered with email '" + email + "'"));

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        return new ForgotPasswordResponse(
                true,
                "Password reset recovery token generated successfully. Valid for 15 minutes.",
                resetToken
        );
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        String token = request.getToken().trim();
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or unrecognized password reset token"));

        if (user.getPasswordResetExpiry() == null || user.getPasswordResetExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired. Please request a new recovery token.");
        }

        String newPassword = request.getNewPassword().trim();
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        user.setMustChangePassword(false);
        userRepository.save(user);

        return new MessageResponse("Password has been successfully reset. You can now log in with your new password.");
    }
}

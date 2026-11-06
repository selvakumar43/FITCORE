package com.gym360.service;

import com.gym360.dto.ChangePasswordRequest;
import com.gym360.dto.ClientDashboardResponse;
import com.gym360.dto.DetailedMembershipDto;
import com.gym360.dto.MessageResponse;
import com.gym360.entity.Membership;
import com.gym360.entity.User;
import com.gym360.repository.MembershipRepository;
import com.gym360.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ClientService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public ClientDashboardResponse getClientDashboard(String email) {
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with email: " + email));

        List<Membership> memberships = (client.getGym() != null)
                ? membershipRepository.findByGymIdAndUserIdOrderByStartDateDescIdDesc(client.getGym().getId(), client.getId())
                : membershipRepository.findByUserIdOrderByStartDateDescIdDesc(client.getId());

        List<DetailedMembershipDto> dtoList = memberships.stream()
                .map(DetailedMembershipDto::new)
                .collect(Collectors.toList());

        DetailedMembershipDto currentMembership = dtoList.stream()
                .filter(m -> "ACTIVE".equals(m.getEffectiveStatus()))
                .findFirst()
                .orElseGet(() -> dtoList.stream()
                        .filter(m -> "UPCOMING".equals(m.getEffectiveStatus()))
                        .findFirst()
                        .orElse(dtoList.isEmpty() ? null : dtoList.get(0)));

        return new ClientDashboardResponse(client, currentMembership, dtoList);
    }

    @Transactional
    public MessageResponse changeClientPassword(String email, ChangePasswordRequest request) {
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with email: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), client.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        String newPassword = request.getNewPassword().trim();
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        if (request.getConfirmNewPassword() != null && !request.getConfirmNewPassword().trim().isEmpty()) {
            if (!newPassword.equals(request.getConfirmNewPassword().trim())) {
                throw new IllegalArgumentException("New password and confirmation password do not match");
            }
        }

        if (passwordEncoder.matches(newPassword, client.getPassword())) {
            throw new IllegalArgumentException("New password cannot be identical to your current password");
        }

        client.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(client);

        return new MessageResponse("Password has been changed successfully. You can now log in with your new password.");
    }
}

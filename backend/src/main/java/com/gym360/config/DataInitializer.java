package com.gym360.config;

import com.gym360.entity.*;
import com.gym360.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

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
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Ensure Default Gym exists for migration and initial tenant
        Gym defaultGym = gymRepository.findById(1L).orElse(null);
        if (defaultGym == null) {
            defaultGym = gymRepository.findByName("FITCORE Flagship Gym").orElse(null);
        }
        if (defaultGym == null) {
            defaultGym = new Gym(
                    "FITCORE Flagship Gym",
                    "fitcore-flagship",
                    "admin@gym360.com",
                    "9876543210",
                    "100 Fitness Blvd, Suite 100",
                    Gym.Status.ACTIVE
            );
            defaultGym = gymRepository.save(defaultGym);
        }

        // 2. Multi-tenant Data Migration for existing records without gym association
        List<MembershipPlan> unassociatedPlans = planRepository.findAll().stream()
                .filter(p -> p.getGym() == null)
                .toList();
        for (MembershipPlan p : unassociatedPlans) {
            p.setGym(defaultGym);
            planRepository.save(p);
        }

        List<User> unassociatedUsers = userRepository.findAll().stream()
                .filter(u -> u.getGym() == null)
                .toList();
        for (User u : unassociatedUsers) {
            u.setGym(defaultGym);
            userRepository.save(u);
        }

        List<Membership> unassociatedMemberships = membershipRepository.findAll().stream()
                .filter(m -> m.getGym() == null)
                .toList();
        for (Membership m : unassociatedMemberships) {
            m.setGym(defaultGym);
            membershipRepository.save(m);
        }

        // 3. Seed Default Plans if empty for default gym
        if (planRepository.countByGymId(defaultGym.getId()) == 0) {
            planRepository.save(new MembershipPlan(defaultGym, "Monthly", 1, 50.0, "Standard gym access for 30 days."));
            planRepository.save(new MembershipPlan(defaultGym, "Quarterly", 3, 130.0, "Full gym access for 90 days with discount."));
            planRepository.save(new MembershipPlan(defaultGym, "Half-Yearly", 6, 240.0, "Full gym access for 180 days with discount."));
            planRepository.save(new MembershipPlan(defaultGym, "Yearly", 12, 450.0, "Full gym access for 365 days best value."));
        } else if (planRepository.findByNameIgnoreCaseAndGymId("Half-Yearly", defaultGym.getId()).isEmpty()) {
            planRepository.save(new MembershipPlan(defaultGym, "Half-Yearly", 6, 240.0, "Full gym access for 180 days with discount."));
        }

        // 4. Ensure initial administrator account exists
        if (userRepository.countByRole(User.Role.ADMIN) == 0) {
            User admin = new User(
                    "Alex Carter (Admin)",
                    "admin@gym360.com",
                    passwordEncoder.encode("admin123"),
                    "9876543210",
                    User.Role.ADMIN,
                    User.Status.ACTIVE
            );
            admin.setGym(defaultGym);
            admin.setMustChangePassword(true);
            userRepository.save(admin);
        }

        // 5. Seed Initial Clients and Memberships for default gym if no clients exist
        if (userRepository.countByGymIdAndRole(defaultGym.getId(), User.Role.CLIENT) == 0) {
            // Client 1 - John Doe (Active Quarterly)
            User john = new User(
                    "John Doe",
                    "john@example.com",
                    passwordEncoder.encode("client123"),
                    "9123456780",
                    User.Role.CLIENT,
                    User.Status.ACTIVE
            );
            john.setGym(defaultGym);
            userRepository.save(john);

            // Client 2 - Sarah Connor (Active Monthly, Partially Paid)
            User sarah = new User(
                    "Sarah Connor",
                    "sarah@example.com",
                    passwordEncoder.encode("client123"),
                    "9234567891",
                    User.Role.CLIENT,
                    User.Status.ACTIVE
            );
            sarah.setGym(defaultGym);
            userRepository.save(sarah);

            // Client 3 - Mike Tyson (Expired Monthly)
            User mike = new User(
                    "Mike Tyson",
                    "mike@example.com",
                    passwordEncoder.encode("client123"),
                    "9345678912",
                    User.Role.CLIENT,
                    User.Status.ACTIVE
            );
            mike.setGym(defaultGym);
            userRepository.save(mike);

            // Client 4 - Emily Watson (Inactive)
            User emily = new User(
                    "Emily Watson",
                    "emily@example.com",
                    passwordEncoder.encode("client123"),
                    "9456789123",
                    User.Role.CLIENT,
                    User.Status.INACTIVE
            );
            emily.setGym(defaultGym);
            userRepository.save(emily);

            // Retrieve plans for default gym
            MembershipPlan monthly = planRepository.findByNameIgnoreCaseAndGymId("Monthly", defaultGym.getId()).orElse(null);
            MembershipPlan quarterly = planRepository.findByNameIgnoreCaseAndGymId("Quarterly", defaultGym.getId()).orElse(null);

            // Membership for John (Active Quarterly, Paid)
            if (quarterly != null) {
                Membership johnMem = new Membership(
                        defaultGym,
                        john,
                        quarterly,
                        LocalDate.now().minusMonths(1),
                        LocalDate.now().minusMonths(1).plusMonths(3),
                        Membership.Status.ACTIVE,
                        130.0
                );
                membershipRepository.save(johnMem);

                Payment johnPayment = new Payment(
                        johnMem,
                        130.0,
                        Payment.PaymentStatus.PAID,
                        LocalDate.now().minusMonths(1)
                );
                paymentRepository.save(johnPayment);
            }

            // Membership for Sarah (Active Monthly, Partially Paid)
            if (monthly != null) {
                Membership sarahMem = new Membership(
                        defaultGym,
                        sarah,
                        monthly,
                        LocalDate.now().minusDays(10),
                        LocalDate.now().minusDays(10).plusMonths(1),
                        Membership.Status.ACTIVE,
                        50.0
                );
                membershipRepository.save(sarahMem);

                Payment sarahPayment = new Payment(
                        sarahMem,
                        30.0,
                        Payment.PaymentStatus.PARTIALLY_PAID,
                        LocalDate.now().minusDays(10)
                );
                paymentRepository.save(sarahPayment);

                // Membership for Mike (Expired Monthly, Paid)
                Membership mikeMem = new Membership(
                        defaultGym,
                        mike,
                        monthly,
                        LocalDate.now().minusMonths(2),
                        LocalDate.now().minusMonths(1),
                        Membership.Status.EXPIRED,
                        50.0
                );
                membershipRepository.save(mikeMem);

                Payment mikePayment = new Payment(
                        mikeMem,
                        50.0,
                        Payment.PaymentStatus.PAID,
                        LocalDate.now().minusMonths(2)
                );
                paymentRepository.save(mikePayment);
            }
        }
    }
}

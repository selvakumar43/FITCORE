package com.gym360.repository;

import com.gym360.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPasswordResetToken(String passwordResetToken);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByPhone(String phone);
    boolean existsByPhoneAndIdNot(String phone, Long id);
    List<User> findByPhone(String phone);
    List<User> findByRole(User.Role role);
    long countByRole(User.Role role);
    long countByRoleAndStatus(User.Role role, User.Status status);

    @Query("SELECT u FROM User u WHERE u.gym.id = :gymId")
    List<User> findByGymId(@Param("gymId") Long gymId);

    @Query("SELECT u FROM User u WHERE u.gym.id = :gymId AND u.role = :role")
    List<User> findByGymIdAndRole(@Param("gymId") Long gymId, @Param("role") User.Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.gym.id = :gymId AND u.role = :role")
    long countByGymIdAndRole(@Param("gymId") Long gymId, @Param("role") User.Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.gym.id = :gymId AND u.role = :role AND u.status = :status")
    long countByGymIdAndRoleAndStatus(@Param("gymId") Long gymId, @Param("role") User.Role role, @Param("status") User.Status status);

    @Query("SELECT u FROM User u WHERE u.id = :id AND u.gym.id = :gymId")
    Optional<User> findByIdAndGymId(@Param("id") Long id, @Param("gymId") Long gymId);
}

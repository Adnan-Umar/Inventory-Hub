package com.adnanumar.server.config;

import com.adnanumar.server.constant.RoleName;
import com.adnanumar.server.entity.Role;
import com.adnanumar.server.entity.User;
import com.adnanumar.server.repository.RoleRepository;
import com.adnanumar.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Initializing default database roles and admin user...");

        // Ensure ROLE_USER and ROLE_ADMIN exist
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> {
                    log.info("Creating default role: ROLE_USER");
                    return roleRepository.save(Role.builder().name(RoleName.ROLE_USER).build());
                });

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> {
                    log.info("Creating default role: ROLE_ADMIN");
                    return roleRepository.save(Role.builder().name(RoleName.ROLE_ADMIN).build());
                });

        // Ensure at least one default admin user exists
        String adminEmail = "admin@inventoryhub.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            log.info("Creating default admin user: {}", adminEmail);
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("adminpassword"))
                    .roles(new HashSet<>(Collections.singletonList(adminRole)))
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created successfully.");
        }

        // Ensure at least one default standard user exists for testing
        String testUserEmail = "user@inventoryhub.com";
        if (!userRepository.existsByEmail(testUserEmail)) {
            log.info("Creating default standard user: {}", testUserEmail);
            User testUser = User.builder()
                    .email(testUserEmail)
                    .password(passwordEncoder.encode("userpassword"))
                    .roles(new HashSet<>(Collections.singletonList(userRole)))
                    .build();
            userRepository.save(testUser);
            log.info("Default standard user created successfully.");
        }
    }
}

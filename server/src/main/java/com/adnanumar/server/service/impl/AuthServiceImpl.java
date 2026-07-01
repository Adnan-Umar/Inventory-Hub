package com.adnanumar.server.service.impl;

import com.adnanumar.server.constant.RoleName;
import com.adnanumar.server.dto.AuthRequest;
import com.adnanumar.server.dto.AuthResponse;
import com.adnanumar.server.dto.RegisterRequest;
import com.adnanumar.server.entity.Role;
import com.adnanumar.server.entity.User;
import com.adnanumar.server.exception.EmailAlreadyExistsException;
import com.adnanumar.server.exception.ResourceNotFoundException;
import com.adnanumar.server.repository.RoleRepository;
import com.adnanumar.server.repository.UserRepository;
import com.adnanumar.server.security.JwtService;
import com.adnanumar.server.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed - email already exists: {}", request.getEmail());
            throw new EmailAlreadyExistsException("Email is already registered: " + request.getEmail());
        }

        RoleName roleName = RoleName.ROLE_USER;
        if (request.getRole() != null) {
            try {
                String requestedRole = request.getRole().trim().toUpperCase();
                if (!requestedRole.startsWith("ROLE_")) {
                    requestedRole = "ROLE_" + requestedRole;
                }
                roleName = RoleName.valueOf(requestedRole);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role requested: {}, defaulting to ROLE_USER", request.getRole());
            }
        }

        final RoleName finalRoleName = roleName;
        Role role = roleRepository.findByName(finalRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + finalRoleName));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(new HashSet<>(Collections.singletonList(role)))
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());

        String jwtToken = jwtService.generateToken(savedUser);
        List<String> roles = savedUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .token(jwtToken)
                .email(savedUser.getEmail())
                .roles(roles)
                .build();
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        log.info("Login attempt for user: {}", request.getEmail());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            User user = (User) authentication.getPrincipal();
            log.info("Login successful for user: {}", request.getEmail());

            String jwtToken = jwtService.generateToken(user);
            List<String> roles = user.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            return AuthResponse.builder()
                    .token(jwtToken)
                    .email(user.getEmail())
                    .roles(roles)
                    .build();
        } catch (BadCredentialsException e) {
            log.warn("Login failed for user: {} - Bad credentials", request.getEmail());
            throw e;
        } catch (Exception e) {
            log.error("Login error for user: {} - {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }
}

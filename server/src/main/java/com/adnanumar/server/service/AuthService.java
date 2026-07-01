package com.adnanumar.server.service;

import com.adnanumar.server.dto.AuthRequest;
import com.adnanumar.server.dto.AuthResponse;
import com.adnanumar.server.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
}

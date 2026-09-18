package com.bank;

import com.bank.dto.request.LoginRequest;
import com.bank.dto.request.RegisterRequest;
import com.bank.dto.response.AuthResponse;
import com.bank.entity.Account;
import com.bank.entity.Role;
import com.bank.entity.User;
import com.bank.exception.BadRequestException;
import com.bank.repository.AccountRepository;
import com.bank.repository.CardRepository;
import com.bank.repository.RoleRepository;
import com.bank.repository.UserRepository;
import com.bank.security.JwtTokenProvider;
import com.bank.service.AuditService;
import com.bank.service.AuthService;
import com.bank.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CardRepository cardRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    private Role customerRole;

    @BeforeEach
    void setUp() {
        customerRole = Role.builder()
                .id(1L)
                .name(Role.RoleType.ROLE_CUSTOMER)
                .build();
    }

    @Test
    void register_DuplicateUsername_ThrowsBadRequestException() {
        RegisterRequest request = RegisterRequest.builder()
                .username("existinguser")
                .email("test@bank.com")
                .mobileNumber("9876543210")
                .password("Password@123")
                .fullName("Existing User")
                .address("Some Address")
                .build();

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_Successful_ReturnsToken() {
        LoginRequest request = LoginRequest.builder()
                .username("testuser")
                .password("Password@123")
                .build();

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock-jwt-token");

        User mockUser = User.builder()
                .id(1L)
                .username("testuser")
                .fullName("Test User")
                .email("test@bank.com")
                .role(customerRole)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("testuser", response.getUsername());
        assertEquals("ROLE_CUSTOMER", response.getRole());
    }
}

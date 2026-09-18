package com.bank.service;

import com.bank.dto.request.ChangePasswordRequest;
import com.bank.dto.request.LoginRequest;
import com.bank.dto.request.RegisterRequest;
import com.bank.dto.request.UpdateProfileRequest;
import com.bank.dto.response.AuthResponse;
import com.bank.dto.response.UserProfileResponse;
import com.bank.entity.Account;
import com.bank.entity.Card;
import com.bank.entity.Role;
import com.bank.entity.User;
import com.bank.entity.Notification.NotificationType;
import com.bank.exception.BadRequestException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.CardRepository;
import com.bank.repository.RoleRepository;
import com.bank.repository.UserRepository;
import com.bank.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new BadRequestException("Mobile number is already registered");
        }

        Role customerRole = roleRepository.findByName(Role.RoleType.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(Role.RoleType.ROLE_CUSTOMER).build()));

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .address(request.getAddress())
                .role(customerRole)
                .status(User.UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Generate Account
        String accountNumber = generateUniqueAccountNumber();
        Account account = Account.builder()
                .user(user)
                .accountNumber(accountNumber)
                .accountType(Account.AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00")) // Initial educational balance
                .currency("INR")
                .status(Account.AccountStatus.ACTIVE)
                .build();
        account = accountRepository.save(account);

        // Generate Demo Debit Card
        String maskedCard = "4532 •••• •••• " + (1000 + new Random().nextInt(9000));
        LocalDate expiry = LocalDate.now().plusYears(4);
        Card card = Card.builder()
                .account(account)
                .cardNumberMasked(maskedCard)
                .cardType("DEBIT")
                .cardHolderName(user.getFullName().toUpperCase())
                .expiryDate(expiry.format(DateTimeFormatter.ofPattern("MM/yy")))
                .spendingLimit(new BigDecimal("50000.00"))
                .isFrozen(false)
                .isOnlineEnabled(true)
                .isContactlessEnabled(true)
                .isInternationalEnabled(false)
                .build();
        cardRepository.save(card);

        // Create welcome notification
        notificationService.createNotification(
                user,
                "Welcome to Digital Banking!",
                "Your account " + maskAccountNumber(accountNumber) + " has been opened with an initial balance of ₹1,000.00.",
                NotificationType.ACCOUNT_UPDATE
        );

        auditService.log(user, "ACCOUNT_CREATED", "Account", account.getId().toString(), "SUCCESS", null, "New user registration");

        String token = tokenProvider.generateTokenFromUsername(user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        auditService.log(user, "LOGIN", "User", user.getId().toString(), "SUCCESS", null, "User logged in successfully");

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .address(user.getAddress())
                .role(user.getRole().getName().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already taken");
        }
        if (!user.getMobileNumber().equals(request.getMobileNumber()) && userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new BadRequestException("Mobile number is already taken");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setMobileNumber(request.getMobileNumber());
        user.setAddress(request.getAddress());
        userRepository.save(user);

        auditService.log(user, "PROFILE_UPDATED", "User", user.getId().toString(), "SUCCESS", null, "Profile details updated");

        return getProfile(username);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.log(user, "PASSWORD_CHANGED", "User", user.getId().toString(), "SUCCESS", null, "Password changed");
    }

    private String generateUniqueAccountNumber() {
        Random random = new Random();
        String acc;
        do {
            long num = 100000000000L + (long)(random.nextDouble() * 899999999999L);
            acc = String.valueOf(num);
        } while (accountRepository.existsByAccountNumber(acc));
        return acc;
    }

    private String maskAccountNumber(String acc) {
        if (acc == null || acc.length() < 4) return acc;
        return "•••• " + acc.substring(acc.length() - 4);
    }
}

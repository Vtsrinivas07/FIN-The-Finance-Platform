package com.bank.security;

import com.bank.entity.User;
import com.bank.exception.UnauthorizedException;
import com.bank.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User is not authenticated");
        }

        String username;
        if (authentication.getPrincipal() instanceof UserPrincipal principal) {
            username = principal.getUsername();
        } else {
            username = authentication.getName();
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));
    }
}

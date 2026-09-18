package com.bank.service;

import com.bank.dto.request.CardActionRequest;
import com.bank.dto.response.CardResponse;
import com.bank.entity.Account;
import com.bank.entity.Card;
import com.bank.entity.User;
import com.bank.exception.BadRequestException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final AccountService accountService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<CardResponse> getUserCards(User user) {
        Account account = accountService.getPrimaryAccount(user);
        return cardRepository.findByAccount(account).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CardResponse updateCardSettings(User user, Long cardId, CardActionRequest request) {
        Account account = accountService.getPrimaryAccount(user);
        Card card = cardRepository.findByIdAndAccount(cardId, account)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        if (request.getIsFrozen() != null) {
            card.setFrozen(request.getIsFrozen());
        }
        if (request.getIsOnlineEnabled() != null) {
            card.setOnlineEnabled(request.getIsOnlineEnabled());
        }
        if (request.getIsContactlessEnabled() != null) {
            card.setContactlessEnabled(request.getIsContactlessEnabled());
        }
        if (request.getIsInternationalEnabled() != null) {
            card.setInternationalEnabled(request.getIsInternationalEnabled());
        }
        if (request.getSpendingLimit() != null) {
            if (request.getSpendingLimit().signum() <= 0) {
                throw new BadRequestException("Spending limit must be positive");
            }
            card.setSpendingLimit(request.getSpendingLimit());
        }

        card = cardRepository.save(card);
        auditService.log(user, "CARD_SETTINGS_UPDATED", "Card", cardId.toString(), "SUCCESS", null, "Updated card settings");

        return mapToResponse(card);
    }

    private CardResponse mapToResponse(Card card) {
        return CardResponse.builder()
                .id(card.getId())
                .cardNumberMasked(card.getCardNumberMasked())
                .cardType(card.getCardType())
                .cardHolderName(card.getCardHolderName())
                .expiryDate(card.getExpiryDate())
                .spendingLimit(card.getSpendingLimit())
                .isFrozen(card.isFrozen())
                .isOnlineEnabled(card.isOnlineEnabled())
                .isContactlessEnabled(card.isContactlessEnabled())
                .isInternationalEnabled(card.isInternationalEnabled())
                .build();
    }
}

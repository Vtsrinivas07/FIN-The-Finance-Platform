package com.bank.service;

import com.bank.entity.*;
import com.bank.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializationService implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final BillProviderRepository billProviderRepository;
    private final RechargePlanRepository rechargePlanRepository;
    private final SupportFAQRepository supportFAQRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing database seed data...");

        // 1. Roles
        Role customerRole = roleRepository.findByName(Role.RoleType.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(Role.RoleType.ROLE_CUSTOMER).build()));

        Role adminRole = roleRepository.findByName(Role.RoleType.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(Role.RoleType.ROLE_ADMIN).build()));

        // 2. Admin User
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("Admin@12345"))
                    .fullName("Bank Administrator")
                    .email("admin@bank.local")
                    .mobileNumber("9999999999")
                    .address("Financial Center, Headquarters")
                    .role(adminRole)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created: admin / Admin@12345");
        }

        // 3. Primary Demo User
        User demoUser;
        Account demoAccount;
        if (!userRepository.existsByUsername("demo")) {
            demoUser = User.builder()
                    .username("demo")
                    .password(passwordEncoder.encode("Demo@12345"))
                    .fullName("Srinivas Vuriti")
                    .email("demo@bank.local")
                    .mobileNumber("9876543210")
                    .address("742 Evergreen Terrace, Tech Park")
                    .role(customerRole)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            demoUser = userRepository.save(demoUser);

            demoAccount = Account.builder()
                    .user(demoUser)
                    .accountNumber("100123456789")
                    .accountType(Account.AccountType.SAVINGS)
                    .balance(new BigDecimal("15000.00"))
                    .currency("INR")
                    .status(Account.AccountStatus.ACTIVE)
                    .build();
            demoAccount = accountRepository.save(demoAccount);

            Card demoCard = Card.builder()
                    .account(demoAccount)
                    .cardNumberMasked("4532 •••• •••• 8821")
                    .cardType("DEBIT")
                    .cardHolderName("SRINIVAS VURITI")
                    .expiryDate("08/28")
                    .spendingLimit(new BigDecimal("75000.00"))
                    .isFrozen(false)
                    .isOnlineEnabled(true)
                    .isContactlessEnabled(true)
                    .isInternationalEnabled(false)
                    .build();
            cardRepository.save(demoCard);
            log.info("Demo user created: demo / Demo@12345 (Account: 100123456789, Balance: ₹15,000.00)");
        } else {
            demoUser = userRepository.findByUsername("demo").orElseThrow();
            demoAccount = accountRepository.findByUser(demoUser).stream().findFirst().orElse(null);
        }

        // 4. Secondary Demo User (Sarah) for instant transfer testing
        if (!userRepository.existsByUsername("sarah")) {
            User sarah = User.builder()
                    .username("sarah")
                    .password(passwordEncoder.encode("Sarah@12345"))
                    .fullName("Sarah Jenkins")
                    .email("sarah@bank.local")
                    .mobileNumber("9123456780")
                    .address("104 Baker Street")
                    .role(customerRole)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            sarah = userRepository.save(sarah);

            Account sarahAccount = Account.builder()
                    .user(sarah)
                    .accountNumber("100987654321")
                    .accountType(Account.AccountType.SAVINGS)
                    .balance(new BigDecimal("8500.00"))
                    .currency("INR")
                    .status(Account.AccountStatus.ACTIVE)
                    .build();
            sarahAccount = accountRepository.save(sarahAccount);

            Card sarahCard = Card.builder()
                    .account(sarahAccount)
                    .cardNumberMasked("4532 •••• •••• 1042")
                    .cardType("DEBIT")
                    .cardHolderName("SARAH JENKINS")
                    .expiryDate("11/27")
                    .spendingLimit(new BigDecimal("50000.00"))
                    .isFrozen(false)
                    .isOnlineEnabled(true)
                    .isContactlessEnabled(true)
                    .isInternationalEnabled(false)
                    .build();
            cardRepository.save(sarahCard);

            // Add Sarah as a pre-saved beneficiary for Demo user
            if (demoAccount != null) {
                Beneficiary beneficiary = Beneficiary.builder()
                        .user(demoUser)
                        .beneficiaryAccountNumber(sarahAccount.getAccountNumber())
                        .beneficiaryName(sarah.getFullName())
                        .bankName("Digital Bank")
                        .ifscCode("BANK0001001")
                        .status(Beneficiary.BeneficiaryStatus.ACTIVE)
                        .build();
                beneficiaryRepository.save(beneficiary);
            }
            log.info("Secondary user created: sarah / Sarah@12345 (Account: 100987654321)");
        }

        // 5. Bill Providers
        if (billProviderRepository.count() == 0) {
            List<BillProvider> providers = Arrays.asList(
                    new BillProvider("ELEC1", "State Electricity Board", "ELECTRICITY"),
                    new BillProvider("WATER1", "Municipal Water Supply", "WATER"),
                    new BillProvider("GAS1", "City Gas Corporation", "GAS"),
                    new BillProvider("INTERNET1", "FiberNet Broadband", "INTERNET"),
                    new BillProvider("AIR1", "Airtel", "MOBILE"),
                    new BillProvider("JIO1", "Jio", "MOBILE"),
                    new BillProvider("VOD1", "Vodafone Idea", "MOBILE"),
                    new BillProvider("DTH1", "Tata Play", "DTH"),
                    new BillProvider("DTH2", "Dish TV", "DTH")
            );
            billProviderRepository.saveAll(providers);

            // 6. Recharge Plans
            BillProvider airtel = billProviderRepository.findById("AIR1").orElseThrow();
            BillProvider jio = billProviderRepository.findById("JIO1").orElseThrow();
            BillProvider vodafone = billProviderRepository.findById("VOD1").orElseThrow();
            BillProvider tataplay = billProviderRepository.findById("DTH1").orElseThrow();
            BillProvider dishtv = billProviderRepository.findById("DTH2").orElseThrow();

            List<RechargePlan> plans = Arrays.asList(
                    new RechargePlan("AIR_P1", airtel, "Monthly Basic", new BigDecimal("199.00"), "28 days", "Unlimited calls + 1.5GB/day", "MOBILE"),
                    new RechargePlan("AIR_P2", airtel, "Monthly Super", new BigDecimal("299.00"), "28 days", "Unlimited calls + 2GB/day + OTT", "MOBILE"),
                    new RechargePlan("AIR_P3", airtel, "Quarterly Value", new BigDecimal("719.00"), "84 days", "Unlimited calls + 1.5GB/day", "MOBILE"),

                    new RechargePlan("JIO_P1", jio, "Popular Pack", new BigDecimal("239.00"), "28 days", "Unlimited calls + 1.5GB/day + 5G", "MOBILE"),
                    new RechargePlan("JIO_P2", jio, "Hero Pack", new BigDecimal("349.00"), "28 days", "Unlimited calls + 2.5GB/day + 5G", "MOBILE"),
                    new RechargePlan("JIO_P3", jio, "Cricket Pack", new BigDecimal("499.00"), "28 days", "Unlimited calls + 3GB/day + Disney+", "MOBILE"),

                    new RechargePlan("VOD_P1", vodafone, "Super Basic", new BigDecimal("179.00"), "28 days", "Unlimited calls + 1GB/day", "MOBILE"),
                    new RechargePlan("VOD_P2", vodafone, "Night Binge", new BigDecimal("299.00"), "28 days", "Unlimited calls + 1.5GB/day + Free Night Data", "MOBILE"),

                    new RechargePlan("DTH1_P1", tataplay, "Family HD Pack", new BigDecimal("349.00"), "30 days", "All regional channels + HD Entertainment", "DTH"),
                    new RechargePlan("DTH1_P2", tataplay, "Sports & Movies Pack", new BigDecimal("549.00"), "30 days", "All Sports HD + Movies + News", "DTH"),

                    new RechargePlan("DTH2_P1", dishtv, "Classic Pack", new BigDecimal("299.00"), "30 days", "All basic family channels", "DTH"),
                    new RechargePlan("DTH2_P2", dishtv, "Premium HD", new BigDecimal("499.00"), "30 days", "Full HD Channels + Sports", "DTH")
            );
            rechargePlanRepository.saveAll(plans);
            log.info("Bill providers and recharge plans seeded.");
        }

        // 7. Support FAQs
        if (supportFAQRepository.count() == 0) {
            List<SupportFAQ> faqs = Arrays.asList(
                    new SupportFAQ(null, "TRANSFERS", "How do I transfer money?",
                            "Navigate to 'Transfers' from your dashboard sidebar. Select or enter the beneficiary account number, specify the amount and an optional reference note, then review and confirm the transfer.",
                            "transfer money send funds remit payment account number"),
                    new SupportFAQ(null, "ACCOUNT", "How do I add a beneficiary?",
                            "Open the 'Beneficiaries' page from the navigation menu. Click 'Add Beneficiary', provide the recipient's 12-digit account number, full name, bank name, and IFSC code, and submit.",
                            "add beneficiary new recipient payee IFSC account"),
                    new SupportFAQ(null, "TRANSACTIONS", "My transaction failed. What should I do?",
                            "Transactions typically fail due to insufficient account balance or account status restrictions. Verify your balance on the dashboard. If funds were debited, simulated ledger reversals are processed automatically.",
                            "failed transaction error money deducted pending reversal"),
                    new SupportFAQ(null, "SECURITY", "How do I reset my password?",
                            "Navigate to 'Settings' > 'Account Settings'. Under the 'Change Password' section, enter your current password and your new secure password (min 8 chars with uppercase, lowercase, number, and special symbol).",
                            "reset password change password forgot credentials security"),
                    new SupportFAQ(null, "BILLS", "How do I pay a utility bill or recharge?",
                            "Go to 'Bill Payments' in the sidebar. Select your utility category (Electricity, Water, Gas, Internet) or 'Mobile / DTH Recharge'. Choose your provider, enter your consumer or mobile number, and authorize payment.",
                            "pay bill electricity water gas broadband recharge mobile dth"),
                    new SupportFAQ(null, "CARDS", "How can I freeze or unfreeze my debit card?",
                            "Visit the 'Cards' section in your banking portal. Click the 'Freeze Card' toggle button to instantly block card transactions, or enable/disable online and contactless payments as needed.",
                            "freeze card block card debit card limits contactless online"),
                    new SupportFAQ(null, "ACCOUNT", "Where can I view or download my account statement?",
                            "Navigate to 'Transactions' from your sidebar to see your complete transaction history. You can filter by date, category, or amount, and export or download your statement.",
                            "statement download statement transaction history ledger account activity"),
                    new SupportFAQ(null, "GENERAL", "Is this a real banking system?",
                            "No, this is an educational and demo digital banking application designed for learning. All monetary balances and transactions are simulated.",
                            "real bank real money simulation demo education educational")
            );
            supportFAQRepository.saveAll(faqs);
            log.info("Support FAQs seeded.");
        }

        log.info("Database initialization completed successfully.");
    }
}

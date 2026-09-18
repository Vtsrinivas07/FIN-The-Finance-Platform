package view;

import controller.UserController;
import java.awt.*;
import util.Constants;
import util.UIFactory;
import util.ValidationUtil;

public class RegisterView extends BaseFrame {
    private static final long serialVersionUID = 1L;
    
    private final TextField usernameField;
    private final TextField passwordField;
    private final TextField confirmPasswordField;
    private final TextField fullNameField;
    private final TextField emailField;
    private final TextField mobileField;
    private final TextArea addressArea;
    private final Button registerButton;
    private final Button backButton;
    
    public RegisterView() {
        super(Constants.APP_NAME + " - Register");
        
        // Initialize UI components
        Panel mainPanel = UIFactory.createPanel(new BorderLayout(20, 20));
        
        // North - Header
        Panel headerPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER));
        headerPanel.add(UIFactory.createHeaderLabel("Create New Account"));
        
        // Center - Registration Form
        Panel formPanel = UIFactory.createPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.anchor = GridBagConstraints.WEST;
        
        // Username
        gbc.gridx = 0;
        gbc.gridy = 0;
        formPanel.add(UIFactory.createLabel("Username:"), gbc);
        
        gbc.gridx = 1;
        usernameField = UIFactory.createTextField(20);
        formPanel.add(usernameField, gbc);
        
        // Password
        gbc.gridx = 0;
        gbc.gridy = 1;
        formPanel.add(UIFactory.createLabel("Password:"), gbc);
        
        gbc.gridx = 1;
        passwordField = new TextField(20);
        passwordField.setEchoChar('*');
        formPanel.add(passwordField, gbc);
        
        // Confirm Password
        gbc.gridx = 0;
        gbc.gridy = 2;
        formPanel.add(UIFactory.createLabel("Confirm Password:"), gbc);
        
        gbc.gridx = 1;
        confirmPasswordField = new TextField(20);
        confirmPasswordField.setEchoChar('*');
        formPanel.add(confirmPasswordField, gbc);
        
        // Full Name
        gbc.gridx = 0;
        gbc.gridy = 3;
        formPanel.add(UIFactory.createLabel("Full Name:"), gbc);
        
        gbc.gridx = 1;
        fullNameField = UIFactory.createTextField(20);
        formPanel.add(fullNameField, gbc);
        
        // Email
        gbc.gridx = 0;
        gbc.gridy = 4;
        formPanel.add(UIFactory.createLabel("Email:"), gbc);
        
        gbc.gridx = 1;
        emailField = UIFactory.createTextField(20);
        formPanel.add(emailField, gbc);
        
        // Mobile
        gbc.gridx = 0;
        gbc.gridy = 5;
        formPanel.add(UIFactory.createLabel("Mobile:"), gbc);
        
        gbc.gridx = 1;
        mobileField = UIFactory.createTextField(20);
        formPanel.add(mobileField, gbc);
        
        // Address
        gbc.gridx = 0;
        gbc.gridy = 6;
        formPanel.add(UIFactory.createLabel("Address:"), gbc);
        
        gbc.gridx = 1;
        addressArea = new TextArea(3, 20);
        formPanel.add(addressArea, gbc);
        
        // Password requirements info
        gbc.gridx = 0;
        gbc.gridy = 7;
        gbc.gridwidth = 2;
        Label infoLabel = new Label("* Password must contain at least 8 characters with numbers, uppercase, lowercase and special chars");
        infoLabel.setFont(UIFactory.getSmallFont());
        infoLabel.setForeground(Constants.LIGHT_TEXT_COLOR);
        formPanel.add(infoLabel, gbc);
        
        // Buttons
        gbc.gridx = 0;
        gbc.gridy = 8;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        
        Panel buttonPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        
        registerButton = UIFactory.createButton("Register", e -> handleRegister());
        registerButton.setPreferredSize(new Dimension(Constants.BUTTON_WIDTH, Constants.BUTTON_HEIGHT));
        buttonPanel.add(registerButton);
        
        backButton = UIFactory.createSecondaryButton("Back to Login", e -> handleBack());
        backButton.setPreferredSize(new Dimension(Constants.BUTTON_WIDTH, Constants.BUTTON_HEIGHT));
        buttonPanel.add(backButton);
        
        formPanel.add(buttonPanel, gbc);
        
        // Add all panels to main panel
        mainPanel.add(headerPanel, BorderLayout.NORTH);
        mainPanel.add(formPanel, BorderLayout.CENTER);
        
        // Add main panel to frame with padding
        Panel paddedPanel = new Panel(new BorderLayout());
        paddedPanel.add(mainPanel, BorderLayout.CENTER);
        paddedPanel.add(new Panel(), BorderLayout.NORTH);
        paddedPanel.add(new Panel(), BorderLayout.SOUTH);
        paddedPanel.add(new Panel(), BorderLayout.EAST);
        paddedPanel.add(new Panel(), BorderLayout.WEST);
        
        add(paddedPanel);
    }
    
    private void handleRegister() {
        String username = usernameField.getText().trim();
        String password = passwordField.getText();
        String confirmPassword = confirmPasswordField.getText();
        String fullName = fullNameField.getText().trim();
        String email = emailField.getText().trim();
        String mobile = mobileField.getText().trim();
        String address = addressArea.getText().trim();
        
        // Validate input
        if (username.isEmpty() || password.isEmpty() || confirmPassword.isEmpty() ||
            fullName.isEmpty() || email.isEmpty() || mobile.isEmpty() || address.isEmpty()) {
            UIFactory.showErrorDialog(this, "All fields are required.");
            return;
        }
        
        if (!ValidationUtil.isValidUsername(username)) {
            UIFactory.showErrorDialog(this, "Username must be at least 4 characters long.");
            return;
        }
        
        if (!password.equals(confirmPassword)) {
            UIFactory.showErrorDialog(this, "Passwords do not match.");
            return;
        }
        
        if (!ValidationUtil.isValidPassword(password)) {
            UIFactory.showErrorDialog(this, ValidationUtil.getPasswordRequirements());
            return;
        }
        
        if (!ValidationUtil.isValidEmail(email)) {
            UIFactory.showErrorDialog(this, "Please enter a valid email address.");
            return;
        }
        
        if (!ValidationUtil.isValidMobile(mobile)) {
            UIFactory.showErrorDialog(this, "Please enter a valid 10-digit mobile number.");
            return;
        }
        
        // Register user
        UserController userController = UserController.getInstance();
        boolean success = userController.registerUser(username, password, fullName, email, mobile, address);
        
        if (success) {
            UIFactory.showSuccessDialog(this, "Registration successful! You can now login.");
            // Go back to login
            handleBack();
        } else {
            UIFactory.showErrorDialog(this, "Username already exists or there was an error. Please try again.");
        }
    }
    
    private void handleBack() {
        // Navigate back to login view
        LoginView loginView = new LoginView();
        loginView.showFrame(this);
    }
}
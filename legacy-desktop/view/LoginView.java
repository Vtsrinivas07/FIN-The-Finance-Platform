package view;

import controller.UserController;
import java.awt.*;
import util.Constants;
import util.UIConstants;
import util.UIFactory;
import util.ValidationUtil;

public class LoginView extends BaseFrame {
    private static final long serialVersionUID = 1L;
    
    private final TextField accountField;
    private final TextField passwordField;
    private final Button loginButton;
    private final Button registerButton;
    
    public LoginView() {
        super(Constants.APP_NAME + " - Login");
        
        // Create main panel with padding
        Panel mainPanel = UIFactory.createMainPanel();
        
        // Header Panel
        Panel headerPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER));
        headerPanel.add(UIFactory.createHeaderLabel("Welcome to " + Constants.APP_NAME));
        
        // Login Form Panel
        Panel formPanel = UIFactory.createPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(UIConstants.PADDING, UIConstants.PADDING, UIConstants.PADDING, UIConstants.PADDING);
        gbc.fill = GridBagConstraints.HORIZONTAL;
        
        // Account Number
        gbc.gridx = 0;
        gbc.gridy = 0;
        formPanel.add(UIFactory.createLabel("Username:"), gbc);
        
        gbc.gridx = 1;
        accountField = UIFactory.createTextField(20);
        formPanel.add(accountField, gbc);
        
        // Password
        gbc.gridx = 0;
        gbc.gridy = 1;
        formPanel.add(UIFactory.createLabel("Password:"), gbc);
        
        gbc.gridx = 1;
        passwordField = new TextField(20);
        passwordField.setEchoChar('*');
        passwordField.setFont(UIConstants.REGULAR_FONT);
        formPanel.add(passwordField, gbc);
        
        // Buttons Panel
        gbc.gridx = 0;
        gbc.gridy = 2;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        
        Panel buttonPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER, UIConstants.PADDING, 0));
        
        loginButton = UIFactory.createButton("Login", e -> handleLogin());
        loginButton.setForeground(UIConstants.LOGIN_NAME_COLOR);
        loginButton.setPreferredSize(new Dimension(UIConstants.BUTTON_WIDTH, UIConstants.BUTTON_HEIGHT));
        buttonPanel.add(loginButton);
        
        registerButton = UIFactory.createSecondaryButton("Register", e -> handleRegister());
        registerButton.setPreferredSize(new Dimension(UIConstants.BUTTON_WIDTH, UIConstants.BUTTON_HEIGHT));
        buttonPanel.add(registerButton);
        
        formPanel.add(buttonPanel, gbc);
        
        // Add panels to main panel
        mainPanel.add(headerPanel, BorderLayout.NORTH);
        mainPanel.add(formPanel, BorderLayout.CENTER);
        
        // Add main panel to frame
        add(mainPanel);
        
        // Set initial focus
        accountField.requestFocus();
    }
    
    private void handleLogin() {
        String accountNumber = accountField.getText().trim();
        String password = passwordField.getText();
        
        // Validate input
        if (accountNumber.isEmpty() || password.isEmpty()) {
            UIFactory.showErrorDialog(this, "Please enter both account number and password.");
            return;
        }
        
        if (!ValidationUtil.isValidAccountNumber(accountNumber)) {
            UIFactory.showErrorDialog(this, "Please enter a valid account number.");
            return;
        }
        
        // Attempt login
        boolean success = UserController.getInstance().loginUser(accountNumber, password);
        
        if (success) {
            dispose();
            new DashboardView().setVisible(true);
        } else {
            UIFactory.showErrorDialog(this, "Invalid account number or password.");
            passwordField.setText("");
            passwordField.requestFocus();
        }
    }
    
    private void handleRegister() {
        dispose();
        new RegisterView().setVisible(true);
    }
}
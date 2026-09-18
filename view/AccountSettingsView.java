package view;

import controller.UserController;
import java.awt.*;
import util.Constants;
import util.UIFactory;
import util.ValidationUtil;

public class AccountSettingsView extends BaseFrame {
    private static final long serialVersionUID = 1L;
    
    private final TextField fullNameField;
    private final TextField emailField;
    private final TextField mobileField;
    private final TextArea addressArea;
    private final TextField currentPasswordField;
    private final TextField newPasswordField;
    private final TextField confirmPasswordField;
    private final Button saveButton;
    private final Button cancelButton;
    
    public AccountSettingsView(DashboardView dashboardView) {
        super(Constants.APP_NAME + " - Account Settings");
        
        // Initialize UI components
        Panel mainPanel = UIFactory.createPanel(new BorderLayout(20, 20));
        
        // North - Header
        Panel headerPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER));
        headerPanel.add(UIFactory.createHeaderLabel("Account Settings"));
        
        // Center - Settings Form
        Panel formPanel = UIFactory.createPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.anchor = GridBagConstraints.WEST;
        
        // Personal Information Section
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 2;
        formPanel.add(UIFactory.createTitleLabel("Personal Information"), gbc);
        
        // Full Name
        gbc.gridy = 1;
        gbc.gridwidth = 1;
        formPanel.add(UIFactory.createLabel("Full Name:"), gbc);
        
        gbc.gridx = 1;
        fullNameField = UIFactory.createTextField(20);
        fullNameField.setText(UserController.getInstance().getCurrentUser().getFullName());
        formPanel.add(fullNameField, gbc);
        
        // Email
        gbc.gridx = 0;
        gbc.gridy = 2;
        formPanel.add(UIFactory.createLabel("Email:"), gbc);
        
        gbc.gridx = 1;
        emailField = UIFactory.createTextField(20);
        emailField.setText(UserController.getInstance().getCurrentUser().getEmail());
        formPanel.add(emailField, gbc);
        
        // Mobile
        gbc.gridx = 0;
        gbc.gridy = 3;
        formPanel.add(UIFactory.createLabel("Mobile:"), gbc);
        
        gbc.gridx = 1;
        mobileField = UIFactory.createTextField(20);
        mobileField.setText(UserController.getInstance().getCurrentUser().getMobileNumber());
        formPanel.add(mobileField, gbc);
        
        // Address
        gbc.gridx = 0;
        gbc.gridy = 4;
        formPanel.add(UIFactory.createLabel("Address:"), gbc);
        
        gbc.gridx = 1;
        addressArea = new TextArea(3, 20);
        addressArea.setText(UserController.getInstance().getCurrentUser().getAddress());
        formPanel.add(addressArea, gbc);
        
        // Password Change Section
        gbc.gridx = 0;
        gbc.gridy = 5;
        gbc.gridwidth = 2;
        formPanel.add(UIFactory.createTitleLabel("Change Password"), gbc);
        
        // Current Password
        gbc.gridy = 6;
        gbc.gridwidth = 1;
        formPanel.add(UIFactory.createLabel("Current Password:"), gbc);
        
        gbc.gridx = 1;
        currentPasswordField = new TextField(20);
        currentPasswordField.setEchoChar('*');
        formPanel.add(currentPasswordField, gbc);
        
        // New Password
        gbc.gridx = 0;
        gbc.gridy = 7;
        formPanel.add(UIFactory.createLabel("New Password:"), gbc);
        
        gbc.gridx = 1;
        newPasswordField = new TextField(20);
        newPasswordField.setEchoChar('*');
        formPanel.add(newPasswordField, gbc);
        
        // Confirm Password
        gbc.gridx = 0;
        gbc.gridy = 8;
        formPanel.add(UIFactory.createLabel("Confirm Password:"), gbc);
        
        gbc.gridx = 1;
        confirmPasswordField = new TextField(20);
        confirmPasswordField.setEchoChar('*');
        formPanel.add(confirmPasswordField, gbc);
        
        // Password requirements info
        gbc.gridx = 0;
        gbc.gridy = 9;
        gbc.gridwidth = 2;
        Label infoLabel = new Label("* Password must contain at least 8 characters with numbers, uppercase, lowercase and special chars");
        infoLabel.setFont(UIFactory.getSmallFont());
        infoLabel.setForeground(Constants.LIGHT_TEXT_COLOR);
        formPanel.add(infoLabel, gbc);
        
        // Buttons
        gbc.gridx = 0;
        gbc.gridy = 10;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        
        Panel buttonPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        
        saveButton = UIFactory.createButton("Save Changes", e -> handleSave());
        saveButton.setPreferredSize(new Dimension(Constants.BUTTON_WIDTH, Constants.BUTTON_HEIGHT));
        buttonPanel.add(saveButton);
        
        cancelButton = UIFactory.createSecondaryButton("Cancel", e -> handleCancel());
        cancelButton.setPreferredSize(new Dimension(Constants.BUTTON_WIDTH, Constants.BUTTON_HEIGHT));
        buttonPanel.add(cancelButton);
        
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
    
    private void handleSave() {
        String fullName = fullNameField.getText().trim();
        String email = emailField.getText().trim();
        String mobile = mobileField.getText().trim();
        String address = addressArea.getText().trim();
        String currentPassword = currentPasswordField.getText();
        String newPassword = newPasswordField.getText();
        String confirmPassword = confirmPasswordField.getText();
        
        // Validate personal information
        if (fullName.isEmpty() || email.isEmpty() || mobile.isEmpty() || address.isEmpty()) {
            UIFactory.showErrorDialog(this, "All personal information fields are required.");
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
        
        // Update personal information
        boolean success = UserController.getInstance().updateUserDetails(fullName, email, mobile, address);
        
        // Handle password change if attempted
        if (!currentPassword.isEmpty() || !newPassword.isEmpty() || !confirmPassword.isEmpty()) {
            if (currentPassword.isEmpty() || newPassword.isEmpty() || confirmPassword.isEmpty()) {
                UIFactory.showErrorDialog(this, "All password fields are required for password change.");
                return;
            }
            
            if (!newPassword.equals(confirmPassword)) {
                UIFactory.showErrorDialog(this, "New passwords do not match.");
                return;
            }
            
            if (!ValidationUtil.isValidPassword(newPassword)) {
                UIFactory.showErrorDialog(this, ValidationUtil.getPasswordRequirements());
                return;
            }
            
            success = success && UserController.getInstance().changePassword(currentPassword, newPassword);
        }
        
        if (success) {
            UIFactory.showSuccessDialog(this, "Account settings updated successfully!");
            handleCancel(); // Close the settings window
        } else {
            UIFactory.showErrorDialog(this, "Failed to update account settings. Please check your current password and try again.");
        }
    }
    
    private void handleCancel() {
        dispose(); // Close the settings window
    }
} 
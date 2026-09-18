package view;

import controller.UserController;
import java.awt.*;
import model.User;
import util.Constants;
import util.UIConstants;
import util.UIFactory;
import util.ValidationUtil;

public class TransferView extends BaseFrame {
    private static final long serialVersionUID = 1L;
    
    private final TextField accountField;
    private final TextField amountField;
    private final TextField descriptionField;
    private final Button transferButton;
    private final Button cancelButton;
    private final DashboardView dashboardView;
    private final Label senderAccountLabel;
    
    public TransferView(DashboardView dashboardView) {
        super(Constants.APP_NAME + " - Fund Transfer");
        this.dashboardView = dashboardView;
        
        // Initialize UI components
        Panel mainPanel = UIFactory.createMainPanel();
        
        // North - Header
        Panel headerPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER));
        headerPanel.add(UIFactory.createHeaderLabel("Fund Transfer"));
        
        // Center - Transfer Form
        Panel formPanel = UIFactory.createPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(UIConstants.PADDING, UIConstants.PADDING, UIConstants.PADDING, UIConstants.PADDING);
        gbc.anchor = GridBagConstraints.WEST;
        
        // Sender Account
        gbc.gridx = 0;
        gbc.gridy = 0;
        formPanel.add(UIFactory.createLabel("Your Account Number:"), gbc);
        
        gbc.gridx = 1;
        User currentUser = UserController.getInstance().getCurrentUser();
        senderAccountLabel = UIFactory.createLabel(currentUser.getAccountNumber());
        senderAccountLabel.setFont(UIConstants.TITLE_FONT);
        senderAccountLabel.setForeground(UIConstants.PRIMARY_COLOR);
        formPanel.add(senderAccountLabel, gbc);
        
        // Beneficiary Account
        gbc.gridx = 0;
        gbc.gridy = 1;
        formPanel.add(UIFactory.createLabel("Beneficiary Account Number:"), gbc);
        
        gbc.gridx = 1;
        accountField = UIFactory.createTextField(20);
        formPanel.add(accountField, gbc);
        
        // Amount
        gbc.gridx = 0;
        gbc.gridy = 2;
        formPanel.add(UIFactory.createLabel("Amount:"), gbc);
        
        gbc.gridx = 1;
        amountField = UIFactory.createTextField(20);
        formPanel.add(amountField, gbc);
        
        // Description
        gbc.gridx = 0;
        gbc.gridy = 3;
        formPanel.add(UIFactory.createLabel("Description:"), gbc);
        
        gbc.gridx = 1;
        descriptionField = UIFactory.createTextField(20);
        formPanel.add(descriptionField, gbc);
        
        // Buttons
        gbc.gridx = 0;
        gbc.gridy = 4;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        
        Panel buttonPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER, UIConstants.PADDING, 0));
        
        transferButton = UIFactory.createButton("Transfer", e -> handleTransfer());
        transferButton.setPreferredSize(new Dimension(UIConstants.BUTTON_WIDTH, UIConstants.BUTTON_HEIGHT));
        buttonPanel.add(transferButton);
        
        cancelButton = UIFactory.createSecondaryButton("Cancel", e -> handleCancel());
        cancelButton.setPreferredSize(new Dimension(UIConstants.BUTTON_WIDTH, UIConstants.BUTTON_HEIGHT));
        buttonPanel.add(cancelButton);
        
        formPanel.add(buttonPanel, gbc);
        
        // Add all panels to main panel
        mainPanel.add(headerPanel, BorderLayout.NORTH);
        mainPanel.add(formPanel, BorderLayout.CENTER);
        
        // Add main panel to frame
        add(mainPanel);
    }
    
    private void handleTransfer() {
        String accountNumber = accountField.getText().trim();
        String amount = amountField.getText().trim();
        String description = descriptionField.getText().trim();
        
        // Validate input
        if (accountNumber.isEmpty() || amount.isEmpty() || description.isEmpty()) {
            UIFactory.showErrorDialog(this, "All fields are required.");
            return;
        }
        
        if (!ValidationUtil.isValidAccountNumber(accountNumber)) {
            UIFactory.showErrorDialog(this, "Please enter a valid account number.");
            return;
        }
        
        if (!ValidationUtil.isValidAmount(amount)) {
            UIFactory.showErrorDialog(this, "Please enter a valid amount greater than 0.");
            return;
        }
        
        double transferAmount = Double.parseDouble(amount);
        User currentUser = UserController.getInstance().getCurrentUser();
        
        if (transferAmount > currentUser.getBalance()) {
            UIFactory.showErrorDialog(this, "Insufficient balance.");
            return;
        }
        
        // Process transfer
        boolean success = UserController.getInstance().transferFunds(accountNumber, transferAmount);
        
        if (success) {
            UIFactory.showSuccessDialog(this, "Transfer successful!");
            dashboardView.refreshBalance();
            handleCancel(); // Close the transfer window
        } else {
            UIFactory.showErrorDialog(this, "Transfer failed. Please check the account number and try again.");
        }
    }
    
    private void handleCancel() {
        dispose(); // Close the transfer window
    }
}

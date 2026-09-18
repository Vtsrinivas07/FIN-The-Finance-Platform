package view;

import controller.UserController;
import java.awt.*;
import java.awt.event.*;
import model.User;
import util.Constants;
import util.UIConstants;
import util.UIFactory;

public class DashboardView extends BaseFrame {
    private static final long serialVersionUID = 1L;
    
    private final Label balanceLabel;
    private final Label welcomeLabel;
    private final Label accountLabel;
    private final Panel menuPanel;
    
    public DashboardView() {
        super(Constants.APP_NAME + " - Dashboard");
        
        // Create main panel with padding
        Panel mainPanel = UIFactory.createMainPanel();
        
        // Header Panel - Welcome, Account, and Balance
        Panel headerPanel = UIFactory.createPanel(new BorderLayout(UIConstants.PADDING, UIConstants.PADDING));
        headerPanel.setBackground(UIConstants.PRIMARY_COLOR);
        
        // Welcome message and Account info
        User currentUser = UserController.getInstance().getCurrentUser();
        Panel userInfoPanel = UIFactory.createPanel(new GridLayout(2, 1, 0, 5));
        userInfoPanel.setBackground(UIConstants.PRIMARY_COLOR);
        
        welcomeLabel = UIFactory.createHeaderLabel("Welcome, " + currentUser.getFullName());
        welcomeLabel.setForeground(UIConstants.LIGHT_TEXT);
        welcomeLabel.setAlignment(Label.LEFT);
        
        accountLabel = UIFactory.createLabel("Account Number: " + currentUser.getAccountNumber());
        accountLabel.setFont(UIConstants.TITLE_FONT);
        accountLabel.setForeground(UIConstants.LIGHT_TEXT);
        accountLabel.setAlignment(Label.LEFT);
        
        userInfoPanel.add(welcomeLabel);
        userInfoPanel.add(accountLabel);
        
        // Balance display
        balanceLabel = UIFactory.createHeaderLabel(String.format("₹ %.2f", currentUser.getBalance()));
        balanceLabel.setForeground(UIConstants.LIGHT_TEXT);
        
        Panel welcomePanel = UIFactory.createPanel(new FlowLayout(FlowLayout.LEFT, UIConstants.PADDING, UIConstants.PADDING));
        welcomePanel.setBackground(UIConstants.PRIMARY_COLOR);
        welcomePanel.add(userInfoPanel);
        
        Panel balancePanel = UIFactory.createPanel(new FlowLayout(FlowLayout.RIGHT, UIConstants.PADDING, UIConstants.PADDING));
        balancePanel.setBackground(UIConstants.PRIMARY_COLOR);
        balancePanel.add(balanceLabel);
        
        headerPanel.add(welcomePanel, BorderLayout.WEST);
        headerPanel.add(balancePanel, BorderLayout.EAST);
        
        // Menu Panel - Feature Buttons
        menuPanel = UIFactory.createPanel(new GridBagLayout());
        menuPanel.setBackground(UIConstants.BACKGROUND_COLOR);
        
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(UIConstants.PADDING, UIConstants.PADDING, UIConstants.PADDING, UIConstants.PADDING);
        
        // First row
        gbc.gridx = 0;
        gbc.gridy = 0;
        addFeatureButton(menuPanel, "Fund Transfer", "Transfer money to other accounts", e -> showTransferView(), gbc);
        
        gbc.gridx = 1;
        addFeatureButton(menuPanel, "Bill Payment", "Pay your utility bills", e -> showBillPaymentView(), gbc);
        
        // Second row
        gbc.gridx = 0;
        gbc.gridy = 1;
        addFeatureButton(menuPanel, "Mobile/DTH Recharge", "Recharge your mobile or DTH", e -> showRechargeView(), gbc);
        
        gbc.gridx = 1;
        addFeatureButton(menuPanel, "Transaction History", "View your transaction history", e -> showTransactionHistoryView(), gbc);
        
        // Third row
        gbc.gridx = 0;
        gbc.gridy = 2;
        addFeatureButton(menuPanel, "Account Settings", "Manage your account settings", e -> showAccountSettingsView(), gbc);
        
        gbc.gridx = 1;
        addFeatureButton(menuPanel, "Logout", "Logout from your account", e -> handleLogout(), gbc);
        
        // Add panels to main panel
        mainPanel.add(headerPanel, BorderLayout.NORTH);
        mainPanel.add(menuPanel, BorderLayout.CENTER);
        
        // Add main panel to frame
        add(mainPanel);
    }
    
    private void addFeatureButton(Panel panel, String title, String description, ActionListener listener, GridBagConstraints gbc) {
        Panel buttonPanel = UIFactory.createPanel(new BorderLayout(5, 5));
        buttonPanel.setBackground(UIConstants.SURFACE_COLOR);
        
        Button button = UIFactory.createButton(title, listener);
        button.setPreferredSize(new Dimension(350, 120));
        
        Label descLabel = UIFactory.createLabel(description);
        descLabel.setForeground(UIConstants.SECONDARY_TEXT);
        descLabel.setFont(UIConstants.SMALL_FONT);
        
        Panel textPanel = UIFactory.createPanel(new BorderLayout());
        textPanel.add(button, BorderLayout.CENTER);
        textPanel.add(descLabel, BorderLayout.SOUTH);
        
        buttonPanel.add(textPanel, BorderLayout.CENTER);
        panel.add(buttonPanel, gbc);
    }
    
    private void showTransferView() {
        new TransferView(this).setVisible(true);
    }
    
    private void showBillPaymentView() {
        new BillPaymentView(this).setVisible(true);
    }
    
    private void showRechargeView() {
        new RechargeView(this).setVisible(true);
    }
    
    private void showTransactionHistoryView() {
        new TransactionHistoryView(this).setVisible(true);
    }
    
    private void showAccountSettingsView() {
        new AccountSettingsView(this).setVisible(true);
    }
    
    private void handleLogout() {
        dispose();
        new LoginView().setVisible(true);
    }
    
    public void refreshBalance() {
        User currentUser = UserController.getInstance().getCurrentUser();
        balanceLabel.setText(String.format("₹ %.2f", currentUser.getBalance()));
    }
}
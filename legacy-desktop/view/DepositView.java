package view;

import controller.*;
import java.awt.*;
import java.util.List;
import model.*;
import util.*;

public class DepositView extends BaseFrame {
    private static final long serialVersionUID = 1L;
    
    private TextField amountField;
    private Button depositButton;
    
    public DepositView() {
        super("Deposit Money");
        initializeUI();
    }
    
    private void initializeUI() {
        Panel mainPanel = UIFactory.createMainPanel();
        
        Panel formPanel = UIFactory.createPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(UIConstants.PADDING, UIConstants.PADDING, UIConstants.PADDING, UIConstants.PADDING);
        gbc.fill = GridBagConstraints.HORIZONTAL;
        
        // Amount field
        gbc.gridx = 0;
        gbc.gridy = 0;
        formPanel.add(UIFactory.createLabel("Amount to Deposit:"), gbc);
        
        gbc.gridx = 1;
        amountField = UIFactory.createTextField(20);
        formPanel.add(amountField, gbc);
        
        // Deposit button
        gbc.gridx = 0;
        gbc.gridy = 1;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        depositButton = UIFactory.createButton("Deposit", e -> handleDeposit());
        depositButton.setPreferredSize(new Dimension(UIConstants.BUTTON_WIDTH, UIConstants.BUTTON_HEIGHT));
        formPanel.add(depositButton, gbc);
        
        mainPanel.add(formPanel, BorderLayout.CENTER);
        add(mainPanel);
    }
    
    private void handleDeposit() {
        String amountText = amountField.getText();
        
        if (amountText.isEmpty()) {
            UIFactory.showErrorDialog(this, "Please enter an amount.");
            return;
        }
        
        try {
            double amount = Double.parseDouble(amountText);
            if (amount <= 0) {
                UIFactory.showErrorDialog(this, "Invalid amount. Please enter a valid number.");
                return;
            }
            
            if (performDeposit(amount)) {
                UIFactory.showSuccessDialog(this, "Deposit successful!");
                dispose();
                new DashboardView().setVisible(true);
            } else {
                UIFactory.showErrorDialog(this, "Deposit failed. Please try again.");
            }
        } catch (NumberFormatException e) {
            UIFactory.showErrorDialog(this, "Invalid amount. Please enter a valid number.");
        }
    }
    
    private boolean performDeposit(double amount) {
        User currentUser = UserController.getInstance().getCurrentUser();
        if (currentUser != null) {
            currentUser.setBalance(currentUser.getBalance() + amount);
            
            // Save transaction record
            Transaction transaction = new Transaction(
                currentUser.getAccountNumber(),
                amount,
                Transaction.TransactionType.CREDIT,
                Transaction.TransactionCategory.DEPOSIT,
                "Cash Deposit",
                "CASH"
            );
            FileUtil.saveTransaction(transaction);
            
            // Update user in file
            List<User> users = FileUtil.loadUsers();
            for (int i = 0; i < users.size(); i++) {
                if (users.get(i).getUserId().equals(currentUser.getUserId())) {
                    users.set(i, currentUser);
                    break;
                }
            }
            FileUtil.saveUsers(users);
            return true;
        }
        return false;
    }
}

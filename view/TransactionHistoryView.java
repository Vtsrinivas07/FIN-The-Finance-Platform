package view;

import controller.UserController;
import java.awt.*;
import java.util.List;
import model.Transaction;
import util.Constants;
import util.UIFactory;

public class TransactionHistoryView extends BaseFrame {
    private static final long serialVersionUID = 1L;
    
    private final TextArea transactionArea;
    private final Button closeButton;
    
    public TransactionHistoryView(DashboardView dashboardView) {
        super(Constants.APP_NAME + " - Transaction History");
        
        // Initialize UI components
        Panel mainPanel = UIFactory.createPanel(new BorderLayout(20, 20));
        
        // North - Header
        Panel headerPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER));
        headerPanel.add(UIFactory.createHeaderLabel("Transaction History"));
        
        // Center - Transaction List
        Panel contentPanel = UIFactory.createPanel(new BorderLayout(10, 10));
        
        // Transaction area
        transactionArea = UIFactory.createTextArea(20, 50);
        transactionArea.setEditable(false);
        contentPanel.add(transactionArea, BorderLayout.CENTER);
        
        // Load transactions
        loadTransactions();
        
        // South - Close Button
        Panel buttonPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER));
        closeButton = UIFactory.createButton("Close", e -> handleClose());
        closeButton.setPreferredSize(new Dimension(Constants.BUTTON_WIDTH, Constants.BUTTON_HEIGHT));
        buttonPanel.add(closeButton);
        
        // Add all panels to main panel
        mainPanel.add(headerPanel, BorderLayout.NORTH);
        mainPanel.add(contentPanel, BorderLayout.CENTER);
        mainPanel.add(buttonPanel, BorderLayout.SOUTH);
        
        // Add main panel to frame with padding
        Panel paddedPanel = new Panel(new BorderLayout());
        paddedPanel.add(mainPanel, BorderLayout.CENTER);
        paddedPanel.add(new Panel(), BorderLayout.NORTH);
        paddedPanel.add(new Panel(), BorderLayout.SOUTH);
        paddedPanel.add(new Panel(), BorderLayout.EAST);
        paddedPanel.add(new Panel(), BorderLayout.WEST);
        
        add(paddedPanel);
    }
    
    private void loadTransactions() {
        List<Transaction> transactions = UserController.getInstance().getTransactionHistory();
        if (transactions != null && !transactions.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (Transaction transaction : transactions) {
                sb.append(transaction.toDisplayString()).append("\n");
            }
            transactionArea.setText(sb.toString());
        } else {
            transactionArea.setText("No transactions found.");
        }
    }
    
    private void handleClose() {
        dispose(); // Close the transaction history window
    }
} 
package view;

import controller.BankingController;
import controller.UserController;
import java.awt.*;
import java.util.List;
import model.BillProvider;
import util.Constants;
import util.UIFactory;
import util.ValidationUtil;

public class BillPaymentView extends BaseFrame {
    private static final long serialVersionUID = 1L;
    
    private final Choice providerChoice;
    private final TextField billNumberField;
    private final TextField amountField;
    private final Button payButton;
    private final Button cancelButton;
    
    public BillPaymentView(DashboardView dashboardView) {
        super(Constants.APP_NAME + " - Bill Payment");
        
        // Initialize UI components
        Panel mainPanel = UIFactory.createPanel(new BorderLayout(20, 20));
        
        // North - Header
        Panel headerPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER));
        headerPanel.add(UIFactory.createHeaderLabel("Bill Payment"));
        
        // Center - Payment Form
        Panel formPanel = UIFactory.createPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.anchor = GridBagConstraints.WEST;
        
        // Provider Selection
        gbc.gridx = 0;
        gbc.gridy = 0;
        formPanel.add(UIFactory.createLabel("Select Provider:"), gbc);
        
        gbc.gridx = 1;
        providerChoice = UIFactory.createChoice();
        List<BillProvider> providers = BankingController.getInstance().getBillProviders();
        for (BillProvider provider : providers) {
            providerChoice.add(provider.getName());
        }
        formPanel.add(providerChoice, gbc);
        
        // Bill Number
        gbc.gridx = 0;
        gbc.gridy = 1;
        formPanel.add(UIFactory.createLabel("Bill Number:"), gbc);
        
        gbc.gridx = 1;
        billNumberField = UIFactory.createTextField(20);
        formPanel.add(billNumberField, gbc);
        
        // Amount
        gbc.gridx = 0;
        gbc.gridy = 2;
        formPanel.add(UIFactory.createLabel("Amount:"), gbc);
        
        gbc.gridx = 1;
        amountField = UIFactory.createTextField(20);
        formPanel.add(amountField, gbc);
        
        // Buttons
        gbc.gridx = 0;
        gbc.gridy = 3;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        
        Panel buttonPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        
        payButton = UIFactory.createButton("Pay Bill", e -> handlePayment());
        payButton.setPreferredSize(new Dimension(Constants.BUTTON_WIDTH, Constants.BUTTON_HEIGHT));
        buttonPanel.add(payButton);
        
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
    
    private void handlePayment() {
        String billNumber = billNumberField.getText().trim();
        String amount = amountField.getText().trim();
        String provider = providerChoice.getSelectedItem();
        
        // Validate input
        if (billNumber.isEmpty() || amount.isEmpty()) {
            UIFactory.showErrorDialog(this, "All fields are required.");
            return;
        }
        
        if (!ValidationUtil.isValidAmount(amount)) {
            UIFactory.showErrorDialog(this, "Please enter a valid amount greater than 0.");
            return;
        }
        
        double paymentAmount = Double.parseDouble(amount);
        
        // Process payment
        boolean success = UserController.getInstance().payBill(provider, billNumber, paymentAmount);
        
        if (success) {
            UIFactory.showSuccessDialog(this, "Bill payment successful!");
            handleCancel(); // Close the payment window
        } else {
            UIFactory.showErrorDialog(this, "Payment failed. Please check your balance and try again.");
        }
    }
    
    private void handleCancel() {
        dispose(); // Close the payment window
    }
} 
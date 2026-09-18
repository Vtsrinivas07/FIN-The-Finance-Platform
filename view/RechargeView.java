package view;

import controller.BankingController;
import controller.UserController;
import java.awt.*;
import java.util.List;
import model.RechargeOperator;
import model.RechargePlan;
import util.Constants;
import util.UIFactory;
import util.ValidationUtil;

public class RechargeView extends BaseFrame {
    private static final long serialVersionUID = 1L;
    
    private final Choice operatorChoice;
    private final Choice planChoice;
    private final TextField numberField;
    private final Button rechargeButton;
    private final Button cancelButton;
    
    public RechargeView(DashboardView dashboardView) {
        super(Constants.APP_NAME + " - Mobile/DTH Recharge");
        
        // Initialize UI components
        Panel mainPanel = UIFactory.createPanel(new BorderLayout(20, 20));
        
        // North - Header
        Panel headerPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER));
        headerPanel.add(UIFactory.createHeaderLabel("Mobile/DTH Recharge"));
        
        // Center - Recharge Form
        Panel formPanel = UIFactory.createPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.anchor = GridBagConstraints.WEST;
        
        // Operator Selection
        gbc.gridx = 0;
        gbc.gridy = 0;
        formPanel.add(UIFactory.createLabel("Select Operator:"), gbc);
        
        gbc.gridx = 1;
        operatorChoice = UIFactory.createChoice();
        List<RechargeOperator> operators = BankingController.getInstance().getRechargeOperators();
        for (RechargeOperator operator : operators) {
            operatorChoice.add(operator.getName());
        }
        operatorChoice.addItemListener(e -> updatePlans());
        formPanel.add(operatorChoice, gbc);
        
        // Plan Selection
        gbc.gridx = 0;
        gbc.gridy = 1;
        formPanel.add(UIFactory.createLabel("Select Plan:"), gbc);
        
        gbc.gridx = 1;
        planChoice = UIFactory.createChoice();
        formPanel.add(planChoice, gbc);
        
        // Number
        gbc.gridx = 0;
        gbc.gridy = 2;
        formPanel.add(UIFactory.createLabel("Number:"), gbc);
        
        gbc.gridx = 1;
        numberField = UIFactory.createTextField(20);
        formPanel.add(numberField, gbc);
        
        // Buttons
        gbc.gridx = 0;
        gbc.gridy = 3;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        
        Panel buttonPanel = UIFactory.createPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        
        rechargeButton = UIFactory.createButton("Recharge", e -> handleRecharge());
        rechargeButton.setPreferredSize(new Dimension(Constants.BUTTON_WIDTH, Constants.BUTTON_HEIGHT));
        buttonPanel.add(rechargeButton);
        
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
        
        // Initialize plans
        updatePlans();
    }
    
    private void updatePlans() {
        String selectedOperator = operatorChoice.getSelectedItem();
        if (selectedOperator != null) {
            planChoice.removeAll();
            List<RechargeOperator> operators = BankingController.getInstance().getRechargeOperators();
            for (RechargeOperator operator : operators) {
                if (operator.getName().equals(selectedOperator)) {
                    List<RechargePlan> plans = BankingController.getInstance().getPlansForOperator(operator.getId());
                    for (RechargePlan plan : plans) {
                        planChoice.add(plan.getName() + " - ₹" + plan.getAmount());
                    }
                    break;
                }
            }
        }
    }
    
    private void handleRecharge() {
        String number = numberField.getText().trim();
        String operator = operatorChoice.getSelectedItem();
        String selectedPlan = planChoice.getSelectedItem();

        // Validate input
        if (number.isEmpty() || selectedPlan == null) {
            UIFactory.showErrorDialog(this, "All fields are required.");
            return;
        }

        if (!ValidationUtil.isValidMobile(number)) {
            UIFactory.showErrorDialog(this, "Please enter a valid 10-digit number.");
            return;
        }

        // Extract the amount from the selected plan
        double rechargeAmount = extractAmountFromPlan(selectedPlan);

        // Process recharge
        boolean success = UserController.getInstance().rechargeAccount(operator, number, rechargeAmount);

        if (success) {
            UIFactory.showSuccessDialog(this, "Recharge successful!");
            handleCancel(); // Close the recharge window
        } else {
            UIFactory.showErrorDialog(this, "Recharge failed. Please check your balance and try again.");
        }
    }

    // Helper method to extract the amount from the selected plan
    private double extractAmountFromPlan(String selectedPlan) {
        // Assuming the plan format is "Plan Name - ₹Amount"
        String[] parts = selectedPlan.split(" - ₹");
        if (parts.length == 2) {
            try {
                return Double.parseDouble(parts[1].trim());
            } catch (NumberFormatException e) {
                UIFactory.showErrorDialog(this, "Invalid plan format.");
            }
        }
        return 0.0;
    }
    
    private void handleCancel() {
        dispose(); // Close the recharge window
    }
}
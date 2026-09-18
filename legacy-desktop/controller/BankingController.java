package controller;

import model.*;
import util.FileUtil;

import java.util.List;
import java.util.stream.Collectors;

public class BankingController {
    private static BankingController instance;
    
    private BankingController() {
        // Private constructor for singleton pattern
        // Initialize demo data
        FileUtil.initializeDemoData();
    }
    
    public static BankingController getInstance() {
        if (instance == null) {
            instance = new BankingController();
        }
        return instance;
    }
    
    public List<BillProvider> getBillProviders() {
        return FileUtil.loadProviders();
    }
    
    public List<BillProvider> getBillProvidersByCategory(String category) {
        return FileUtil.loadProviders().stream()
                .filter(provider -> provider.getCategory().equals(category))
                .collect(Collectors.toList());
    }
    
    public List<RechargeOperator> getRechargeOperators() {
        return FileUtil.loadOperators();
    }
    
    public List<RechargeOperator> getOperatorsByType(String type) {
        return FileUtil.loadOperators().stream()
                .filter(operator -> operator.getType().equals(type))
                .collect(Collectors.toList());
    }
    
    public List<RechargePlan> getPlansForOperator(String operatorId) {
        return FileUtil.getPlansForOperator(operatorId);
    }
}
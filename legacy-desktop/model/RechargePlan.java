package model;

import java.io.Serializable;

public class RechargePlan implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final String id;
    private final String operatorId;
    private final String name;
    private final double amount;
    private final String validity;
    private final String description;
    
    public RechargePlan(String id, String operatorId, String name, double amount, String validity, String description) {
        this.id = id;
        this.operatorId = operatorId;
        this.name = name;
        this.amount = amount;
        this.validity = validity;
        this.description = description;
    }
    
    // Getters
    public String getId() {
        return id;
    }
    
    public String getOperatorId() {
        return operatorId;
    }
    
    public String getName() {
        return name;
    }
    
    public double getAmount() {
        return amount;
    }
    
    public String getValidity() {
        return validity;
    }
    
    public String getDescription() {
        return description;
    }
    
    @Override
    public String toString() {
        return name + " - ₹" + amount + " (" + validity + ")";
    }
}
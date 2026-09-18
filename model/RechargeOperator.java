package model;

import java.io.Serializable;

public class RechargeOperator implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final String id;
    private final String name;
    private final String type; // MOBILE or DTH
    
    public RechargeOperator(String id, String name, String type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
    
    // Getters
    public String getId() {
        return id;
    }
    
    public String getName() {
        return name;
    }
    
    public String getType() {
        return type;
    }
    
    @Override
    public String toString() {
        return name;
    }
}
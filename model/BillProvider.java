package model;

import java.io.Serializable;

public class BillProvider implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final String id;
    private final String name;
    private final String category;
    
    public BillProvider(String id, String name, String category) {
        this.id = id;
        this.name = name;
        this.category = category;
    }
    
    // Getters
    public String getId() {
        return id;
    }
    
    public String getName() {
        return name;
    }
    
    public String getCategory() {
        return category;
    }
    
    @Override
    public String toString() {
        return name;
    }
}
package model;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

public class Transaction implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum TransactionType {
        CREDIT, DEBIT
    }

    public enum TransactionCategory {
        TRANSFER, BILL_PAYMENT, RECHARGE, DEPOSIT
    }

    private final String transactionId;
    private final String accountNumber;
    private final double amount;
    private final TransactionType type;
    private final TransactionCategory category;
    private final String description;
    private final Date timestamp;
    private final String recipientInfo; // account number, bill reference, or mobile number

    public Transaction(String accountNumber, double amount, TransactionType type, 
                       TransactionCategory category, String description, String recipientInfo) {
        this.transactionId = UUID.randomUUID().toString();
        this.accountNumber = accountNumber;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.description = description;
        this.timestamp = new Date();
        this.recipientInfo = recipientInfo;
    }

    // Getters
    public String getTransactionId() {
        return transactionId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public double getAmount() {
        return amount;
    }

    public TransactionType getType() {
        return type;
    }

    public TransactionCategory getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public String getRecipientInfo() {
        return recipientInfo;
    }
    
    public String getFormattedDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(timestamp);
    }

    @Override
    public String toString() {
        return "Transaction{" +
                "transactionId='" + transactionId + '\'' +
                ", accountNumber='" + accountNumber + '\'' +
                ", amount=" + amount +
                ", type=" + type +
                ", category=" + category +
                ", description='" + description + '\'' +
                ", timestamp=" + getFormattedDate() +
                ", recipientInfo='" + recipientInfo + '\'' +
                '}';
    }
    
    // Format for display in the UI
    public String toDisplayString() {
        String typeSymbol = type == TransactionType.CREDIT ? "+" : "-";
        return String.format("%s | %s | %s | %s%s%.2f | %s", 
                getFormattedDate(),
                category,
                description,
                typeSymbol,
                "₹",
                amount,
                recipientInfo);
    }
    
    // Format for saving to CSV
    public String toCsvString() {
        return String.format("%s,%s,%s,%.2f,%s,%s,%s,%s",
                transactionId,
                accountNumber,
                getFormattedDate(),
                amount,
                type,
                category,
                description,
                recipientInfo);
    }
}
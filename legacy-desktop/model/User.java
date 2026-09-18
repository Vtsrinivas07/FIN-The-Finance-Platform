package model;

import java.io.Serializable;
import java.util.UUID;

public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final String userId;
    private final String accountNumber;
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String mobileNumber;
    private String address;
    private double balance;

    public User(String username, String password, String fullName, String email, String mobileNumber, String address) {
        this.userId = UUID.randomUUID().toString();
        this.accountNumber = generateAccountNumber();
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.address = address;
        this.balance = 1000.0; // Initial balance
    }

    private String generateAccountNumber() {
        // Generate a 10-digit account number
        return "ACC" + System.currentTimeMillis() % 10000000000L;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    @Override
    public String toString() {
        return "User{" +
                "userId='" + userId + '\'' +
                ", accountNumber='" + accountNumber + '\'' +
                ", username='" + username + '\'' +
                ", fullName='" + fullName + '\'' +
                ", email='" + email + '\'' +
                ", mobileNumber='" + mobileNumber + '\'' +
                ", address='" + address + '\'' +
                ", balance=" + balance +
                '}';
    }
}
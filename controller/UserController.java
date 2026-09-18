// ------------ CONTROLLER CLASSES ------------

// controller/UserController.java
package controller;

import java.util.List;
import model.Transaction;
import model.User;
import util.FileUtil;
import util.ValidationUtil;

public class UserController {
    private static UserController instance;
    private User currentUser;
    
    private UserController() {
        // Private constructor for singleton pattern
    }
    
    public static UserController getInstance() {
        if (instance == null) {
            instance = new UserController();
        }
        return instance;
    }
    
    public boolean loginUser(String username, String password) {
        List<User> users = FileUtil.loadUsers();
        
        for (User user : users) {
            if (user.getUsername().equals(username) && user.getPassword().equals(password)) {
                currentUser = user;
                return true;
            }
        }
        
        return false;
    }
    
    public boolean registerUser(String username, String password, String fullName, 
                               String email, String mobile, String address) {
        if (!ValidationUtil.isValidUsername(username)) {
            return false;
        }
        
        if (!ValidationUtil.isValidPassword(password)) {
            return false;
        }
        
        if (!ValidationUtil.isValidEmail(email)) {
            return false;
        }
        
        if (!ValidationUtil.isValidMobile(mobile)) {
            return false;
        }
        
        List<User> users = FileUtil.loadUsers();
        
        // Check if username already exists
        for (User user : users) {
            if (user.getUsername().equals(username)) {
                return false;
            }
        }
        
        // Create new user
        User newUser = new User(username, password, fullName, email, mobile, address);
        users.add(newUser);
        
        // Save users to file
        FileUtil.saveUsers(users);
        return true;
    }
    
    public User getCurrentUser() {
        return currentUser;
    }
    
    public void logout() {
        currentUser = null;
    }
    
    public boolean updateUserDetails(String fullName, String email, String mobile, String address) {
        if (!ValidationUtil.isValidEmail(email)) {
            return false;
        }
        
        if (!ValidationUtil.isValidMobile(mobile)) {
            return false;
        }
        
        if (currentUser != null) {
            currentUser.setFullName(fullName);
            currentUser.setEmail(email);
            currentUser.setMobileNumber(mobile);
            currentUser.setAddress(address);
            
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
    
    public boolean changePassword(String currentPassword, String newPassword) {
        if (!ValidationUtil.isValidPassword(newPassword)) {
            return false;
        }
        
        if (currentUser != null && currentUser.getPassword().equals(currentPassword)) {
            currentUser.setPassword(newPassword);
            
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
    
    public double getBalance() {
        if (currentUser != null) {
            return currentUser.getBalance();
        }
        return 0.0;
    }
     public boolean transferFunds(String receiverAccountNumber, double amount) {
        if (currentUser == null || amount <= 0 || amount > currentUser.getBalance()) {
            return false;
        }
        
        List<User> users = FileUtil.loadUsers();
        User receiver = null;
        
        // Find receiver
        for (User user : users) {
            if (user.getAccountNumber().equals(receiverAccountNumber)) {
                receiver = user;
                break;
            }
        }
        
        if (receiver == null) {
            return false;
        }
        
        // Update balances
        currentUser.setBalance(currentUser.getBalance() - amount);
        receiver.setBalance(receiver.getBalance() + amount);
        
        // Save transaction record for sender
        Transaction senderTransaction = new Transaction(
            currentUser.getAccountNumber(),
            amount,
            Transaction.TransactionType.DEBIT,
            Transaction.TransactionCategory.TRANSFER,
            "Transfer to " + receiver.getFullName(),
            receiverAccountNumber
        );
        FileUtil.saveTransaction(senderTransaction);
        
        // Save transaction record for receiver
        Transaction receiverTransaction = new Transaction(
            receiver.getAccountNumber(),
            amount,
            Transaction.TransactionType.CREDIT,
            Transaction.TransactionCategory.TRANSFER,
            "Transfer from " + currentUser.getFullName(),
            currentUser.getAccountNumber()
        );
        FileUtil.saveTransaction(receiverTransaction);
        
        // Update users in file
        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).getUserId().equals(currentUser.getUserId())) {
                users.set(i, currentUser);
            } else if (users.get(i).getUserId().equals(receiver.getUserId())) {
                users.set(i, receiver);
            }
        }
        
        FileUtil.saveUsers(users);
        return true;
    }
    
    public boolean payBill(String provider, String billNumber, double amount) {
        if (currentUser == null || amount <= 0 || amount > currentUser.getBalance()) {
            return false;
        }
        
        // Update balance
        currentUser.setBalance(currentUser.getBalance() - amount);
        
        // Save transaction record
        Transaction transaction = new Transaction(
            currentUser.getAccountNumber(),
            amount,
            Transaction.TransactionType.DEBIT,
            Transaction.TransactionCategory.BILL_PAYMENT,
            "Payment to " + provider,
            "Bill #" + billNumber
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
    
    public boolean rechargeAccount(String operator, String number, double amount) {
        if (currentUser == null || amount <= 0 || amount > currentUser.getBalance()) {
            return false;
        }
        
        // Update balance
        currentUser.setBalance(currentUser.getBalance() - amount);
        
        // Save transaction record
        Transaction transaction = new Transaction(
            currentUser.getAccountNumber(),
            amount,
            Transaction.TransactionType.DEBIT,
            Transaction.TransactionCategory.RECHARGE,
            "Recharge " + operator,
            number
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
    
    public List<Transaction> getTransactionHistory() {
        if (currentUser == null) {
            return null;
        }
        
        return FileUtil.loadTransactions(currentUser.getAccountNumber());
    }
}
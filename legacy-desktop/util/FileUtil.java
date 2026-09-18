package util;

import java.io.*;
import java.util.*;
import model.*;

public class FileUtil {
    private static final String DATA_DIR = "data";
    private static final String USERS_FILE = DATA_DIR + "/users.dat";
    private static final String TRANSACTIONS_FILE = DATA_DIR + "/transactions.csv";
    private static final String PROVIDERS_FILE = DATA_DIR + "/providers.dat";
    private static final String OPERATORS_FILE = DATA_DIR + "/operators.dat";
    private static final String PLANS_FILE = DATA_DIR + "/plans.dat";

    // Initialize data directory
    static {
        File dir = new File(DATA_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    // Save all users
    public static void saveUsers(List<User> users) {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(USERS_FILE))) {
            oos.writeObject(users);
        } catch (IOException e) {
        }
    }

    // Load all users
    @SuppressWarnings("unchecked")
    public static List<User> loadUsers() {
        List<User> users = new ArrayList<>();
        
        File file = new File(USERS_FILE);
        if (!file.exists()) {
            return users;
        }
        
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(USERS_FILE))) {
            users = (List<User>) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
        }
        return users;
    }

    // Save a transaction to CSV
    public static void saveTransaction(Transaction transaction) {
        try (FileWriter fw = new FileWriter(TRANSACTIONS_FILE, true);
             BufferedWriter bw = new BufferedWriter(fw)) {
            bw.write(transaction.toCsvString());
            bw.newLine();
        } catch (IOException e) {
        }
    }

    // Load transactions for an account
    public static List<Transaction> loadTransactions(String accountNumber) {
        List<Transaction> transactions = new ArrayList<>();
        File file = new File(TRANSACTIONS_FILE);
        if (!file.exists()) {
            return transactions;
        }

        try (BufferedReader br = new BufferedReader(new FileReader(TRANSACTIONS_FILE))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length >= 8 && parts[1].equals(accountNumber)) {
                    Transaction transaction = new Transaction(
                        parts[1], // accountNumber
                        Double.parseDouble(parts[3]), // amount
                        Transaction.TransactionType.valueOf(parts[4]), // type
                        Transaction.TransactionCategory.valueOf(parts[5]), // category
                        parts[6], // description
                        parts[7]  // recipientInfo
                    );
                    transactions.add(transaction);
                }
            }
        } catch (IOException e) {
        }
        return transactions;
    }

    // Save all providers
    public static void saveProviders(List<BillProvider> providers) {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(PROVIDERS_FILE))) {
            oos.writeObject(providers);
        } catch (IOException e) {
        }
    }

    // Load all providers
    @SuppressWarnings("unchecked")
    public static List<BillProvider> loadProviders() {
        List<BillProvider> providers = new ArrayList<>();
        
        File file = new File(PROVIDERS_FILE);
        if (!file.exists()) {
            return providers;
        }
        
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(PROVIDERS_FILE))) {
            providers = (List<BillProvider>) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
        }
        return providers;
    }

    // Save all operators
    public static void saveOperators(List<RechargeOperator> operators) {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(OPERATORS_FILE))) {
            oos.writeObject(operators);
        } catch (IOException e) {
        }
    }

    // Load all operators
    @SuppressWarnings("unchecked")
    public static List<RechargeOperator> loadOperators() {
        List<RechargeOperator> operators = new ArrayList<>();
        
        File file = new File(OPERATORS_FILE);
        if (!file.exists()) {
            return operators;
        }
        
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(OPERATORS_FILE))) {
            operators = (List<RechargeOperator>) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
        }
        return operators;
    }

    // Save all plans
    public static void savePlans(List<RechargePlan> plans) {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(PLANS_FILE))) {
            oos.writeObject(plans);
        } catch (IOException e) {
        }
    }

    // Load all plans
    @SuppressWarnings("unchecked")
    public static List<RechargePlan> loadPlans() {
        List<RechargePlan> plans = new ArrayList<>();
        
        File file = new File(PLANS_FILE);
        if (!file.exists()) {
            return plans;
        }
        
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(PLANS_FILE))) {
            plans = (List<RechargePlan>) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
        }
        return plans;
    }

    // Get plans for a specific operator
    public static List<RechargePlan> getPlansForOperator(String operatorId) {
        List<RechargePlan> allPlans = loadPlans();
        return allPlans.stream()
                .filter(plan -> plan.getOperatorId().equals(operatorId))
                .collect(java.util.stream.Collectors.toList());
    }

    // Initialize demo data
    public static void initializeDemoData() {
        // Initialize providers if not exists
        if (loadProviders().isEmpty()) {
            List<BillProvider> providers = new ArrayList<>();
            providers.add(new BillProvider("ELEC1", "State Electricity Board", "Electricity"));
            providers.add(new BillProvider("WATER1", "Municipal Water Board", "Water"));
            providers.add(new BillProvider("GAS1", "City Gas Corporation", "Gas"));
            providers.add(new BillProvider("INTERNET1", "Broadband Provider", "Internet"));
            saveProviders(providers);
        }

        // Initialize operators if not exists
        if (loadOperators().isEmpty()) {
            List<RechargeOperator> operators = new ArrayList<>();
            operators.add(new RechargeOperator("AIR1", "Airtel", "MOBILE"));
            operators.add(new RechargeOperator("JIO1", "Jio", "MOBILE"));
            operators.add(new RechargeOperator("VOD1", "Vodafone", "MOBILE"));
            operators.add(new RechargeOperator("DTH1", "Tata Play", "DTH"));
            operators.add(new RechargeOperator("DTH2", "Dish TV", "DTH"));
            saveOperators(operators);
        }

        // Initialize plans if not exists
        if (loadPlans().isEmpty()) {
            List<RechargePlan> plans = new ArrayList<>();
            
            // Airtel plans
            plans.add(new RechargePlan("AIR_P1", "AIR1", "Monthly Basic", 149.0, "28 days", "Unlimited calls, 2GB/day"));
            plans.add(new RechargePlan("AIR_P2", "AIR1", "Quarterly Basic", 249.0, "84 days", "Unlimited calls, 1.5GB/day"));
            plans.add(new RechargePlan("AIR_P3", "AIR1", "Quarterly Premium", 499.0, "84 days", "Unlimited calls, 2GB/day"));
            
            // Jio plans
            plans.add(new RechargePlan("JIO_P1", "JIO1", "Monthly Basic", 199.0, "28 days", "Unlimited calls, 1.5GB/day"));
            plans.add(new RechargePlan("JIO_P2", "JIO1", "Monthly Standard", 299.0, "28 days", "Unlimited calls, 2GB/day"));
            plans.add(new RechargePlan("JIO_P3", "JIO1", "Monthly Premium", 349.0, "28 days", "Unlimited calls, 3GB/day"));
            
            // Vodafone plans
            plans.add(new RechargePlan("VOD_P1", "VOD1", "Monthly Basic", 179.0, "28 days", "Unlimited calls, 1GB/day"));
            plans.add(new RechargePlan("VOD_P2", "VOD1", "Monthly Standard", 269.0, "28 days", "Unlimited calls, 1.5GB/day"));
            plans.add(new RechargePlan("VOD_P3", "VOD1", "Monthly Premium", 449.0, "56 days", "Unlimited calls, 2GB/day"));
            
            // DTH plans
            plans.add(new RechargePlan("DTH1_P1", "DTH1", "Basic Pack", 299.0, "30 days", "Basic channels"));
            plans.add(new RechargePlan("DTH1_P2", "DTH1", "Standard Pack", 499.0, "30 days", "Standard channels"));
            plans.add(new RechargePlan("DTH1_P3", "DTH1", "Premium Pack", 699.0, "30 days", "Premium channels"));
            
            plans.add(new RechargePlan("DTH2_P1", "DTH2", "Basic Pack", 249.0, "30 days", "Basic channels"));
            plans.add(new RechargePlan("DTH2_P2", "DTH2", "Standard Pack", 449.0, "30 days", "Standard channels"));
            plans.add(new RechargePlan("DTH2_P3", "DTH2", "Premium Pack", 649.0, "30 days", "Premium channels"));
            
            savePlans(plans);
        }
    }
}
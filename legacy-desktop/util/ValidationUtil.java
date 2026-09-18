package util;

import java.util.regex.Pattern;

public class ValidationUtil {
    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@(.+)$";
    private static final String MOBILE_REGEX = "^[0-9]{10}$";
    private static final String PASSWORD_REGEX = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$";
    
    public static boolean isValidEmail(String email) {
        return Pattern.compile(EMAIL_REGEX).matcher(email).matches();
    }
    
    public static boolean isValidMobile(String mobile) {
        return Pattern.compile(MOBILE_REGEX).matcher(mobile).matches();
    }
    
    public static boolean isValidPassword(String password) {
        return Pattern.compile(PASSWORD_REGEX).matcher(password).matches();
    }
    
    public static boolean isValidAccountNumber(String accountNumber) {
        return accountNumber != null && accountNumber.trim().length() > 0;
    }
    
    public static boolean isValidAmount(String amount) {
        try {
            double value = Double.parseDouble(amount);
            return value > 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    
    public static boolean isValidUsername(String username) {
        return username != null && username.trim().length() >= 4;
    }
    
    public static String getPasswordRequirements() {
        return """
               Password must contain at least 8 characters, including:
               - At least one digit
               - At least one lowercase letter
               - At least one uppercase letter
               - At least one special character (@#$%^&+=)
               - No whitespace""";
    }
}
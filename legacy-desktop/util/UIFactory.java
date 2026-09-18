package util;

import java.awt.*;
import java.awt.event.ActionListener;
import javax.swing.*;

public class UIFactory {
    
    public static Font getHeaderFont() {
        return new Font("Arial", Font.BOLD, Constants.HEADER_FONT_SIZE);
    }
    
    public static Font getTitleFont() {
        return new Font("Arial", Font.BOLD, Constants.TITLE_FONT_SIZE);
    }
    
    public static Font getNormalFont() {
        return new Font("Arial", Font.PLAIN, Constants.NORMAL_FONT_SIZE);
    }
    
    public static Font getSmallFont() {
        return new Font("Arial", Font.PLAIN, Constants.SMALL_FONT_SIZE);
    }
    
    public static Label createLabel(String text) {
        Label label = new Label(text);
        label.setFont(UIConstants.REGULAR_FONT);
        label.setForeground(UIConstants.LOGIN_NAME_COLOR);
        return label;
    }
    
    public static Label createHeaderLabel(String text) {
        Label label = new Label(text, Label.CENTER);
        label.setFont(UIConstants.HEADER_FONT);
        label.setForeground(UIConstants.PRIMARY_TEXT);
        return label;
    }
    
    public static Label createTitleLabel(String text) {
        Label label = new Label(text);
        label.setFont(UIConstants.TITLE_FONT);
        label.setForeground(UIConstants.PRIMARY_TEXT);
        return label;
    }
    
    
    public static Button createButton(String text, ActionListener listener) {
        Button button = new Button(text);
        button.setFont(UIConstants.REGULAR_FONT);
        button.setBackground(UIConstants.BUTTON_BACKGROUND);
        button.setForeground(UIConstants.BUTTON_TEXT);
        if (listener != null) {
            button.addActionListener(listener);
        }
        return button;
    }
    
    public static Button createSecondaryButton(String text, ActionListener listener) {
        Button button = new Button(text);
        button.setFont(UIConstants.REGULAR_FONT);
        button.setBackground(UIConstants.SECONDARY_BUTTON_BACKGROUND);
        button.setForeground(UIConstants.SECONDARY_BUTTON_TEXT);
        if (listener != null) {
            button.addActionListener(listener);
        }
        return button;
    }
    
    public static TextField createTextField(int columns) {
        TextField textField = new TextField(columns);
        textField.setFont(UIConstants.REGULAR_FONT);
        textField.setBackground(UIConstants.SURFACE_COLOR);
        textField.setForeground(UIConstants.PRIMARY_TEXT);
        return textField;
    }
    
    public static TextArea createTextArea(int rows, int columns) {
        TextArea textArea = new TextArea(rows, columns);
        textArea.setFont(UIConstants.REGULAR_FONT);
        textArea.setBackground(UIConstants.SURFACE_COLOR);
        textArea.setForeground(UIConstants.PRIMARY_TEXT);
        return textArea;
    }
    
    public static Choice createChoice() {
        Choice choice = new Choice();
        choice.setFont(UIConstants.REGULAR_FONT);
        choice.setBackground(UIConstants.SURFACE_COLOR);
        choice.setForeground(UIConstants.PRIMARY_TEXT);
        return choice;
    }
    
    public static Panel createPanel(LayoutManager layout) {
        Panel panel = new Panel(layout);
        panel.setBackground(UIConstants.SURFACE_COLOR);
        return panel;
    }
    
    public static Panel createFormPanel() {
        Panel panel = createPanel(new GridLayout(0, 2, 10, 10));
        panel.setBackground(Color.WHITE);
        return panel;
    }
    
    public static void showErrorDialog(Component parent, String message) {
        JOptionPane.showMessageDialog(null, message, "Error", JOptionPane.ERROR_MESSAGE);
    }
    
    public static void showInfoDialog(Component parent, String message) {
        JOptionPane.showMessageDialog(null, message, "Information", JOptionPane.INFORMATION_MESSAGE);
    }
    
    public static void showSuccessDialog(Component parent, String message) {
        JOptionPane.showMessageDialog(null, message, "Success", JOptionPane.INFORMATION_MESSAGE);
    }
    
    public static boolean showConfirmDialog(Component parent, String message) {
        int result = JOptionPane.showConfirmDialog(null, message, "Confirm", JOptionPane.YES_NO_OPTION);
        return result == JOptionPane.YES_OPTION;
    }
    
    public static Panel createMainPanel() {
        Panel mainPanel = createPanel(new BorderLayout(UIConstants.PADDING, UIConstants.PADDING));
        mainPanel.setBackground(UIConstants.BACKGROUND_COLOR);
        return addPadding(mainPanel);
    }
    
    public static Panel addPadding(Panel panel) {
        Panel paddedPanel = createPanel(new BorderLayout());
        paddedPanel.setBackground(UIConstants.BACKGROUND_COLOR);
        paddedPanel.add(panel, BorderLayout.CENTER);
        paddedPanel.add(createPaddingPanel(), BorderLayout.NORTH);
        paddedPanel.add(createPaddingPanel(), BorderLayout.SOUTH);
        paddedPanel.add(createPaddingPanel(), BorderLayout.EAST);
        paddedPanel.add(createPaddingPanel(), BorderLayout.WEST);
        return paddedPanel;
    }
    
    private static Panel createPaddingPanel() {
        Panel panel = createPanel(null);
        panel.setPreferredSize(new Dimension(UIConstants.PADDING, UIConstants.PADDING));
        return panel;
    }
}


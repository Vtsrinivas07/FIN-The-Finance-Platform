package view;

import java.awt.*;
import util.UIConstants;

public class BaseFrame extends Frame {
    private static final long serialVersionUID = 1L;
    
    // Constructor
    public BaseFrame(String title) {
        super(title);
        
        // Set window properties
        setSize(UIConstants.WINDOW_WIDTH, UIConstants.WINDOW_HEIGHT);
        setBackground(UIConstants.BACKGROUND_COLOR);
        setLocationRelativeTo(null); // Center on screen
        setResizable(false);
        
        // Add window closing event
        addWindowListener(new java.awt.event.WindowAdapter() {
            @Override
            public void windowClosing(java.awt.event.WindowEvent windowEvent) {
                dispose();
            }
        });
    }
    
    @Override
    public void setVisible(boolean visible) {
        if (visible) {
            pack(); // Adjust window size to fit components
            setLocationRelativeTo(null); // Center on screen
        }
        super.setVisible(visible);
    }
    
    // Show this frame and hide the provided frame
    public void showFrame(Frame previousFrame) {
        if (previousFrame != null) {
            previousFrame.setVisible(false);
        }
        setVisible(true);
    }
}
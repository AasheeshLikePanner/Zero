'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '@/types/theme';
import { fetchUserTheme } from '@/lib/theme-service';
import { saveUserTheme } from '@/lib/theme-service';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  loading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children,
  defaultTheme 
}: { 
  children: React.ReactNode;
  defaultTheme: Theme 
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load saved theme from database or localStorage
    const loadTheme = async () => {
      try {
        const savedTheme = await fetchUserTheme(); // Your API call
        console.log('savedTheme', savedTheme);
        console.log('fecthing themes');
        
        
        if (savedTheme) {
          setTheme(savedTheme);
          applyTheme(savedTheme);
        } else {
          applyTheme(defaultTheme);
        }
      } catch (error) {
        console.error('Failed to load theme', error);
        applyTheme(defaultTheme);
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  const applyTheme = (theme: Theme) => {
    // Apply to document root
    const root = document.documentElement;
    
    // Colors
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--background', theme.colors.background);
    // Set all other color variables...
    
    // Fonts
    root.style.setProperty('--font-primary', theme.fonts.primary);
    root.style.setProperty('--font-secondary', theme.fonts.secondary);
    
    // Spacing
    root.style.setProperty('--spacing-sm', theme.spacing.small);
    // Set other spacing variables...
    
    // Shadows
    root.style.setProperty('--shadow-sm', theme.shadows.sm);
    // Set other shadow variables...
  };

  const handleSetTheme = async (newTheme: Theme) => {
    try {
      // Save to database
      await saveUserTheme(newTheme); // Your API call
      setTheme(newTheme);
      applyTheme(newTheme);
    } catch (error) {
      console.error('Failed to save theme', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
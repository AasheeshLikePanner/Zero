import type { Theme, ThemeFormValues } from "@/types/theme";
import { ThemeRepository } from "./db";

export class ThemeService {
  constructor(private repository = new ThemeRepository()) {}

  async applyTheme(theme: Theme): Promise<void> {
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Apply fonts
    root.style.setProperty('--font-primary', theme.fonts.primary);
    root.style.setProperty('--font-secondary', theme.fonts.secondary);
    
    // Apply spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  }


  async getThemeFormValues(userId: string): Promise<ThemeFormValues> {
    const userThemes = await this.repository.getUserThemes(userId);
    return {
      colorTheme: '',
      customTheme: userThemes[0]?.id
    };
  }

  async createTheme(
    userId: string,
    name: string,
    themeData: {
      colors: ThemeColors;
      fonts: ThemeFonts;
      radii: ThemeRadii;
      spacing: ThemeSpacing;
      shadows: ThemeShadows;
    },
    isPublic: boolean = false
  ): Promise<Theme> {
    // Validate required fields
    if (!name || !themeData.colors || !themeData.fonts || !themeData.spacing || !themeData.shadows) {
      throw new Error("Missing required theme properties");
    }

    const newTheme: Theme = {
      id: crypto.randomUUID(),
      userId,
      name,
      isPublic,
      colors: themeData.colors,
      fonts: themeData.fonts,
      radii: themeData.radii,
      spacing: themeData.spacing,
      shadows: themeData.shadows,
      preview: {
        primary: themeData.colors.primary,
        secondary: themeData.colors.secondary,
        background: themeData.colors.background,
        border: themeData.colors.border,
        accent: themeData.colors.accent,
        text: themeData.colors.text,
        textOnAccent: themeData.colors.textOnAccent
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.repository.saveTheme(newTheme);
  }

  private getDefaultTheme(): Omit<Theme, 'id' | 'userId' | 'name' | 'isPublic'> {
    return {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f43f5e',
        background: '#ffffff',
        foreground: '#020817',
        border: '#e2e8f0',
        text: '#020817',
        textSecondary: '#64748b',
        textOnPrimary: '#ffffff',
        textOnAccent: '#ffffff'
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Inter'
      },
      radii: {
        small: '0.25rem',
        medium: '0.5rem',
        large: '0.75rem'
      },
      spacing: {
        small: '0.5rem',
        medium: '1rem',
        large: '1.5rem'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
      },
      preview: {
        primary: '#3b82f6',
        secondary: '#64748b',
        background: '#ffffff',
        border: '#e2e8f0',
        accent: '#f43f5e',
        text: '#020817',
        textOnAccent: '#ffffff'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
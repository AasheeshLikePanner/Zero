import type { Theme, ThemeFormValues, ThemeColors, ThemeSpacing, ThemeShadows, ThemeRadii, ThemeFonts } from "@/types/theme";
import { ThemeRepository } from "./db";

export class ThemeService {
  repository: ThemeRepository;

  constructor() {
    this.repository = new ThemeRepository();
  }


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
  ){
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

  async cloneTheme(originalThemeId: string, userId: string, newName: string){
    if (!originalThemeId || !userId || !newName) {
      throw new Error("Original theme ID, user ID, and new name are required");
    }

    return this.repository.cloneTheme(originalThemeId, userId, newName);
  }
}
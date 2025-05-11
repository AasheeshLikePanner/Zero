// types/theme.ts
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  border: string;
  text: string;
  textSecondary: string;
  textOnPrimary: string;
  textOnAccent: string;
  [key: string]: string; // Index signature for dynamic access
}

export interface ThemeFonts {
  primary: string;
  secondary: string;
}

export interface ThemeRadii {
  small: string;
  medium: string;
  large: string;
}

export interface ThemeSpacing {
  small: string;
  medium: string;
  large: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  [key: string]: string; // Index signature for dynamic access
}

export interface ThemePreview {
  primary: string;
  secondary: string;
  background: string;
  border: string;
  accent: string;
  text: string;
  textOnAccent: string;
}

export interface Theme {
  id: string;
  name: string;
  isPublic: boolean;
  userId?: string;
  tags?: string[];
  colors: ThemeColors;
  fonts: ThemeFonts;
  radii: ThemeRadii;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  preview: ThemePreview;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ThemeFormValues = {
  colorTheme: 'dark' | 'light' | 'system' | '';
  customTheme?: string;
};

// Shadow presets type for default values
export type ShadowPresets = {
  [key in keyof ThemeShadows]: string;
};

// Font options type for the font selector
export type FontOptions = {
  label: string;
  value: string;
  variable?: string;
}[];
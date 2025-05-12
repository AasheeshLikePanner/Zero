import type { Theme } from '@/types/theme';

const THEME_STORAGE_KEY = 'user-theme';

export async function fetchUserTheme(): Promise<Theme | null> {
  try {
    const response = await fetch('/api/theme', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch theme');
    const res = await response.json();
    console.log(res)
    return res;
  } catch (error) {
    console.error('Error fetching theme:', error);
    const localTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return localTheme ? JSON.parse(localTheme) : null;
  }
}

export async function saveUserTheme(theme: Theme): Promise<void> {
  try {
    const response = await fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    });
    if (!response.ok) throw new Error('Failed to save theme');
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.error('Error saving theme:', error);
    throw error;
  }
}

export async function  clonePublicTheme(themeId:string, themeName:string): Promise<void> {
  try{
    const response = await fetch('/api/themes', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalThemeId: themeId,
        newName: themeName
      })
    });
  } catch (error) {
    console.error('Error saving theme:', error);
    throw error;
  }
}
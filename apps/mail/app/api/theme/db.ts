import { eq, and } from "drizzle-orm";
import { db } from "@zero/db";
import { theme } from "@zero/db/schema";
import type { Theme } from "@/types/theme";
import { trackFallbackParamAccessed } from "next/dist/server/app-render/dynamic-rendering";

export class ThemeRepository {
  async getThemeById(id: string) {
    const result = await db
      .select()
      .from(theme)
      .where(eq(theme.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async getUserThemes(userId: string){
    return db
      .select()
      .from(theme)
      .where(and(
        eq(theme.userId, userId)
      ));
  }

  async getPublicThemes(){
    return db
      .select()
      .from(theme)
      .where(eq(theme.isPublic, true));
  }

 async saveTheme(themeData: Theme){
    // Ensure required fields are present
    if (!themeData.colors || !themeData.fonts || !themeData.spacing || !themeData.shadows) {
      throw new Error("Missing required theme properties");
    }

    const result = await db
      .insert(theme)
      .values({
        id: themeData.id,
        userId: themeData.userId,
        name: themeData.name,
        isPublic: themeData.isPublic,
        colors: themeData.colors,
        fonts: themeData.fonts,
        radii: themeData.radii ?? {
          small: '0.25rem',
          medium: '0.5rem', 
          large: '0.75rem'
        },
        spacing: themeData.spacing,
        shadows: themeData.shadows,
        preview: themeData.preview ?? {
          primary: themeData.colors.primary,
          secondary: themeData.colors.secondary,
          background: themeData.colors.background,
          border: themeData.colors.border,
          accent: themeData.colors.accent,
          text: themeData.colors.text,
          textOnAccent: themeData.colors.textOnAccent
        },
        createdAt: themeData.createdAt ?? new Date(),
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: theme.id,
        set: {
          name: themeData.name,
          isPublic: themeData.isPublic,
          colors: themeData.colors,
          fonts: themeData.fonts,
          radii: themeData.radii,
          spacing: themeData.spacing,
          shadows: themeData.shadows,
          preview: themeData.preview,
          updatedAt: new Date()
        }
      })
      .returning();

    if (!result[0]) throw new Error("Failed to save theme");
    return result[0];
  }

  async deleteTheme(id: string): Promise<void> {
    await db.delete(theme).where(eq(theme.id, id));
  }

async cloneTheme(originalThemeId: string, userId: string, newName: string) {
  const originalTheme = await this.getThemeById(originalThemeId);
  if (!originalTheme) {
    throw new Error("Original theme not found");
  }

  const clonedTheme:any = {
    ...originalTheme,
    id: crypto.randomUUID(),
    userId,
    name: newName,
    isPublic: false, 
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return this.saveTheme(clonedTheme);
}

}
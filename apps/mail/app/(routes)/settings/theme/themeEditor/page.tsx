'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { X, Save, Palette, Type, Moon, Radius, Space } from 'lucide-react';
import ColorPicker  from '@/components/ui/color-picker';
import { Theme } from '@/types/theme';
import { GoogleFontSelector } from './google-font-selector';

interface ThemeEditorProps {
  initialTheme?: Theme;
  onSave: (theme: Theme) => void;
  onDelete?: () => void;
}

export function ThemeEditor({ 
  initialTheme, 
  onSave,
  onDelete 
}: ThemeEditorProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme || getDefaultTheme());
  const [fontSearch, setFontSearch] = useState('');

  function getDefaultTheme(): Theme {
    return {
      id: '',
      name: 'New Theme',
      isPublic: false,
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
        textOnAccent: '#ffffff',
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Inter',
      },
      radii: {
        small: '0.25rem',
        medium: '0.5rem',
        large: '0.75rem',
      },
      spacing: {
        small: '0.5rem',
        medium: '1rem',
        large: '1.5rem',
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      preview: {
        primary: '#3b82f6',
        secondary: '#64748b',
        background: '#ffffff',
        border: '#e2e8f0',
        accent: '#f43f5e',
        text: '#020817',
        textOnAccent: '#ffffff'
      }
    };
  }

  const updatePreview = () => {
    setTheme(prev => ({
      ...prev,
      preview: {
        primary: prev.colors.primary,
        secondary: prev.colors.secondary,
        background: prev.colors.background,
        border: prev.colors.border,
        accent: prev.colors.accent,
        text: prev.colors.text,
        textOnAccent: prev.colors.textOnAccent
      }
    }));
  };

  useEffect(() => {
    updatePreview();
  }, [theme.colors]);

  const handleSave = () => {
    onSave(theme);
    toast.success('Theme saved successfully!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="theme-name">Theme Name</Label>
          <Input
            id="theme-name"
            value={theme.name}
            onChange={(e) => setTheme({...theme, name: e.target.value})}
          />
        </div>

        {/* Color Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(theme.colors).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label>{key.split(/(?=[A-Z])/).join(' ')}</Label>
              <ColorPicker
                color={value}
                onChange={(color) => setTheme(prev => ({
                  ...prev,
                  colors: {
                    ...prev.colors,
                    [key]: color
                  }
                }))}
              />
            </div>
          ))}
        </div>

        {/* Font Controls */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Type className="h-4 w-4" /> Typography
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Font</Label>
              <GoogleFontSelector
                value={theme.fonts.primary}
                onChange={(font) => setTheme({
                  ...theme,
                  fonts: {...theme.fonts, primary: font}
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary Font</Label>
              <GoogleFontSelector
                value={theme.fonts.secondary}
                onChange={(font) => setTheme({
                  ...theme,
                  fonts: {...theme.fonts, secondary: font}
                })}
              />
            </div>
          </div>
        </div>

        {/* Spacing & Radius */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Space className="h-4 w-4" /> Spacing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(theme.spacing).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key} spacing</Label>
                <Slider
                  value={[parseFloat(value.replace('rem', '')) * 16]}
                  min={4}
                  max={32}
                  step={1}
                  onValueChange={([value]:[number]) => setTheme({
                    ...theme,
                    spacing: {
                      ...theme.spacing,
                      [key]: `${value/16}rem`
                    }
                  })}
                />
                <span className="text-xs text-muted-foreground">
                  {value} ({parseFloat(value.replace('rem', '')) * 16}px)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Radius className="h-4 w-4" /> Border Radius
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(theme.radii).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key} radius</Label>
                <Slider
                  value={[parseFloat(value.replace('rem', '')) * 16]}
                  min={0}
                  max={24}
                  step={1}
                  onValueChange={([value]:[number]) => setTheme({
                    ...theme,
                    radii: {
                      ...theme.radii,
                      [key]: `${value/16}rem`
                    }
                  })}
                />
                <span className="text-xs text-muted-foreground">
                  {value} ({parseFloat(value.replace('rem', '')) * 16}px)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shadows */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Moon className="h-4 w-4" /> Shadows
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(theme.shadows).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key} shadow</Label>
                <Input
                  value={value}
                  onChange={(e) => setTheme({
                    ...theme,
                    shadows: {
                      ...theme.shadows,
                      [key]: e.target.value
                    }
                  })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="space-y-4">
        <h3 className="font-medium">Preview</h3>
        <div 
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.border,
            fontFamily: theme.fonts.primary,
            '--radius-sm': theme.radii.small,
            '--radius-md': theme.radii.medium,
            '--radius-lg': theme.radii.large,
            '--space-sm': theme.spacing.small,
            '--space-md': theme.spacing.medium,
            '--space-lg': theme.spacing.large,
            '--shadow-sm': theme.shadows.sm,
            '--shadow-md': theme.shadows.md,
            '--shadow-lg': theme.shadows.lg,
          } as React.CSSProperties}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.textOnPrimary,
                  borderRadius: `var(--radius-md)`,
                  padding: `var(--space-sm) var(--space-md)`,
                  boxShadow: `var(--shadow-sm)`
                }}
              >
                Primary Button
              </Button>
              <Button 
                variant="outline"
                style={{
                  borderRadius: `var(--radius-md)`,
                  padding: `var(--space-sm) var(--space-md)`,
                  boxShadow: `var(--shadow-sm)`
                }}
              >
                Secondary
              </Button>
            </div>

            <div 
              className="p-4 rounded-md"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.textOnAccent,
                borderRadius: `var(--radius-sm)`,
                boxShadow: `var(--shadow-md)`
              }}
            >
              <p>Accent Panel</p>
            </div>

            <div className="space-y-2">
              <h4 style={{ color: theme.colors.text }}>Card Example</h4>
              <div 
                className="p-4 border rounded-lg"
                style={{
                  borderRadius: `var(--radius-md)`,
                  boxShadow: `var(--shadow-lg)`,
                  padding: `var(--space-md)`
                }}
              >
                <p style={{ color: theme.colors.textSecondary }}>
                  This card demonstrates spacing, radius, and shadows
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="public-theme"
              checked={theme.isPublic}
              onChange={(e) => setTheme({...theme, isPublic: e.target.checked})}
            />
            <Label htmlFor="public-theme">Make this theme public</Label>
          </div>
          <div className="flex gap-2">
            {onDelete && (
              <Button
                variant="destructive"
                onClick={onDelete}
              >
                <X className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Theme
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
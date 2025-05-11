// app/(dashboard)/settings/themes/page.tsx
'use client';

import { ThemeEditor } from './themeEditor/page';
import { ThemeMarketplace } from './marketplace/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Theme } from '@/types/theme';
import { Button } from '@/components/ui/button';

export default function ThemeSettingsPage() {
  const [activeTab, setActiveTab] = useState('my-themes');
  const [editingTheme, setEditingTheme] = useState<Theme | undefined>(undefined);
  const [userThemes, setUserThemes] = useState<Theme[]>([]);

  const handleCreateNew = () => {
    setEditingTheme(undefined);
    setActiveTab('editor');
  };

  const handleSaveTheme = async (theme: Theme): Promise<void> => {
    // Save to API
    const response = await fetch('/api/themes', {
      method: theme.id ? 'PUT' : 'POST',
      body: JSON.stringify(theme)
    });
    const savedTheme = await response.json();
    
    // Update local state
    if (theme.id) {
      setUserThemes(userThemes.map(t => t.id === theme.id ? savedTheme : t));
    } else {
      setUserThemes([...userThemes, savedTheme]);
    }
    setActiveTab('my-themes');
  };

  const handleDeleteTheme = async (themeId:string) => {
    await fetch(`/api/themes/${themeId}`, { method: 'DELETE' });
    setUserThemes(userThemes.filter(t => t.id !== themeId));
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-themes">My Themes</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="editor">
            {editingTheme ? 'Edit Theme' : 'Create Theme'}
          </TabsTrigger>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Theme
          </Button>
        </TabsList>

        <TabsContent value="my-themes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userThemes.map(theme => (
              <div 
                key={theme.id} 
                className="border rounded-lg p-4 hover:shadow-md cursor-pointer"
                onClick={() => {
                  setEditingTheme(theme);
                  setActiveTab('editor');
                }}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{theme.name}</h3>
                  {theme.isPublic && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Public
                    </span>
                  )}
                </div>
                <div className="mt-2 h-20 rounded" style={{ 
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <div className="flex p-2 gap-1">
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ background: theme.colors.primary }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ background: theme.colors.accent }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="marketplace">
          <ThemeMarketplace />
        </TabsContent>

        <TabsContent value="editor">
          {activeTab === 'editor' && (
            <ThemeEditor
              initialTheme={editingTheme}
              onSave={handleSaveTheme}
              onDelete={editingTheme ? () => handleDeleteTheme(editingTheme.id) : undefined}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
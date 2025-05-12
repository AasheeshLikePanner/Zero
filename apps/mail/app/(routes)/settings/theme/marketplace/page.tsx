'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Search, Download } from 'lucide-react';
import type { Theme } from '@/types/theme';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function ThemeMarketplace() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { setTheme } = useTheme();
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [themeName, setThemeName] = useState('My Theme');
  const [isCloning, setIsCloning] = useState(false);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch('/api/theme?public=true');
        if (!response.ok) throw new Error('Failed to load themes');
        
        const data = await response.json();
        setThemes(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error('Failed to load themes');
        setThemes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchThemes();
  }, []);

  const handleImportClick = (themeId: string) => {
    setSelectedThemeId(themeId);
    const originalTheme = themes.find(t => t.id === themeId);
    setThemeName(originalTheme ? `Copy of ${originalTheme.name}` : 'My Theme');
    setCloneDialogOpen(true);
  };

  const handleCloneTheme = async () => {
    if (!selectedThemeId) return;
    if (!themeName.trim()) {
      toast.error('Theme name is required');
      return;
    }

    setIsCloning(true);
    try {
      const response = await fetch('/api/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalThemeId: selectedThemeId,
          newName: themeName
        })
      });

      if (!response.ok) throw new Error('Failed to clone theme');
      
      const newTheme = await response.json();
      toast.success('Theme cloned successfully!');
      setCloneDialogOpen(false);
      return newTheme;
    } catch (error) {
      toast.error('Failed to clone theme');
      console.error('Clone error:', error);
    } finally {
      setIsCloning(false);
    }
  };

  const filteredThemes = themes.filter((theme) => {
    const matchesName = theme.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAuthor = (theme.userId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesName || matchesAuthor;
  });

  return (
    <div className="space-y-6">
      {/* Clone Theme Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Theme</DialogTitle>
            <DialogDescription>
              Choose a name for your cloned theme
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                className="col-span-3"
                placeholder="Enter theme name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleCloneTheme}
              disabled={isCloning}
            >
              {isCloning ? 'Cloning...' : 'Clone Theme'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search themes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Theme Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {filteredThemes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'No themes match your search' : 'No public themes available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredThemes.map((theme) => (
                <Card key={theme.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-0">
                    <div
                      className="h-32 rounded-t-lg"
                      style={{
                        background: theme.preview?.background || '#ffffff',
                        borderBottom: `1px solid ${theme.preview?.border || '#e2e8f0'}`
                      }}
                    >
                      <div className="p-3 flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-full"
                          style={{ background: theme.preview?.primary || '#3b82f6' }}
                        />
                        <div
                          className="h-2 w-20 rounded-full"
                          style={{ background: theme.preview?.secondary || '#64748b' }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-medium">{theme.name}</h3>
                    <p className="text-sm text-muted-foreground">{theme.userId || 'Unknown author'}</p>
                    {theme.tags?.length ? (
                      <div className="flex gap-1 mt-2">
                        {theme.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              background: theme.preview?.accent || '#f43f5e',
                              color: theme.preview?.textOnAccent || '#ffffff'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleImportClick(theme.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Import Theme
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
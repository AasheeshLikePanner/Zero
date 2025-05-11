// components/theme/theme-marketplace.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Search, Palette, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Theme } from '@/types/theme';

export function ThemeMarketplace() {
    const [themes, setThemes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { setTheme } = useTheme();

    useEffect(() => {
        const fetchThemes = async () => {
            try {
                const response = await fetch('/api/themes?public=true');
                const data = await response.json();
                setThemes(data);
            } catch (error) {
                toast.error('Failed to load themes');
            } finally {
                setIsLoading(false);
            }
        };
        fetchThemes();
    }, []);

    const handleImportTheme = async (themeId: string): Promise<Theme | void> => {
        try {
            const response = await fetch(`/api/themes/${themeId}/clone`, {
                method: 'POST'
            });
            const newTheme: Theme = await response.json();
            toast.success('Theme imported successfully!');
            return newTheme;
        } catch (error) {
            toast.error('Failed to import theme');
        }
    };

    const filteredThemes = themes.filter((theme: Theme) =>
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (theme.author?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
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

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-[200px] rounded-lg" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredThemes.map((theme: any) => (
                        <Card key={theme.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="p-0">
                                <div
                                    className="h-32 rounded-t-lg"
                                    style={{
                                        background: theme.preview.background,
                                        borderBottom: `1px solid ${theme.preview.border}`
                                    }}
                                >
                                    <div className="p-3 flex items-center gap-2">
                                        <div
                                            className="h-8 w-8 rounded-full"
                                            style={{ background: theme.preview.primary }}
                                        />
                                        <div
                                            className="h-2 w-20 rounded-full"
                                            style={{ background: theme.preview.secondary }}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <h3 className="font-medium">{theme.name}</h3>
                                <p className="text-sm text-muted-foreground">{theme.author}</p>
                                <div className="flex gap-1 mt-2">
                                    {theme.tags.map((tag: any) => (
                                        <span
                                            key={tag}
                                            className="text-xs px-2 py-1 rounded-full"
                                            style={{
                                                background: theme.preview.accent,
                                                color: theme.preview.textOnAccent
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleImportTheme(theme.id)}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Import Theme
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
import { NextResponse } from 'next/server';
import { ThemeService } from './service';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export const GET =  async (request: Request) => {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';
    
    const service = new ThemeService();
    const themes = isPublic 
      ? await service.repository.getPublicThemes()
      : await service.repository.getUserThemes(session.user.id);
    
    return NextResponse.json(themes);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}

export const POST = async (request: Request) => {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const service = new ThemeService();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Theme name is required' },
        { status: 400 }
      );
    }

    const theme = await service.createTheme(
      session.user.id,
      body.name,
      {
        colors: body.colors,
        fonts: body.fonts,
        radii: body.radii,
        spacing: body.spacing,
        shadows: body.shadows
      },
      body.isPublic ?? false
    );
    
    return NextResponse.json(theme);
  } catch (error) {
    console.error('Error creating theme:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create theme' },
      { status: 500 }
    );
  }
}

export const PUT = async (request: Request) => {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const service = new ThemeService();
    
    // Validate required fields
    if (!body.originalThemeId || !body.newName) {
      return NextResponse.json(
        { error: 'Original theme ID and new name are required' },
        { status: 400 }
      );
    }

    const clonedTheme = await service.cloneTheme(
      body.originalThemeId,
      session.user.id,
      body.newName
    );
    
    return NextResponse.json(clonedTheme);
  } catch (error) {
    console.error('Error cloning theme:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clone theme' },
      { status: 500 }
    );
  }
}
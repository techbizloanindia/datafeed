import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '@/lib/googleAuth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
    }
    
    // Exchange the code for tokens
    const tokens = await getTokens(code);
    
    // Store tokens in cookies (secure in production)
    const cookieStore = cookies();
    
    // Store access token (short-lived)
    cookieStore.set('google_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expiry_date ? (tokens.expiry_date - Date.now()) / 1000 : 3600,
      path: '/',
    });
    
    // Store refresh token (long-lived) if available
    if (tokens.refresh_token) {
      cookieStore.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }
    
    // Redirect to dashboard after successful authentication
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    return NextResponse.json({ error: 'Failed to complete OAuth flow' }, { status: 500 });
  }
} 
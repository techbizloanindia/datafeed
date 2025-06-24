import { NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/googleAuth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('google_refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token available' }, { status: 401 });
    }
    
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    // Request new tokens
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update cookies with new tokens
    if (credentials.access_token) {
      cookieStore.set('google_access_token', credentials.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: credentials.expiry_date ? (credentials.expiry_date - Date.now()) / 1000 : 3600,
        path: '/',
      });
    }
    
    // Update refresh token if a new one was provided
    if (credentials.refresh_token) {
      cookieStore.set('google_refresh_token', credentials.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
} 
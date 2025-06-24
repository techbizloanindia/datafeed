import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/googleAuth';

export async function GET() {
  try {
    // Generate the authorization URL
    const authUrl = getAuthUrl();
    
    // Redirect the user to Google's OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating OAuth flow:', error);
    return NextResponse.json({ error: 'Failed to initiate OAuth flow' }, { status: 500 });
  }
} 
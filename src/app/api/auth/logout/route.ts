import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    
    // Clear authentication cookies
    cookieStore.delete('google_access_token');
    cookieStore.delete('google_refresh_token');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
} 
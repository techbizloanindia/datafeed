import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyGoogleSheetsConnection } from '@/lib/googleSheets';

export async function GET() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;
    
    // Check if auth tokens exist
    const authenticated = !!(accessToken || refreshToken);
    
    // Verify Google Sheets connection if authenticated
    let sheetsConnection = null;
    if (authenticated) {
      sheetsConnection = await verifyGoogleSheetsConnection();
    }
    
    return NextResponse.json({
      authenticated,
      sheetsConnection,
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return NextResponse.json(
      { 
        authenticated: false, 
        error: 'Failed to check authentication status',
        lastChecked: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
} 
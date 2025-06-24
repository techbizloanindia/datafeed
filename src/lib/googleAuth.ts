import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// OAuth 2.0 client configuration
const CLIENT_ID = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '';
const CLIENT_SECRET = process.env.GOOGLE_SHEETS_PRIVATE_KEY || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

// Define scopes for Google Sheets access
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

// Create OAuth2 client
export const getOAuth2Client = (): OAuth2Client => {
  return new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
};

// Generate authorization URL
export const getAuthUrl = (): string => {
  const oauth2Client = getOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required for refresh token
    scope: SCOPES,
    prompt: 'consent', // Force to show the consent screen
  });
};

// Exchange authorization code for tokens
export const getTokens = async (code: string) => {
  const oauth2Client = getOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
};

// Set tokens to OAuth2 client
export const setCredentials = (oauth2Client: OAuth2Client, tokens: any) => {
  oauth2Client.setCredentials(tokens);
};

// Get authenticated Google Sheets client
export const getAuthorizedSheetsClient = async (tokens: any) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  
  return google.sheets({ version: 'v4', auth: oauth2Client });
}; 
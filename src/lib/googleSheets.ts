import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { getOAuth2Client } from './googleAuth';

// Initialize Google Sheets API with OAuth
export const getGoogleSheetsClient = async () => {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;
    
    if (!accessToken && !refreshToken) {
      throw new Error('No authentication tokens available');
    }
    
    const oauth2Client = getOAuth2Client();
    
    // Set credentials from cookies
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    
    return google.sheets({ version: 'v4', auth: oauth2Client });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets client');
  }
};

// Fallback to API key if OAuth is not available
export const getGoogleSheetsClientWithApiKey = () => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google API key is missing');
    }

    return google.sheets({ 
      version: 'v4', 
      auth: apiKey
    });
  } catch (error) {
    console.error('Error initializing Google Sheets client with API key:', error);
    throw new Error('Failed to initialize Google Sheets client with API key');
  }
};

// Fetch data from Google Sheets
export const fetchSheetData = async (sheetId: string, range: string) => {
  try {
    // Try OAuth first
    let sheets;
    try {
      sheets = await getGoogleSheetsClient();
    } catch (oauthError) {
      console.warn('OAuth authentication failed, falling back to API key:', oauthError);
      sheets = getGoogleSheetsClientWithApiKey();
    }
    
    // Add cache-busting parameter to range if not already present
    const rangeParts = range.split('?');
    const baseRange = rangeParts[0];
    const queryParams = rangeParts.length > 1 ? rangeParts[1] : '';
    
    // Add timestamp for cache busting if not already present
    const timestamp = new Date().getTime();
    const cacheParam = queryParams.includes('t=') ? queryParams : 
      queryParams ? `${queryParams}&t=${timestamp}` : `t=${timestamp}`;
    
    const fullRange = `${baseRange}?${cacheParam}`;
    
    console.log(`Fetching fresh data from Google Sheets: ${sheetId}, range: ${baseRange}`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: baseRange,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the spreadsheet');
    }

    // Convert to array of objects with headers as keys
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return data;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
};

// Helper function to calculate achievement percentage
export const calculateAchievement = (actual: number, target: number) => {
  return target > 0 ? Math.round((actual / target) * 100 * 10) / 10 : 0;
};

// The ID of the spreadsheet
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1WMx7sPEnkV-ZmvrCOFdhmvFAfXg8kWqZlL5OSgSXQ0Q';

// Generic function to fetch data from any sheet in the spreadsheet
export async function getGoogleSheetsData(sheetName: string) {
  try {
    // Try OAuth first
    let sheets;
    try {
      sheets = await getGoogleSheetsClient();
    } catch (oauthError) {
      console.warn('OAuth authentication failed, falling back to API key:', oauthError);
      sheets = getGoogleSheetsClientWithApiKey();
    }

    // Get spreadsheet info to find available sheets
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    if (!spreadsheetResponse.data.sheets || spreadsheetResponse.data.sheets.length === 0) {
      throw new Error('No sheets found in the spreadsheet');
    }

    // Find the requested sheet
    const targetSheet = spreadsheetResponse.data.sheets.find(
      sheet => sheet.properties?.title?.toLowerCase() === sheetName.toLowerCase()
    );
    
    // If the requested sheet doesn't exist, try to use the first sheet
    const actualSheetName = targetSheet 
      ? targetSheet.properties?.title 
      : spreadsheetResponse.data.sheets[0].properties?.title;
    
    if (!actualSheetName) {
      throw new Error('Could not determine sheet name');
    }

    console.log(`Using sheet name: ${actualSheetName}`);

    // Get the values using the correct sheet name
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${actualSheetName}!A1:Z1000`, // Use the actual sheet name
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the spreadsheet');
    }

    return rows;
  } catch (error: any) {
    console.error(`Error fetching data from Google Sheets (${sheetName}):`, error);
    throw new Error(`Failed to fetch data from Google Sheets: ${error.message}`);
  }
}

// Function to fetch data from Google Sheets
export async function fetchBranchTargetLeadsData() {
  try {
    // Try OAuth first
    let sheets;
    try {
      sheets = await getGoogleSheetsClient();
    } catch (oauthError) {
      console.warn('OAuth authentication failed, falling back to API key:', oauthError);
      sheets = getGoogleSheetsClientWithApiKey();
    }

    // First, get the sheet names to find the correct one
    try {
      // Get spreadsheet info to find available sheets
      const spreadsheetResponse = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
      });

      if (!spreadsheetResponse.data.sheets || spreadsheetResponse.data.sheets.length === 0) {
        return { error: 'No sheets found in the spreadsheet' };
      }

      // Get the first sheet's name if available
      const firstSheetName = spreadsheetResponse.data.sheets[0].properties?.title;
      
      if (!firstSheetName) {
        return { error: 'Could not determine sheet name' };
      }

      console.log(`Using sheet name: ${firstSheetName}`);

      // Now get the values using the correct sheet name
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${firstSheetName}!A1:Z1000`, // Use the actual sheet name
      });

      const rows = response.data.values;
      
      if (!rows || rows.length === 0) {
        return { error: 'No data found in the spreadsheet' };
      }

      // Log the first few rows for debugging
      console.log('First row (headers):', rows[0]);
      if (rows.length > 1) {
        console.log('Second row (first data row):', rows[1]);
      }

      // Extract headers and data
      const headers = rows[0];
      
      // Define column name mappings from the actual Google Sheet headers to our expected field names
      const columnMappings = {
        'Date': 'date',
        'Branch': 'branch',
        'Branch Open Date': 'branchOpenDate',
        'No of Months operational': 'monthsOperational',
        'Cluster': 'cluster',
        'Daily Target Leads': 'dailyTargetLeads',
        'Daily Actual Leads': 'dailyActualLeads',
        'Variance': 'variance',
        'Variance %': 'variancePercentage',
        'MTD Target Leads': 'mtdTargetLeads',
        'MTD Actual Leads': 'mtdActualLeads',
        'MTD Variance': 'mtdVariance',
        'MTD Variance %': 'mtdVariancePercentage'
      };

      // Map the data using our column mappings
      const data = rows.slice(1).map((row: any[]) => {
        const item: Record<string, any> = {};
        
        headers.forEach((header: string, index: number) => {
          // Get the mapped field name or use the original header if no mapping exists
          const fieldName = columnMappings[header] || header;
          
          // Get value or empty string if undefined
          const value = index < row.length ? row[index] : '';
          
          // Handle special cases for percentage values that include % sign
          if (typeof value === 'string' && value.includes('%')) {
            item[fieldName] = parseFloat(value.replace('%', ''));
          }
          // Convert numeric strings to numbers where appropriate
          else if (value === '') {
            item[fieldName] = 0; // Default to 0 for empty numeric fields
          } else if (/^-?\d+(\.\d+)?$/.test(value)) {
            item[fieldName] = parseFloat(value);
          } else {
            item[fieldName] = value;
          }
        });
        
        return item;
      });

      return { data };
    } catch (apiError: any) {
      console.error('Google Sheets API error:', apiError.message);
      
      // Check if this is a permission error
      if (apiError.code === 403) {
        return { 
          error: 'Permission denied. Make sure the Google Sheet is publicly accessible or shared with the service account.',
          details: `To fix this issue: Open the Google Sheet, click "Share" in the top-right corner, and set access to "Anyone with the link" can view.`
        };
      }
      
      // Handle "Unable to parse range" error which indicates sheet name issue
      if (apiError.message && apiError.message.includes('Unable to parse range')) {
        return { 
          error: 'Sheet name error. The sheet name in the spreadsheet might be different.',
          details: `To fix this issue: Check that the Google Sheet contains the correct sheet or update the code to use the correct sheet name.`
        };
      }
      
      return { error: `API error: ${apiError.message}` };
    }
  } catch (error: any) {
    console.error('Error fetching data from Google Sheets:', error);
    return { error: 'Failed to fetch data from Google Sheets', details: error.message };
  }
}

//  function to proces branch target leads 

// Function to process branch target leads data into the format needed by the UI
export function processBranchTargetLeadsData(rawData: any[]) {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }

  // Filter out rows with empty branch names (likely empty rows in the sheet)
  const validData = rawData.filter(row => row.branch && row.branch.trim() !== '');

  return validData.map(row => {
    // Ensure numeric values are treated as numbers
    const dailyTargetLeads = typeof row.dailyTargetLeads === 'number' ? row.dailyTargetLeads : 
                            parseFloat(row.dailyTargetLeads) || 0;
    const dailyActualLeads = typeof row.dailyActualLeads === 'number' ? row.dailyActualLeads : 
                            parseFloat(row.dailyActualLeads) || 0;
    const mtdTargetLeads = typeof row.mtdTargetLeads === 'number' ? row.mtdTargetLeads : 
                          parseFloat(row.mtdTargetLeads) || 0;
    const mtdActualLeads = typeof row.mtdActualLeads === 'number' ? row.mtdActualLeads : 
                          parseFloat(row.mtdActualLeads) || 0;
    
    // If variance is already calculated in the sheet, use it; otherwise calculate it
    let dailyVariance = row.variance;
    if (typeof dailyVariance !== 'number') {
      dailyVariance = dailyActualLeads - dailyTargetLeads;
    }
    
    // Same for variance percentage
    let dailyVariancePercentage = row.variancePercentage;
    if (typeof dailyVariancePercentage !== 'number') {
      dailyVariancePercentage = dailyTargetLeads ? 
        Number(((dailyVariance / dailyTargetLeads) * 100).toFixed(1)) : 0;
    }
    
    // Same approach for MTD values
    let mtdVariance = row.mtdVariance;
    if (typeof mtdVariance !== 'number') {
      mtdVariance = mtdActualLeads - mtdTargetLeads;
    }
    
    let mtdVariancePercentage = row.mtdVariancePercentage;
    if (typeof mtdVariancePercentage !== 'number') {
      mtdVariancePercentage = mtdTargetLeads ? 
        Number(((mtdVariance / mtdTargetLeads) * 100).toFixed(1)) : 0;
    }
    
    return {
      date: row.date || '',
      branch: row.branch || '',
      branchOpenDate: row.branchOpenDate || '',
      monthsOperational: typeof row.monthsOperational === 'number' ? row.monthsOperational : 
                        row.monthsOperational || 0,
      cluster: row.cluster || '',
      dailyTargetLeads,
      dailyActualLeads,
      variance: dailyVariance,
      variancePercentage: dailyVariancePercentage,
      mtdTargetLeads,
      mtdActualLeads,
      mtdVariance,
      mtdVariancePercentage
    };
  });
}

// Function to fetch data with role-based filtering
export async function fetchSheetDataWithRoleFilter(
  sheetName: string,
  roleFilter?: { role: string; cluster?: string; branch?: string }
) {
  try {
    // Try OAuth first
    let sheets;
    try {
      sheets = await getGoogleSheetsClient();
    } catch (oauthError) {
      console.warn('OAuth authentication failed, falling back to API key:', oauthError);
      sheets = getGoogleSheetsClientWithApiKey();
    }

    // Verify the spreadsheet ID from environment variables
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      throw new Error('Google Sheets Spreadsheet ID is missing in environment variables');
    }

    // Get spreadsheet info to find available sheets
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId
    });

    if (!spreadsheetResponse.data.sheets || spreadsheetResponse.data.sheets.length === 0) {
      throw new Error('No sheets found in the spreadsheet');
    }

    // Find the requested sheet
    const targetSheet = spreadsheetResponse.data.sheets.find(
      sheet => sheet.properties?.title?.toLowerCase() === sheetName.toLowerCase()
    );
    
    // If the requested sheet doesn't exist, try to use the first sheet
    const actualSheetName = targetSheet 
      ? targetSheet.properties?.title 
      : spreadsheetResponse.data.sheets[0].properties?.title;
    
    if (!actualSheetName) {
      throw new Error('Could not determine sheet name');
    }

    console.log(`Using sheet name: ${actualSheetName}`);

    // Get the values using the correct sheet name
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${actualSheetName}!A1:Z1000`, // Use the actual sheet name
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the spreadsheet');
    }

    // Convert to array of objects with headers as keys
    const headers = rows[0];
    let data = rows.slice(1).map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        const value = index < row.length ? row[index] : '';
        
        // Convert numeric strings to numbers
        if (value === '') {
          obj[header] = '';
        } else if (/^-?\d+(\.\d+)?$/.test(value)) {
          obj[header] = parseFloat(value);
        } else if (typeof value === 'string' && value.includes('%')) {
          obj[header] = parseFloat(value.replace('%', ''));
        } else {
          obj[header] = value;
        }
      });
      return obj;
    });

    // Apply role-based filtering if provided
    if (roleFilter) {
      if (roleFilter.role === 'Branch Level' && roleFilter.branch) {
        // Branch level users can only see their branch data
        data = data.filter(item => 
          item['Branch'] === roleFilter.branch || 
          item['branch'] === roleFilter.branch || 
          item['branchName'] === roleFilter.branch
        );
      } else if (roleFilter.role === 'Cluster Level' && roleFilter.cluster) {
        // Cluster level users can see all branches in their cluster
        data = data.filter(item => 
          item['Cluster'] === roleFilter.cluster || 
          item['cluster'] === roleFilter.cluster
        );
      }
      // CEO level users can see all data, so no filtering needed
    }

    return { data, lastUpdated: new Date().toISOString() };
  } catch (error: any) {
    console.error(`Error fetching data from Google Sheets (${sheetName}):`, error);
    throw new Error(`Failed to fetch data from Google Sheets: ${error.message}`);
  }
}

// Function to verify Google Sheets connection and environment variables
export async function verifyGoogleSheetsConnection() {
  try {
    // Check if required environment variables are set
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    const missingVars = [];
    if (!clientEmail) missingVars.push('GOOGLE_SHEETS_CLIENT_EMAIL');
    if (!privateKey) missingVars.push('GOOGLE_SHEETS_PRIVATE_KEY');
    if (!spreadsheetId) missingVars.push('GOOGLE_SHEETS_SPREADSHEET_ID');
    if (!apiKey) missingVars.push('NEXT_PUBLIC_GOOGLE_API_KEY');
    
    if (missingVars.length > 0) {
      return {
        success: false,
        message: `Missing environment variables: ${missingVars.join(', ')}`
      };
    }
    
    // Try to connect to Google Sheets
    let sheets;
    try {
      sheets = await getGoogleSheetsClient();
    } catch (oauthError) {
      console.warn('OAuth authentication failed, falling back to API key');
      sheets = getGoogleSheetsClientWithApiKey();
    }
    
    // Test connection by getting spreadsheet metadata
    const response = await sheets.spreadsheets.get({
      spreadsheetId
    });
    
    if (response.status === 200) {
      return {
        success: true,
        message: 'Successfully connected to Google Sheets',
        sheetNames: response.data.sheets?.map(sheet => sheet.properties?.title) || []
      };
    } else {
      return {
        success: false,
        message: `Connection test failed with status: ${response.status}`
      };
    }
  } catch (error: any) {
    console.error('Error verifying Google Sheets connection:', error);
    return {
      success: false,
      message: `Connection failed: ${error.message}`
    };
  }
} 
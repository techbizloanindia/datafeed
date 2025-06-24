import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// The ID of the spreadsheet
const SPREADSHEET_ID = '1WMx7sPEnkV-ZmvrCOFdhmvFAfXg8kWqZlL5OSgSXQ0Q';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const cluster = url.searchParams.get('cluster') || '';
    const branch = url.searchParams.get('branch') || '';
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('Google API key is missing');
      return NextResponse.json({ 
        error: 'API key configuration is missing' 
      }, { status: 500 });
    }

    const sheets = google.sheets({ 
      version: 'v4', 
      auth: apiKey
    });

    try {
      // First, get the spreadsheet info to get all sheets
      const spreadsheetResponse = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
      });

      if (!spreadsheetResponse.data.sheets || spreadsheetResponse.data.sheets.length === 0) {
        return NextResponse.json({ 
          error: 'No sheets found in the spreadsheet',
          sheets: [],
          data: {}
        }, { status: 404 });
      }

      // Get all sheet names and IDs
      const sheetsInfo = spreadsheetResponse.data.sheets
        .filter(sheet => sheet.properties?.title && sheet.properties?.sheetId)
        .map(sheet => ({
          title: sheet.properties?.title || '',
          sheetId: sheet.properties?.sheetId || 0
        }));

      if (sheetsInfo.length === 0) {
        return NextResponse.json({ 
          error: 'No valid sheets found in the spreadsheet',
          sheets: [],
          data: {}
        }, { status: 404 });
      }

      console.log('Available sheets:', sheetsInfo);

      // Fetch data from all sheets
      const allSheetsData: Record<string, any> = {};
      
      for (const sheetInfo of sheetsInfo) {
        const sheetName = sheetInfo.title;
        
        try {
          // Get data from the sheet
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A1:Z1000`,
          });

          const rows = response.data.values;
          
          if (!rows || rows.length === 0) {
            console.log(`No data found in sheet: ${sheetName}`);
            allSheetsData[sheetName] = {
              headers: [],
              data: []
            };
            continue;
          }

          // Extract headers and data
          const headers = rows[0].map(header => String(header).trim());
          
          // Map the data
          const data = rows.slice(1)
            .filter(row => row.length > 0)
            .map((row) => {
              const item: Record<string, any> = {};
              
              headers.forEach((header, index) => {
                // Handle missing values
                const value = index < row.length ? row[index] : '';
                
                // Handle special cases for percentage values
                if (typeof value === 'string' && value.includes('%')) {
                  item[header] = parseFloat(value.replace('%', ''));
                }
                // Convert numeric strings to numbers where appropriate
                else if (value === '') {
                  item[header] = 0;
                } else if (/^-?\d+(\.\d+)?$/.test(String(value))) {
                  item[header] = parseFloat(String(value));
                } else {
                  item[header] = value;
                }
              });
              
              return item;
            });

          allSheetsData[sheetName] = {
            headers,
            data
          };
          
        } catch (sheetError: any) {
          console.error(`Error fetching data from sheet ${sheetName}:`, sheetError);
          allSheetsData[sheetName] = { 
            headers: [],
            data: [],
            error: `Failed to fetch data from sheet: ${sheetName} - ${sheetError.message}` 
          };
        }
      }

      // Define branch clusters for filtering
      const branchClusters: Record<string, string[]> = {
        "Delhi": [
          "North-Alipur",
          "North-Nangloi",
          "North-Pitampura",
          "North-Sonipat"
        ],
        "Faridabad": [
          "North-Badarpur",
          "North-Faridabad",
          "North-Goverdhan",
          "North-Jewar"
        ],
        "Ghaziabad": [
          "North-East Delhi",
          "North-Ghaziabad",
          "North-Hapur",
          "North-Loni",
          "North-Surajpur"
        ],
        "Gurugram": [
          "North-Behror",
          "North-Bhiwadi",
          "North-Gurugram",
          "North-Narnaul",
          "North-Pataudi",
          "North-Rewari",
          "North-Sohna"
        ],
        "Karnataka": [
          "South-Davangere",
          "South-Kanakpura",
          "South-Kengeri",
          "South-Mandya",
          "South-Ramnagar",
          "South-Yelahanka"
        ],
        "Karnal": [
          "North-Karnal",
          "North-Panipat"
        ],
        "Maharashtra": [
          "West-Kalyan"
        ]
      };
      
      // Get all branches as a flat array
      const allBranches = Object.values(branchClusters).flat();
      
      // Apply filters if provided
      if (cluster || branch) {
        console.log(`Filtering data by cluster: ${cluster}, branch: ${branch}`);
        
        for (const sheetName in allSheetsData) {
          if (allSheetsData[sheetName].data && Array.isArray(allSheetsData[sheetName].data)) {
            let filteredData = [...allSheetsData[sheetName].data];
            
            // Check if there's data to filter
            if (filteredData.length === 0) {
              continue;
            }
            
            // Find the branch column name (could be "Branch" or "branch")
            const branchColumnName = Object.keys(filteredData[0]).find(
              key => key.toLowerCase() === 'branch'
            );
            
            // Only filter if we found a branch column
            if (branchColumnName) {
              if (branch) {
                // Filter by specific branch
                filteredData = filteredData.filter(row => {
                  const branchValue = row[branchColumnName];
                  return branchValue === branch;
                });
              } else if (cluster && cluster !== "All Clusters") {
                // Filter by cluster (all branches in the cluster)
                const clusterBranches = branchClusters[cluster] || [];
                  
                filteredData = filteredData.filter(row => {
                  const branchValue = row[branchColumnName];
                  return clusterBranches.includes(branchValue);
                });
              }
              
              allSheetsData[sheetName].data = filteredData;
            }
          }
        }
      }

      // Add cache control headers to the response
      const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      return NextResponse.json({ 
        sheets: sheetsInfo,
        data: allSheetsData,
        filters: {
          cluster,
          branch
        },
        lastUpdated: new Date().toISOString(),
        dataSource: 'real-time'
      }, { headers });
      
    } catch (apiError: any) {
      console.error('Google Sheets API error:', apiError.message);
      
      // Create a fallback response with empty data
      const fallbackResponse = {
        error: `API error: ${apiError.message}`,
        sheets: [],
        data: {},
        filters: {
          cluster,
          branch
        },
        lastUpdated: new Date().toISOString(),
        dataSource: 'sample'
      };
      
      if (apiError.code === 403) {
        fallbackResponse.error = 'Permission denied. Make sure the Google Sheet is publicly accessible. To fix this issue: Open the Google Sheet, click "Share" in the top-right corner, and set access to "Anyone with the link" can view.';
        return NextResponse.json(fallbackResponse, { status: 403 });
      }
      
      return NextResponse.json(fallbackResponse, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error fetching CEO dashboard data:', error);
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    return NextResponse.json({ 
      error: `Failed to fetch CEO dashboard data: ${error.message}`,
      sheets: [],
      data: {},
      filters: {},
      lastUpdated: new Date().toISOString(),
      dataSource: 'sample'
    }, { 
      status: 500,
      headers
    });
  }
} 
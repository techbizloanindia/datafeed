import { NextResponse } from "next/server";
import { fetchSheetDataWithRoleFilter } from "@/lib/googleSheets";
import { cookies } from "next/headers";

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    // Get query parameters for role-based filtering
    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const cluster = url.searchParams.get("cluster");
    const branch = url.searchParams.get("branch");
    
    // Get the sheet name from query params or use default
    const sheetName = url.searchParams.get("sheetName") || "Branch Target Leads";
    
    // Create role filter if parameters are provided
    const roleFilter = role ? {
      role,
      cluster: cluster || undefined,
      branch: branch || undefined
    } : undefined;
    
    console.log(`Fetching real-time branch target leads data at ${new Date().toISOString()}`);
    
    // Fetch data from Google Sheets with role-based filtering
    const { data, lastUpdated } = await fetchSheetDataWithRoleFilter(sheetName, roleFilter);
    
    // Store last updated timestamp in a cookie for client-side access
    cookies().set("last_data_refresh", lastUpdated, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400 // 24 hours
    });
    
    // Generate sample data if no real data is available
    if (!data || data.length === 0) {
      console.log("No real data available, generating sample data");
      const sampleData = generateSampleData();
      return NextResponse.json({ 
        data: sampleData, 
        lastUpdated,
        dataSource: 'sample' 
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
    
    return NextResponse.json({ 
      data, 
      lastUpdated,
      dataSource: 'real-time' 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    
    // Return sample data on error
    const sampleData = generateSampleData();
    return NextResponse.json({ 
      data: sampleData, 
      lastUpdated: new Date().toISOString(),
      dataSource: 'sample',
      error: "Failed to fetch data from Google Sheets"
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}

// Function to generate sample data
function generateSampleData() {
  return [
    { 
      branch: 'Delhi North', 
      cluster: 'Delhi', 
      mtdTargetLeads: 50, 
      mtdActualLeads: 45, 
      mtdVariancePercentage: -10.0 
    },
    { 
      branch: 'Delhi South', 
      cluster: 'Delhi', 
      mtdTargetLeads: 45, 
      mtdActualLeads: 48, 
      mtdVariancePercentage: 6.7 
    },
    { 
      branch: 'Gurugram', 
      cluster: 'Gurugram', 
      mtdTargetLeads: 60, 
      mtdActualLeads: 65, 
      mtdVariancePercentage: 8.3 
    },
    { 
      branch: 'Faridabad', 
      cluster: 'Faridabad', 
      mtdTargetLeads: 40, 
      mtdActualLeads: 38, 
      mtdVariancePercentage: -5.0 
    },
    { 
      branch: 'Bangalore', 
      cluster: 'Karnataka', 
      mtdTargetLeads: 55, 
      mtdActualLeads: 52, 
      mtdVariancePercentage: -5.5 
    }
  ];
}

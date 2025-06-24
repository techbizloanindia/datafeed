import { NextResponse } from 'next/server';
import { fetchSheetData, calculateAchievement } from '@/lib/googleSheets';
import { cookies } from 'next/headers';

// The ID of the spreadsheet
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1WMx7sPEnkV-ZmvrCOFdhmvFAfXg8kWqZlL5OSgSXQ0Q';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    // Check if user is authenticated with Google
    const cookieStore = cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;
    
    // Get query parameters for filtering
    const url = new URL(request.url);
    const region = url.searchParams.get('region') || 'All';
    const branchAge = url.searchParams.get('branchAge') || 'All';
    const timeFrame = url.searchParams.get('timeFrame') || 'MTD';
    const userBranch = url.searchParams.get('branch') || null;
    const userCluster = url.searchParams.get('cluster') || null;
    
    // If not authenticated, try to fetch data anyway but prepare fallback
    let data;
    try {
      // Fetch data from Google Sheets with cache busting
      const timestamp = new Date().getTime();
      data = await fetchSheetData(SPREADSHEET_ID, `Sheet1!A1:AF100?t=${timestamp}`);
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      
      if (!accessToken && !refreshToken) {
        // Return mock data if not authenticated and fetch failed
        return NextResponse.json(getMockData(), {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
      }
      
      throw error; // Re-throw to be caught by the outer catch
    }

    // Apply filters
    let filteredData = [...data];

    // Filter by user's branch or cluster if provided
    if (userBranch) {
      filteredData = filteredData.filter(row => row['Branch Name'] === userBranch);
    } else if (userCluster) {
      filteredData = filteredData.filter(row => row['Cluster Name'] === userCluster);
    }
    // Otherwise apply region filter
    else if (region !== 'All') {
      filteredData = filteredData.filter(row => {
        const clusterName = row['Cluster Name'] || '';
        if (region === 'North') return clusterName.includes('Delhi') || clusterName.includes('Ghaziabad') || clusterName.includes('Gurugram') || clusterName.includes('Faridabad');
        if (region === 'South') return clusterName.includes('Karanatka');
        if (region === 'West') return clusterName.includes('Maharashtra');
        if (region === 'East') return clusterName.includes('East');
        return true;
      });
    }

    if (branchAge !== 'All') {
      filteredData = filteredData.filter(row => {
        const vintage = row['Branch Vintage (Vintage > 6Months, Vintage < 6 Months)'] || '';
        if (branchAge === '0-6M') return vintage === '<6M';
        if (branchAge === '6M+') return vintage === '>6M';
        return true;
      });
    }

    // Sum up values for KPIs
    const totalVisitTarget = filteredData.reduce((sum, row) => sum + Number(row['Visits Target MTD'] || 0), 0);
    const totalVisitActual = filteredData.reduce((sum, row) => sum + Number(row['Visits Actual MTD'] || 0), 0);
    
    // Using LOS Log as completed lead
    const totalLeadTarget = filteredData.reduce((sum, row) => sum + Number(row['LOS Log Target MTD In Nos.'] || 0), 0);
    const totalLeadActual = filteredData.reduce((sum, row) => sum + Number(row['LOS Log Actual MTD In Nos.'] || 0), 0);
    
    const totalCreditLoginTarget = filteredData.reduce((sum, row) => sum + Number(row['Credit Login Target'] || 0), 0);
    const totalCreditLoginActual = filteredData.reduce((sum, row) => sum + Number(row['Credit Login ACH'] || 0), 0);
    
    const totalSanctionTarget = filteredData.reduce((sum, row) => sum + Number(row['Santion Target'] || 0), 0);
    const totalSanctionActual = filteredData.reduce((sum, row) => sum + Number(row['Santion Ach'] || 0), 0);
    
    const totalDisbursementTarget = filteredData.reduce((sum, row) => sum + Number(row['Disbursement Target MTD In Nos.'] || 0), 0);
    const totalDisbursementActual = filteredData.reduce((sum, row) => sum + Number(row['Disbursement Actuals MTD In Nos.'] || 0), 0);

    // Calculate KPIs
    const kpis = {
      salesBuddyLogin: {
        target: totalVisitTarget,
        actual: totalVisitActual,
        achievement: calculateAchievement(totalVisitActual, totalVisitTarget),
      },
      completedLead: {
        target: totalLeadTarget,
        actual: totalLeadActual,
        achievement: calculateAchievement(totalLeadActual, totalLeadTarget),
      },
      creditLogin: {
        target: totalCreditLoginTarget,
        actual: totalCreditLoginActual,
        achievement: calculateAchievement(totalCreditLoginActual, totalCreditLoginTarget),
      },
      casesSanctioned: {
        target: totalSanctionTarget,
        actual: totalSanctionActual,
        achievement: calculateAchievement(totalSanctionActual, totalSanctionTarget),
      },
      casesDisbursed: {
        target: totalDisbursementTarget,
        actual: totalDisbursementActual,
        achievement: calculateAchievement(totalDisbursementActual, totalDisbursementTarget),
      },
    };

    // Group data by cluster for cluster performance
    const clusters = Array.from(new Set(filteredData.map(row => row['Cluster Name']))).filter(Boolean);
    const clusterPerformance = {};

    clusters.forEach(cluster => {
      if (!cluster) return;
      
      const clusterData = filteredData.filter(row => row['Cluster Name'] === cluster);
      
      // Calculate metrics for this cluster
      const clusterVisitTarget = clusterData.reduce((sum, row) => sum + Number(row['Visits Target MTD'] || 0), 0);
      const clusterVisitActual = clusterData.reduce((sum, row) => sum + Number(row['Visits Actual MTD'] || 0), 0);
      
      const clusterLeadTarget = clusterData.reduce((sum, row) => sum + Number(row['LOS Log Target MTD In Nos.'] || 0), 0);
      const clusterLeadActual = clusterData.reduce((sum, row) => sum + Number(row['LOS Log Actual MTD In Nos.'] || 0), 0);
      
      const clusterSanctionTarget = clusterData.reduce((sum, row) => sum + Number(row['Santion Target'] || 0), 0);
      const clusterSanctionActual = clusterData.reduce((sum, row) => sum + Number(row['Santion Ach'] || 0), 0);
      
      const clusterDisbursementTarget = clusterData.reduce((sum, row) => sum + Number(row['Disbursement Target MTD In Nos.'] || 0), 0);
      const clusterDisbursementActual = clusterData.reduce((sum, row) => sum + Number(row['Disbursement Actuals MTD In Nos.'] || 0), 0);
      
      clusterPerformance[cluster] = {
        visitAch: calculateAchievement(clusterVisitActual, clusterVisitTarget),
        leadAch: calculateAchievement(clusterLeadActual, clusterLeadTarget),
        sanctionAch: calculateAchievement(clusterSanctionActual, clusterSanctionTarget),
        disbAch: calculateAchievement(clusterDisbursementActual, clusterDisbursementTarget),
        visitActual: clusterVisitActual,
        visitTarget: clusterVisitTarget,
        leadActual: clusterLeadActual,
        leadTarget: clusterLeadTarget,
        sanctionActual: clusterSanctionActual,
        sanctionTarget: clusterSanctionTarget,
        disbursementActual: clusterDisbursementActual,
        disbursementTarget: clusterDisbursementTarget
      };
    });

    // Prepare chart data
    const performanceData = {
      labels: clusters,
      visitAchievement: clusters.map(cluster => clusterPerformance[cluster]?.visitAch || 0),
      leadAchievement: clusters.map(cluster => clusterPerformance[cluster]?.leadAch || 0),
    };

    // Get current date information
    const now = new Date();
    const dateInfo = {
      date: now.toISOString(),
      formattedDate: now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      timeframe: timeFrame
    };

    // Return the processed data with no-cache headers
    return NextResponse.json({
      kpis,
      clusterPerformance,
      performanceData,
      dateInfo,
      timestamp: now.toISOString(),
      filters: {
        region,
        branchAge,
        timeFrame,
        userBranch,
        userCluster
      },
      dataSource: 'real-time'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    
    // Return mock data as fallback with no-cache headers
    return NextResponse.json({
      ...getMockData(),
      dataSource: 'mock',
      error: 'Failed to fetch real-time data'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}

// Function to provide mock data when Google Sheets is unavailable
function getMockData() {
  const now = new Date();
  
  // Mock KPIs
  const kpis = {
    salesBuddyLogin: {
      target: 8190,
      actual: 3084,
      achievement: 37.7,
    },
    completedLead: {
      target: 1170,
      actual: 641,
      achievement: 54.8,
    },
    creditLogin: {
      target: 430,
      actual: 228,
      achievement: 53.0,
    },
    casesSanctioned: {
      target: 301,
      actual: 58,
      achievement: 19.3,
    },
    casesDisbursed: {
      target: 259,
      actual: 4,
      achievement: 1.5,
    },
  };
  
  // Mock cluster performance
  const clusterPerformance = {
    'Gurugram': {
      visitAch: 54,
      leadAch: 70,
      sanctionAch: 33.8,
      disbAch: 12.5,
      visitActual: 867,
      visitTarget: 1610,
      leadActual: 161,
      leadTarget: 230,
      sanctionActual: 20,
      sanctionTarget: 59,
      disbursementActual: 8,
      disbursementTarget: 64
    },
    'Faridabad': {
      visitAch: 32,
      leadAch: 70,
      sanctionAch: 25.9,
      disbAch: 8.3,
      visitActual: 676,
      visitTarget: 2100,
      leadActual: 209,
      leadTarget: 300,
      sanctionActual: 20,
      sanctionTarget: 77,
      disbursementActual: 5,
      disbursementTarget: 60
    },
    'Karnataka': {
      visitAch: 38,
      leadAch: 53,
      sanctionAch: 10.2,
      disbAch: 4.1,
      visitActual: 501,
      visitTarget: 1330,
      leadActual: 100,
      leadTarget: 190,
      sanctionActual: 5,
      sanctionTarget: 49,
      disbursementActual: 2,
      disbursementTarget: 49
    },
    'Delhi': {
      visitAch: 32,
      leadAch: 42,
      sanctionAch: 15.9,
      disbAch: 3.2,
      visitActual: 498,
      visitTarget: 1540,
      leadActual: 93,
      leadTarget: 220,
      sanctionActual: 9,
      sanctionTarget: 57,
      disbursementActual: 2,
      disbursementTarget: 63
    },
    'Ghaziabad': {
      visitAch: 34,
      leadAch: 34,
      sanctionAch: 6.8,
      disbAch: 0,
      visitActual: 542,
      visitTarget: 1610,
      leadActual: 78,
      leadTarget: 230,
      sanctionActual: 4,
      sanctionTarget: 59,
      disbursementActual: 0,
      disbursementTarget: 52
    },
  };
  
  // Mock performance data
  const performanceData = {
    labels: Object.keys(clusterPerformance),
    visitAchievement: Object.values(clusterPerformance).map(c => c.visitAch),
    leadAchievement: Object.values(clusterPerformance).map(c => c.leadAch),
  };
  
  // Current date info
  const dateInfo = {
    date: now.toISOString(),
    formattedDate: now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    timeframe: 'MTD'
  };
  
  return {
    kpis,
    clusterPerformance,
    performanceData,
    dateInfo,
    timestamp: now.toISOString(),
    filters: {
      region: 'All',
      branchAge: 'All',
      timeFrame: 'MTD',
      userBranch: null,
      userCluster: null
    }
  };
}

"use client";

import { useState, useEffect } from "react";
import DataChart from "../components/DataChart";
import Link from "next/link";

interface SheetInfo {
  title: string;
  sheetId: number;
}

interface SheetData {
  headers: string[];
  data: any[];
  error?: string;
}

interface AllSheetsData {
  [sheetName: string]: SheetData;
}

interface CEODashboardData {
  sheets: SheetInfo[];
  data: AllSheetsData;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: string;
  branch: string | null;
  cluster?: string | null;
}

export default function CEODashboard() {
  const [timeFrame, setTimeFrame] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<CEODashboardData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Filter states
  const [selectedRole, setSelectedRole] = useState<string>("All Roles");
  const [selectedCluster, setSelectedCluster] = useState<string>("All Clusters");
  const [selectedBranch, setSelectedBranch] = useState<string>("All Branches");
  const [availableClusters, setAvailableClusters] = useState<string[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);

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

  // Get user data from session storage
  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("currentUser");
      if (storedUser) {
        const user = JSON.parse(storedUser) as UserData;
        setUserData(user);
        
        // Set initial filters based on user role
        if (user.role === "Chief Executive Officer") {
          // CEO can see all data
          setSelectedRole("All Roles");
          setSelectedCluster("All Clusters");
          setSelectedBranch("All Branches");
        } else if (user.role === "Cluster Level") {
          // Cluster level users can see their cluster data
          setSelectedRole("Cluster Level");
          if (user.cluster) {
            setSelectedCluster(user.cluster);
          }
        } else if (user.role === "Branch Level") {
          // Branch level users can only see their branch data
          setSelectedRole("Branch Level");
          if (user.branch) {
            // Find the cluster for this branch
            for (const [cluster, branches] of Object.entries(branchClusters)) {
              if (branches.includes(user.branch)) {
                setSelectedCluster(cluster);
                break;
              }
            }
            setSelectedBranch(user.branch);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  // Update available clusters and branches based on role
  useEffect(() => {
    // Set available clusters
    setAvailableClusters(["All Clusters", ...Object.keys(branchClusters)]);
    
    // Set available branches based on selected cluster
    if (selectedCluster === "All Clusters") {
      setAvailableBranches(["All Branches", ...allBranches]);
    } else {
      setAvailableBranches([
        "All Branches", 
        ...(branchClusters[selectedCluster] || [])
      ]);
    }
  }, [selectedCluster]);

  // Fetch data from the API with filters
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build URL with query parameters for filtering
      let url = '/api/ceo-dashboard-data';
      const params = new URLSearchParams();
      
      if (selectedCluster !== "All Clusters") {
        params.append('cluster', selectedCluster);
      }
      
      if (selectedBranch !== "All Branches") {
        params.append('branch', selectedBranch);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setDashboardData(result);
      
      // Set the first sheet as selected if none is selected yet
      if (result.sheets && result.sheets.length > 0 && !selectedSheet) {
        setSelectedSheet(result.sheets[0].title);
      }
      
    } catch (err: any) {
      console.error('Error fetching CEO dashboard data:', err);
      setError(err.message || 'Failed to fetch data');
      
      // Use sample data as fallback
      setDashboardData(generateMockData());
      
      if (!selectedSheet) {
        setSelectedSheet('Sample Data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [selectedCluster, selectedBranch]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // Function to handle time frame change
  const handleTimeFrameChange = (newTimeFrame: 'daily' | 'monthly' | 'yearly') => {
    setTimeFrame(newTimeFrame);
  };

  // Function to handle cluster change
  const handleClusterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCluster = e.target.value;
    setSelectedCluster(newCluster);
    setSelectedBranch("All Branches"); // Reset branch when cluster changes
  };

  // Function to handle branch change
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(e.target.value);
  };

  // Function to generate chart data for a specific sheet
  const generateChartData = (sheetName: string) => {
    if (!dashboardData || !dashboardData.data || !dashboardData.data[sheetName]) {
      return null;
    }

    const sheetData = dashboardData.data[sheetName];
    
    if (!sheetData.data || sheetData.data.length === 0) {
      return null;
    }

    // Find numeric columns for the chart
    const headers = sheetData.headers;
    const numericColumns = headers.filter(header => {
      // Check if the column contains numeric data
      return sheetData.data.some(row => typeof row[header] === 'number');
    });

    // Get labels (first column or row indices)
    const labelColumn = headers[0];
    const labels = sheetData.data.map(row => row[labelColumn] || `Row ${sheetData.data.indexOf(row) + 1}`);

    // Generate datasets for the chart
    const datasets = numericColumns.slice(0, 5).map((column, index) => {
      const colors = [
        'rgba(154, 153, 220, 0.6)', // purple (#9a99dc)
        'rgba(255, 99, 132, 0.6)', // red
        'rgba(75, 192, 192, 0.6)', // green
        'rgba(255, 206, 86, 0.6)', // yellow
        'rgba(129, 128, 199, 0.6)', // darker purple (#8180c7)
        'rgba(255, 159, 64, 0.6)', // orange
      ];
      
      return {
        label: column,
        data: sheetData.data.map(row => row[column] || 0),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace('0.6', '1'),
        borderWidth: 1,
      };
    });

    return {
      labels,
      datasets,
    };
  };

  // Generate summary metrics for the dashboard
  const generateSummaryMetrics = () => {
    if (!dashboardData || !dashboardData.data) {
      return [];
    }

    const metrics: { title: string; value: number | string; change: number | string; trend: 'up' | 'down' | 'neutral'; color: string; label?: string }[] = [];
    
    // For each sheet, generate a summary metric
    Object.keys(dashboardData.data).forEach(sheetName => {
      const sheetData = dashboardData.data[sheetName];
      
      if (!sheetData.data || sheetData.data.length === 0) {
        return;
      }

      // Find numeric columns
      const headers = sheetData.headers;
      const numericColumns = headers.filter(header => {
        return sheetData.data.some(row => typeof row[header] === 'number');
      });

      if (numericColumns.length === 0) {
        return;
      }

      // Calculate sum and average for the first numeric column
      const firstNumericColumn = numericColumns[0];
      const values = sheetData.data.map(row => {
        const val = row[firstNumericColumn];
        return typeof val === 'number' ? val : 0;
      });
      
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = values.length > 0 ? sum / values.length : 0;

      // Ensure sum is a number before calling toFixed
      const formattedSum = typeof sum === 'number' ? 
        sum.toFixed(2) : 
        '0.00';

      metrics.push({
        title: sheetName,
        value: formattedSum,
        label: `Sum of ${firstNumericColumn}`,
        change: '+5.2%', // Placeholder for change calculation
        trend: 'up',
        color: 'green',
      });
    });

    return metrics.slice(0, 4); // Return up to 4 metrics
  };

  // Sample data for fallback
  const generateMockData = (): CEODashboardData => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return {
      sheets: [
        { title: 'Sample Data', sheetId: 0 },
        { title: 'Branch Performance', sheetId: 1 },
      ],
      data: {
        'Sample Data': {
          headers: ['Month', 'Revenue', 'Expenses', 'Profit'],
          data: months.map((month, index) => ({
            'Month': month,
            'Revenue': Math.floor(Math.random() * 5000) + 10000,
            'Expenses': Math.floor(Math.random() * 3000) + 5000,
            'Profit': Math.floor(Math.random() * 2000) + 3000,
          })),
        },
        'Branch Performance': {
          headers: ['Branch', 'Target', 'Actual', 'Achievement'],
          data: [
            { 'Branch': 'Mumbai Central', 'Target': 500, 'Actual': 530, 'Achievement': 106 },
            { 'Branch': 'Delhi North', 'Target': 450, 'Actual': 420, 'Achievement': 93.3 },
            { 'Branch': 'Bangalore Tech', 'Target': 400, 'Actual': 425, 'Achievement': 106.25 },
            { 'Branch': 'Chennai Main', 'Target': 350, 'Actual': 340, 'Achievement': 97.1 },
            { 'Branch': 'Kolkata East', 'Target': 300, 'Actual': 315, 'Achievement': 105 },
          ],
        },
      }
    };
  };

  // Get summary metrics
  const summaryMetrics = loading ? [] : generateSummaryMetrics();

  if (loading && !refreshing) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#9a99dc] border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 texture-bg">
      {/* Dashboard Header */}
      <div className="card texture-card">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Chief Executive Officer Dashboard</h1>
            <p className="text-gray-600">Real-time data from Google Sheets</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-4">
            {/* Advanced Chart View Link */}
            <Link href="/admin/ceo-dashboard/chart-view" className="btn btn-primary">
              Advanced Chart View
            </Link>
            
            {/* Time Frame Selector */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleTimeFrameChange('daily')}
                className={`btn ${timeFrame === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Daily
              </button>
              <button
                onClick={() => handleTimeFrameChange('monthly')}
                className={`btn ${timeFrame === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => handleTimeFrameChange('yearly')}
                className={`btn ${timeFrame === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Yearly
              </button>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-secondary"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card texture-card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Data Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cluster Filter */}
          <div>
            <label htmlFor="cluster-filter" className="block text-sm font-medium mb-2 text-gray-700">
              Cluster
            </label>
            <select
              id="cluster-filter"
              value={selectedCluster}
              onChange={handleClusterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf]"
              disabled={userData?.role === "Cluster Level" || userData?.role === "Branch Level"}
            >
              {availableClusters.map((cluster) => (
                <option key={cluster} value={cluster}>{cluster}</option>
              ))}
            </select>
          </div>
          
          {/* Branch Filter */}
          <div>
            <label htmlFor="branch-filter" className="block text-sm font-medium mb-2 text-gray-700">
              Branch
            </label>
            <select
              id="branch-filter"
              value={selectedBranch}
              onChange={handleBranchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf]"
              disabled={userData?.role === "Branch Level"}
            >
              {availableBranches.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          
          {/* Current User Info */}
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Logged in as:</span> {userData?.name || 'Guest'}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Role:</span> {userData?.role || 'N/A'}
            </p>
            {userData?.branch && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Branch:</span> {userData.branch}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="mt-2 text-sm text-red-500">Please check your Google Sheets API configuration and ensure the spreadsheet is accessible.</p>
        </div>
      )}

      {/* Key Performance Indicators */}
      <div className="responsive-grid md:grid-cols-2 lg:grid-cols-4">
        {summaryMetrics.map((metric, index) => (
          <div key={index} className="card texture-card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#f0f0fa] text-[#9a99dc]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">{metric.label}</p>
                <h2 className="text-2xl font-bold text-gray-800">{metric.value}</h2>
                <p className="text-green-600 text-sm">{metric.change}</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-gray-600 text-sm truncate">{metric.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sheet Selector */}
      {dashboardData && dashboardData.sheets && dashboardData.sheets.length > 0 && (
        <div className="card texture-card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Available Sheets</h2>
          <div className="flex flex-wrap gap-2">
            {dashboardData.sheets.map((sheet) => (
              <button
                key={sheet.sheetId}
                onClick={() => setSelectedSheet(sheet.title)}
                className={`btn ${selectedSheet === sheet.title ? 'btn-primary' : 'btn-secondary'}`}
              >
                {sheet.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Sheet Data */}
      {selectedSheet && dashboardData && dashboardData.data && dashboardData.data[selectedSheet] && (
        <div className="card texture-card">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{selectedSheet}</h2>
          
          {/* Chart */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Chart View</h3>
            {generateChartData(selectedSheet) ? (
              <div className="h-96">
                <DataChart 
                  type="bar" 
                  labels={generateChartData(selectedSheet)?.labels || []}
                  datasets={generateChartData(selectedSheet)?.datasets || []}
                  title={selectedSheet}
                  height={350}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No chart data available for this sheet</p>
              </div>
            )}
          </div>
          
          {/* Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Table View</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                  <tr>
                    {dashboardData.data[selectedSheet].headers.map((header, index) => (
                      <th key={index} className="px-4 py-3">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.data[selectedSheet].data.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-200">
                      {dashboardData.data[selectedSheet].headers.map((header, colIndex) => (
                        <td key={colIndex} className="px-4 py-3">
                          {typeof row[header] === 'number' 
                            ? Number(row[header]).toLocaleString() 
                            : row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {dashboardData.data[selectedSheet].data.length > 10 && (
                <div className="mt-4 text-center text-gray-500 text-sm">
                  Showing 10 of {dashboardData.data[selectedSheet].data.length} rows
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



"use client";

import { useState, useEffect, useMemo } from "react";
import DataChart from "../../components/DataChart";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

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
  filters?: {
    cluster?: string;
    branch?: string;
  };
}

type ChartType = 'bar' | 'line' | 'pie';

export default function CEODashboardChartView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<CEODashboardData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [filteredBranches, setFilteredBranches] = useState<string[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [isRealTimeData, setIsRealTimeData] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Organize branches by clusters
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

  // Get all clusters
  const clusters = Object.keys(branchClusters);
  
  // Get all branches as a flat array
  const allBranches = Object.values(branchClusters).flat();

  // Update filtered branches when cluster changes
  useEffect(() => {
    if (selectedCluster === "") {
      setFilteredBranches(allBranches);
    } else if (selectedCluster === "All Clusters") {
      setFilteredBranches(allBranches);
    } else {
      setFilteredBranches(branchClusters[selectedCluster] || []);
    }
    setSelectedBranch("");
  }, [selectedCluster]);

  // Fetch data from the API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build URL with query parameters for filtering
      const url = new URL('/api/ceo-dashboard-data', window.location.origin);
      
      // Add filter parameters if selected
      if (selectedCluster && selectedCluster !== "All Clusters") {
        url.searchParams.append('cluster', selectedCluster);
      }
      
      if (selectedBranch) {
        url.searchParams.append('branch', selectedBranch);
      }
      
      // Add cache-busting parameters for real-time data
      url.searchParams.append('_t', new Date().getTime().toString());
      url.searchParams.append('_r', Math.random().toString().substring(2));
      
      console.log(`Fetching real-time CEO dashboard data at ${new Date().toISOString()}`);
      
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Ensure sheets property exists and is an array
      if (!result.sheets || !Array.isArray(result.sheets) || result.sheets.length === 0) {
        throw new Error('No sheets found in the response');
      }
      
      // Ensure data property exists
      if (!result.data || Object.keys(result.data).length === 0) {
        throw new Error('No data found in the response');
      }
      
      setDashboardData(result);
      
      // Update real-time indicators
      setLastRefreshed(new Date().toISOString());
      setIsRealTimeData(result.dataSource === 'real-time' || true);
      
      // Set the sheet from URL params or first available
      const sheetFromParams = searchParams.get('sheet');
      if (sheetFromParams && result.data[sheetFromParams]) {
        setSelectedSheet(sheetFromParams);
      } else if (result.sheets && result.sheets.length > 0) {
        // Make sure the first sheet exists in the data
        const firstSheetTitle = result.sheets[0].title;
        if (firstSheetTitle && result.data[firstSheetTitle]) {
          setSelectedSheet(firstSheetTitle);
        } else {
          // Find the first available sheet that has data
          const availableSheet = result.sheets.find((s: SheetInfo) => s.title && result.data[s.title]);
          if (availableSheet) {
            setSelectedSheet(availableSheet.title);
          } else {
            throw new Error('No valid sheets with data found');
          }
        }
      }
      
    } catch (err: any) {
      console.error('Error fetching CEO dashboard data:', err);
      setError(err.message || 'Failed to fetch data');
      
      // Use sample data as fallback
      const mockData = generateMockData();
      setDashboardData(mockData);
      
      if (!selectedSheet) {
        setSelectedSheet('Sample Data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch and set up auto-refresh
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing CEO dashboard data');
      fetchData();
    }, 60000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [selectedCluster, selectedBranch]);

  // Update selected metrics when sheet changes
  useEffect(() => {
    if (selectedSheet && dashboardData?.data && dashboardData.data[selectedSheet]) {
      const numericColumns = getNumericColumns(selectedSheet);
      // Select first 3 numeric metrics by default or fewer if not enough available
      setSelectedMetrics(numericColumns.slice(0, Math.min(3, numericColumns.length)));
    } else {
      // Reset metrics if no sheet is selected or sheet has no data
      setSelectedMetrics([]);
    }
  }, [selectedSheet, dashboardData]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // Handle cluster change
  const handleClusterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCluster = e.target.value;
    setSelectedCluster(newCluster);
    
    // Reset branch selection
    setSelectedBranch("");
    
    // Update filtered branches based on cluster
    if (newCluster === "") {
      setFilteredBranches(allBranches);
    } else if (newCluster === "All Clusters") {
      setFilteredBranches(allBranches);
    } else {
      setFilteredBranches(branchClusters[newCluster] || []);
    }
    
    // Refresh data with new cluster filter
    setRefreshing(true);
    setTimeout(() => {
      fetchData();
    }, 100);
  };

  // Handle branch change
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBranch = e.target.value;
    setSelectedBranch(newBranch);
    
    // Refresh data with new branch filter
    setRefreshing(true);
    setTimeout(() => {
      fetchData();
    }, 100);
  };

  // Get numeric columns for the selected sheet
  const getNumericColumns = (sheetName: string) => {
    if (!dashboardData || !dashboardData.data || !dashboardData.data[sheetName]) {
      return [];
    }

    const sheetData = dashboardData.data[sheetName];
    
    if (!sheetData.headers || !Array.isArray(sheetData.headers) || sheetData.headers.length === 0) {
      return [];
    }
    
    if (!sheetData.data || !Array.isArray(sheetData.data) || sheetData.data.length === 0) {
      return [];
    }

    // Find numeric columns for the chart
    return sheetData.headers.filter(header => {
      // Check if the column contains numeric data
      return sheetData.data.some(row => {
        if (!row || typeof row !== 'object') return false;
        
        const value = row[header];
        return value !== undefined && 
               value !== null && 
               typeof value === 'number' &&
               !isNaN(value);
      });
    });
  };

  // Toggle metric selection
  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  // Get the data for the selected sheet (already filtered by the server)
  const filteredData = useMemo(() => {
    if (!selectedSheet || !dashboardData || !dashboardData.data) {
      return null;
    }
    
    // Check if the selected sheet exists in the data
    if (!dashboardData.data[selectedSheet]) {
      console.error(`Selected sheet "${selectedSheet}" not found in dashboard data`);
      return null;
    }

    return dashboardData.data[selectedSheet];
  }, [selectedSheet, dashboardData]);

  // Generate chart data for the selected sheet and metrics
  const chartData = useMemo(() => {
    if (!selectedSheet || !filteredData || selectedMetrics.length === 0) {
      return null;
    }
    
    if (!filteredData.data || !Array.isArray(filteredData.data) || filteredData.data.length === 0) {
      return null;
    }
    
    if (!filteredData.headers || !Array.isArray(filteredData.headers) || filteredData.headers.length === 0) {
      return null;
    }

    try {
      // Get labels (first column or row indices)
      const labelColumn = filteredData.headers[0];
      const labels = filteredData.data.map(row => {
        if (!row || typeof row !== 'object') return `Row ${filteredData.data.indexOf(row) + 1}`;
        return row[labelColumn] || `Row ${filteredData.data.indexOf(row) + 1}`;
      });

      // Generate datasets for the chart
      const colors = [
        'rgba(154, 153, 220, 0.6)', // purple (#9a99dc)
        'rgba(255, 99, 132, 0.6)', // red
        'rgba(75, 192, 192, 0.6)', // green
        'rgba(255, 206, 86, 0.6)', // yellow
        'rgba(129, 128, 199, 0.6)', // darker purple (#8180c7)
        'rgba(255, 159, 64, 0.6)', // orange
      ];
      
      const datasets = selectedMetrics.map((metric, index) => {
        return {
          label: metric,
          data: filteredData.data.map(row => {
            if (!row || typeof row !== 'object') return 0;
            const value = row[metric];
            // Ensure we have a valid number
            return (value !== undefined && value !== null && !isNaN(Number(value))) 
              ? Number(value) 
              : 0;
          }),
          backgroundColor: chartType === 'pie' 
            ? selectedMetrics.map((_, i) => colors[i % colors.length])
            : colors[index % colors.length],
          borderColor: chartType === 'line' 
            ? colors[index % colors.length].replace('0.6', '1')
            : colors[index % colors.length].replace('0.6', '1'),
          borderWidth: 1,
        };
      });

      return {
        labels,
        datasets,
      };
    } catch (err) {
      console.error('Error generating chart data:', err);
      return null;
    }
  }, [selectedSheet, filteredData, selectedMetrics, chartType]);

  // Generate statistics for selected metrics
  const metricStats = useMemo(() => {
    if (!selectedSheet || !filteredData || selectedMetrics.length === 0) {
      return [];
    }
    
    if (!filteredData.data || !Array.isArray(filteredData.data) || filteredData.data.length === 0) {
      return [];
    }

    try {
      return selectedMetrics.map(metric => {
        const values = filteredData.data.map(row => {
          if (!row || typeof row !== 'object') return 0;
          const value = row[metric];
          return (value !== undefined && value !== null && !isNaN(Number(value))) 
            ? Number(value) 
            : 0;
        });
        
        // Calculate statistics
        const sum = values.reduce((acc, val) => acc + val, 0);
        const avg = values.length > 0 ? sum / values.length : 0;
        const max = values.length > 0 ? Math.max(...values) : 0;
        const min = values.length > 0 ? Math.min(...values) : 0;
        
        return {
          metric,
          sum: sum.toFixed(2),
          avg: avg.toFixed(2),
          max: max.toFixed(2),
          min: min.toFixed(2),
        };
      });
    } catch (err) {
      console.error('Error generating metric statistics:', err);
      return [];
    }
  }, [selectedSheet, filteredData, selectedMetrics]);

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
            { 'Branch': 'North-Alipur', 'Target': 500, 'Actual': 530, 'Achievement': 106 },
            { 'Branch': 'North-Nangloi', 'Target': 450, 'Actual': 420, 'Achievement': 93.3 },
            { 'Branch': 'South-Davangere', 'Target': 400, 'Actual': 425, 'Achievement': 106.25 },
            { 'Branch': 'North-Faridabad', 'Target': 350, 'Actual': 340, 'Achievement': 97.1 },
            { 'Branch': 'West-Kalyan', 'Target': 300, 'Actual': 315, 'Achievement': 105 },
          ],
        },
      }
    };
  };

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
            <h1 className="text-2xl font-bold text-gray-800">CEO Dashboard Chart Analysis</h1>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-gray-600">Advanced visualization</p>
              {isRealTimeData ? (
                <span className="flex items-center text-green-600 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Real-time data
                </span>
              ) : (
                <span className="flex items-center text-yellow-600 text-sm">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Sample data
                </span>
              )}
              {lastRefreshed && (
                <span className="text-xs text-gray-500">
                  Last updated: {new Date(lastRefreshed).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href="/admin/ceo-dashboard" className="btn btn-secondary">
              Back to Dashboard
            </Link>
            <button 
              onClick={handleRefresh} 
              className="btn btn-primary flex items-center"
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Sheet Selector and Chart Controls */}
      <div className="card texture-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sheet Selector */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Select Data Source</h2>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedSheet || ''}
              onChange={(e) => setSelectedSheet(e.target.value)}
            >
              {dashboardData?.sheets.map((sheet) => (
                <option key={sheet.sheetId} value={sheet.title}>
                  {sheet.title}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Type Selector */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Chart Type</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setChartType('bar')} 
                className={`px-4 py-2 rounded-md ${chartType === 'bar' ? 'bg-[#9a99dc] text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Bar
              </button>
              <button 
                onClick={() => setChartType('line')} 
                className={`px-4 py-2 rounded-md ${chartType === 'line' ? 'bg-[#9a99dc] text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Line
              </button>
              <button 
                onClick={() => setChartType('pie')} 
                className={`px-4 py-2 rounded-md ${chartType === 'pie' ? 'bg-[#9a99dc] text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Pie
              </button>
            </div>
          </div>

          {/* Metrics Selector */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Metrics</h2>
            <div className="flex flex-wrap gap-2">
              {selectedSheet && getNumericColumns(selectedSheet).map((metric) => (
                <button
                  key={metric}
                  onClick={() => toggleMetric(metric)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedMetrics.includes(metric) 
                      ? 'bg-[#9a99dc] text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cluster and Branch Filters */}
      <div className="card texture-card">
        <h2 className="text-lg font-semibold mb-4">Filter by Cluster and Branch</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cluster Selector */}
          <div>
            <label htmlFor="cluster" className="block text-sm font-medium text-gray-700 mb-1">
              Select Cluster
            </label>
            <select
              id="cluster"
              value={selectedCluster}
              onChange={handleClusterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={refreshing}
            >
              <option value="">All Clusters</option>
              {clusters.map((clusterName) => (
                <option key={clusterName} value={clusterName}>
                  {clusterName}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Selector */}
          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
              Select Branch
            </label>
            <select
              id="branch"
              value={selectedBranch}
              onChange={handleBranchChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={refreshing || filteredBranches.length === 0}
            >
              <option value="">All Branches</option>
              {filteredBranches.map((branchName) => (
                <option key={branchName} value={branchName}>
                  {branchName}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Filter Status */}
        <div className="mt-4 text-sm text-gray-600">
          {selectedCluster && selectedBranch ? (
            <p>Filtering data for branch: <span className="font-semibold">{selectedBranch}</span> in cluster: <span className="font-semibold">{selectedCluster}</span></p>
          ) : selectedCluster ? (
            <p>Filtering data for cluster: <span className="font-semibold">{selectedCluster}</span></p>
          ) : (
            <p>Showing data for all clusters and branches</p>
          )}
          
          {dashboardData?.filters && (
            <p className="mt-1 text-xs text-gray-500">
              Server-side filters applied: 
              {dashboardData.filters.cluster ? ` Cluster: ${dashboardData.filters.cluster}` : ' None'} 
              {dashboardData.filters.branch ? `, Branch: ${dashboardData.filters.branch}` : ''}
            </p>
          )}
          
          {dashboardData?.data && selectedSheet && dashboardData.data[selectedSheet]?.data && (
            <p className="mt-1">Displaying {dashboardData.data[selectedSheet].data.length} records</p>
          )}
        </div>
      </div>

      {/* Chart Display */}
      {error && (
        <div className="card texture-card bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-2">
                  Please check your Google Sheets API key and make sure the spreadsheet is accessible.
                  If the problem persists, try refreshing the page or contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!error && chartData && selectedMetrics.length > 0 ? (
        <div className="card texture-card">
          <div className="relative">
            {refreshing && (
              <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#9a99dc] border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Updating chart...</p>
                </div>
              </div>
            )}
            <DataChart
              type={chartType}
              labels={chartData.labels}
              datasets={chartData.datasets}
              title={`${selectedSheet} - ${selectedMetrics.join(' vs ')}`}
              height={500}
            />
          </div>
        </div>
      ) : !error && (
        <div className="card texture-card bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Chart cannot be displayed</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {!selectedSheet 
                    ? 'Please select a data source to display the chart.' 
                    : !selectedMetrics.length 
                      ? 'Please select at least one metric to display the chart.'
                      : 'No valid data available for the selected options.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Statistics */}
      {metricStats.length > 0 && (
        <div className="card texture-card">
          <h2 className="text-xl font-semibold mb-4">Metrics Analysis</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maximum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metricStats.map((stat) => (
                  <tr key={stat.metric}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.metric}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.sum}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.avg}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.max}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.min}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Table Preview */}
      {selectedSheet && filteredData && (
        <div className="card texture-card">
          <h2 className="text-xl font-semibold mb-4">Data Preview</h2>
          {filteredData.error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{filteredData.error}</p>
            </div>
          ) : !filteredData.headers || !Array.isArray(filteredData.headers) || filteredData.headers.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-yellow-700">No headers found in the data</p>
            </div>
          ) : !filteredData.data || !Array.isArray(filteredData.data) || filteredData.data.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-yellow-700">No data rows found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {filteredData.headers.map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.data.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {filteredData.headers.map((header) => (
                        <td key={`${rowIndex}-${header}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row && typeof row === 'object' ? (
                            row[header] !== undefined && row[header] !== null ? String(row[header]) : '-'
                          ) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.data.length > 10 && (
                <div className="py-3 text-center text-sm text-gray-500">
                  Showing 10 of {filteredData.data.length} rows
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
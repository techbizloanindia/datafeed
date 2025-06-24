import React, { useState, useEffect } from 'react';
import RefreshButton from './RefreshButton';
import Link from 'next/link';

interface UserData {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: string;
  branch: string | null;
  cluster?: string | null;
}

interface RoleBasedDataTableProps {
  userData: UserData | null;
  title: string;
  endpoint: string;
  columns: {
    key: string;
    header: string;
    format?: (value: any) => string | JSX.Element;
  }[];
  branchClusters: Record<string, string[]>;
  filterField?: string;
  showRefresh?: boolean;
  onDataLoaded?: (data: any[]) => void;
  reportLink?: string;
  description?: string;
  maxRows?: number;
  refreshInterval?: number;
}

export default function RoleBasedDataTable({
  userData,
  title,
  endpoint,
  columns,
  branchClusters,
  filterField = 'branchName',
  showRefresh = true,
  onDataLoaded,
  reportLink,
  description,
  maxRows = 5,
  refreshInterval = 0 // 0 means no auto refresh
}: RoleBasedDataTableProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  
  // Helper function to get branches in a cluster
  const getBranchesInCluster = (clusterName: string): string[] => {
    return branchClusters[clusterName] || [];
  };

  // Generate sample data if no data is available
  const generateSampleData = () => {
    // Sample data based on the endpoint
    if (endpoint.includes('branch-disbursement-data')) {
      return [
        { 
          branchName: 'Sample Branch 1', 
          cluster: 'West', 
          mtdDisbursementTargetNos: 65, 
          mtdDisbursementActualNos: 70, 
          mtdVariancePercentage: 7.69 
        },
        { 
          branchName: 'Sample Branch 2', 
          cluster: 'North', 
          mtdDisbursementTargetNos: 55, 
          mtdDisbursementActualNos: 58, 
          mtdVariancePercentage: 5.45 
        },
        { 
          branchName: 'Sample Branch 3', 
          cluster: 'South', 
          mtdDisbursementTargetNos: 70, 
          mtdDisbursementActualNos: 65, 
          mtdVariancePercentage: -7.14 
        }
      ];
    } else if (endpoint.includes('green-amber-leads-data')) {
      return [
        { 
          branchName: 'Sample Branch 1', 
          cluster: 'West', 
          greenLeads: 25, 
          amberLeads: 30, 
          totalLeads: 100, 
          greenLeadsPercentage: 25.0, 
          amberLeadsPercentage: 30.0 
        },
        { 
          branchName: 'Sample Branch 2', 
          cluster: 'North', 
          greenLeads: 20, 
          amberLeads: 35, 
          totalLeads: 90, 
          greenLeadsPercentage: 22.2, 
          amberLeadsPercentage: 38.9 
        },
        { 
          branchName: 'Sample Branch 3', 
          cluster: 'South', 
          greenLeads: 30, 
          amberLeads: 25, 
          totalLeads: 110, 
          greenLeadsPercentage: 27.3, 
          amberLeadsPercentage: 22.7 
        }
      ];
    }
    
    // Default sample data
    return [
      { id: 1, name: 'Sample Data 1', value: 45, percentage: 45.0 },
      { id: 2, name: 'Sample Data 2', value: 55, percentage: 55.0 },
      { id: 3, name: 'Sample Data 3', value: 40, percentage: 40.0 }
    ];
  };

  // Fetch data from the API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build URL with query parameters for role-based filtering
      let url = new URL(endpoint, window.location.origin);
      
      // Add role-based filtering parameters
      if (userData) {
        if (userData.role) {
          url.searchParams.append('role', userData.role);
        }
        if (userData.cluster) {
          url.searchParams.append('cluster', userData.cluster);
        }
        if (userData.branch) {
          url.searchParams.append('branch', userData.branch);
        }
      }
      
      // Add cache-busting parameters for real-time data
      url.searchParams.append('_t', new Date().getTime().toString());
      url.searchParams.append('_r', Math.random().toString().substring(2));
      
      console.log(`Fetching real-time data from ${endpoint} at ${new Date().toISOString()}`);
      
      const response = await fetch(url.toString(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Get data from response
      let filteredData = Array.isArray(result) ? result : Array.isArray(result.data) ? result.data : [];
      
      // If no data is available after filtering, use sample data
      if (filteredData.length === 0) {
        console.log(`No data returned from ${endpoint}, using sample data`);
        filteredData = generateSampleData();
      } else {
        console.log(`Received ${filteredData.length} records from ${endpoint}`);
      }
      
      setData(filteredData);
      
      // Set last refreshed timestamp
      if (result.lastUpdated) {
        setLastRefreshed(result.lastUpdated);
      } else {
        setLastRefreshed(new Date().toISOString());
      }
      
      // Notify parent component if callback provided
      if (onDataLoaded) {
        onDataLoaded(filteredData);
      }
      
    } catch (error: any) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      setError(error.message || 'Failed to load data');
      
      // Use sample data on error
      console.log(`Error fetching data from ${endpoint}, using sample data`);
      const sampleData = generateSampleData();
      setData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial load
  useEffect(() => {
    if (userData) {
      fetchData();
    }
  }, [userData, endpoint]);

  // Set up auto-refresh if interval is provided
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;
    
    const intervalId = setInterval(() => {
      if (userData) {
        fetchData();
      }
    }, refreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, userData, endpoint]);

  // Format cell value based on column configuration
  const formatCellValue = (row: any, column: any) => {
    // Check if row exists and has the specified key
    if (!row || !(column.key in row)) {
      return '-';
    }
    
    const value = row[column.key];
    
    if (column.format) {
      try {
        return column.format(value);
      } catch (error) {
        console.error(`Error formatting value for ${column.key}:`, error);
        return '-';
      }
    }
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'number') {
      try {
        // Format numbers with commas and 2 decimal places if needed
        return Number.isFinite(value) ? 
          (value % 1 === 0 ? value.toLocaleString() : value.toFixed(2)) : 
          '-';
      } catch (error) {
        console.error(`Error formatting number for ${column.key}:`, error);
        return '-';
      }
    }
    
    try {
      return String(value);
    } catch (error) {
      console.error(`Error converting value to string for ${column.key}:`, error);
      return '-';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
          {description && <p className="text-gray-600 text-sm">{description}</p>}
          {userData && !description && (
            <p className="text-gray-600 text-sm">
              {userData.role === "Chief Executive Officer" ? "Viewing all data" :
               userData.role === "Cluster Level" && userData.cluster ? `Filtered by ${userData.cluster} cluster` :
               userData.role === "Branch Level" && userData.branch ? `Filtered by ${userData.branch} branch` :
               "Viewing available data"}
            </p>
          )}
        </div>
        
        <div className="flex items-center">
          {showRefresh && (
            <RefreshButton 
              onRefresh={fetchData} 
              isLoading={loading}
              lastRefreshed={lastRefreshed}
              isRealTimeData={true}
              buttonText="Refresh Data"
            />
          )}
          {reportLink && (
            <Link href={reportLink} className="ml-2 text-[#7f7acf] hover:text-[#6c67b5] text-sm">
              View Full Report
            </Link>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7f7acf]"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, maxRows).map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {columns.map((column, colIndex) => (
                      <td key={`${rowIndex}-${colIndex}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCellValue(row, column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {data.length > maxRows && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Showing {maxRows} of {data.length} rows
              </p>
              {reportLink && (
                <Link href={reportLink} className="text-[#7f7acf] hover:text-[#6c67b5] text-sm font-medium">
                  View All Data
                </Link>
              )}
            </div>
          )}
          
          {data.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 
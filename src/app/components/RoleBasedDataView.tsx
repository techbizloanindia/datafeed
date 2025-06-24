import React, { useState, useEffect } from 'react';
import DataChart from './DataChart';
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

interface RoleBasedDataViewProps {
  userData: UserData | null;
  title: string;
  endpoint: string;
  chartType?: 'bar' | 'pie' | 'line';
  height?: number;
  branchClusters: Record<string, string[]>;
  dataTransformer: (data: any[]) => {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }[];
  };
  filterField?: string;
  showRefresh?: boolean;
  onDataLoaded?: (data: any[]) => void;
  reportLink?: string;
  description?: string;
  refreshInterval?: number;
}

export default function RoleBasedDataView({
  userData,
  title,
  endpoint,
  chartType = 'bar',
  height = 300,
  branchClusters,
  dataTransformer,
  filterField = 'branchName',
  showRefresh = true,
  onDataLoaded,
  reportLink,
  description,
  refreshInterval = 0 // 0 means no auto refresh
}: RoleBasedDataViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  
  // Helper function to get branches in a cluster
  const getBranchesInCluster = (clusterName: string): string[] => {
    return branchClusters[clusterName] || [];
  };

  // Generate sample data if no data is available
  const generateSampleData = () => {
    // Sample data based on the endpoint
    if (endpoint.includes('branch-target-leads')) {
      return [
        { branch: 'Sample Branch 1', mtdTargetLeads: 50, mtdActualLeads: 45 },
        { branch: 'Sample Branch 2', mtdTargetLeads: 40, mtdActualLeads: 42 },
        { branch: 'Sample Branch 3', mtdTargetLeads: 60, mtdActualLeads: 55 }
      ];
    } else if (endpoint.includes('branch-disbursement-data')) {
      return [
        { branchName: 'Sample Branch 1', mtdDisbursementTargetNos: 65, mtdDisbursementActualNos: 60 },
        { branchName: 'Sample Branch 2', mtdDisbursementTargetNos: 55, mtdDisbursementActualNos: 58 },
        { branchName: 'Sample Branch 3', mtdDisbursementTargetNos: 70, mtdDisbursementActualNos: 65 }
      ];
    } else if (endpoint.includes('green-amber-leads-data')) {
      return [
        { branchName: 'Sample Branch 1', greenLeadsPercentage: 40, amberLeadsPercentage: 30 },
        { branchName: 'Sample Branch 2', greenLeadsPercentage: 35, amberLeadsPercentage: 40 },
        { branchName: 'Sample Branch 3', greenLeadsPercentage: 45, amberLeadsPercentage: 25 }
      ];
    } else if (endpoint.includes('credit-logins')) {
      return [
        { branchName: 'Sample Branch 1', greenLeadsToLoginsPercentage: 65, amberLeadsToLoginsPercentage: 45 },
        { branchName: 'Sample Branch 2', greenLeadsToLoginsPercentage: 55, amberLeadsToLoginsPercentage: 50 },
        { branchName: 'Sample Branch 3', greenLeadsToLoginsPercentage: 60, amberLeadsToLoginsPercentage: 40 }
      ];
    }
    
    // Default sample data
    return [
      { name: 'Sample 1', value: 45 },
      { name: 'Sample 2', value: 55 },
      { name: 'Sample 3', value: 40 }
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
      
      console.log(`Fetching data from ${endpoint} at ${new Date().toISOString()}`);
      
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
      
      // Transform the data for the chart
      if (filteredData.length > 0) {
        const transformedData = dataTransformer(filteredData);
        setChartData(transformedData);
      } else {
        setChartData(null);
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
      setChartData(dataTransformer(sampleData));
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
        <div className="flex justify-center items-center" style={{ height: `${height}px` }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7f7acf]"></div>
        </div>
      ) : chartData ? (
        <DataChart 
          type={chartType}
          labels={chartData.labels}
          datasets={chartData.datasets}
          title=""
          height={height}
        />
      ) : (
        <div className="flex justify-center items-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7f7acf]"></div>
        </div>
      )}
      
      {data.length > 0 && (
        <div className="mt-4 text-xs text-gray-500">
          Showing data for {data.length} {data.length === 1 ? 'item' : 'items'}
        </div>
      )}
    </div>
  );
} 
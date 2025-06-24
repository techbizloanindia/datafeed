"use client";

import { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import Navigation from '../../components/Navigation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUser } from '../../context/UserContext';
import RefreshButton from '../../components/RefreshButton';

const ChartView = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const reportType = searchParams.get('type') || 'performance';
  
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [isRealTimeData, setIsRealTimeData] = useState(false);
  
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build URL with query parameters for role-based filtering
      let url = new URL('/api/branch-target-leads', window.location.origin);
      
      // Add role-based filtering parameters
      if (user) {
        if (user.role) {
          url.searchParams.append('role', user.role);
        }
        if (user.cluster) {
          url.searchParams.append('cluster', user.cluster);
        }
        if (user.branch) {
          url.searchParams.append('branch', user.branch);
        }
      }
      
      // Add cache-busting parameters for real-time data
      url.searchParams.append('_t', new Date().getTime().toString());
      url.searchParams.append('_r', Math.random().toString().substring(2));
      
      console.log(`Fetching real-time data for chart-view at ${new Date().toISOString()}`);
      
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
      const fetchedData = Array.isArray(result) ? result : Array.isArray(result.data) ? result.data : [];
      
      // If no data is available, use sample data
      if (fetchedData.length === 0) {
        console.log("No data returned from API, using sample data");
        setRawData(getSampleData());
        setIsRealTimeData(false);
      } else {
        console.log(`Received ${fetchedData.length} records from API`);
        
        // Map the data to match our expected format
        const mappedData = fetchedData.map(item => ({
          branch: item.branch || item.branchName || '',
          cluster: item.cluster || '',
          dailyTarget: item.dailyTargetLeads || 0,
          dailyActual: item.dailyActualLeads || 0,
          mtdTarget: item.mtdTargetLeads || 0,
          mtdActual: item.mtdActualLeads || 0,
          mtdVariance: item.mtdVariancePercentage || 0
        }));
        
        setRawData(mappedData);
        setIsRealTimeData(result.dataSource === 'real-time');
      }
      
      // Set last refreshed timestamp
      if (result.lastUpdated) {
        setLastRefreshed(result.lastUpdated);
      } else {
        setLastRefreshed(new Date().toISOString());
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load data');
      setRawData(getSampleData());
      setIsRealTimeData(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on initial load
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  // Sample data as fallback
  const getSampleData = () => [
    { branch: "Gurugram", cluster: "Gurugram", dailyTarget: 12, dailyActual: 12, mtdTarget: 50, mtdActual: 12, mtdVariance: -76.00 },
    { branch: "Yelahanka", cluster: "Karnataka", dailyTarget: 12, dailyActual: 10, mtdTarget: 50, mtdActual: 12, mtdVariance: -76.00 },
    { branch: "Davanagere", cluster: "Karnataka", dailyTarget: 12, dailyActual: 9, mtdTarget: 50, mtdActual: 25, mtdVariance: -50.00 },
    { branch: "Faridabad", cluster: "Faridabad", dailyTarget: 13, dailyActual: 5, mtdTarget: 50, mtdActual: 55, mtdVariance: 10.00 },
    { branch: "Pitampura", cluster: "Delhi", dailyTarget: 13, dailyActual: 5, mtdTarget: 50, mtdActual: 51, mtdVariance: 2.00 },
    { branch: "Panipat", cluster: "Delhi", dailyTarget: 13, dailyActual: 6, mtdTarget: 50, mtdActual: 6, mtdVariance: -88.00 },
    { branch: "Kengeri", cluster: "Karnataka", dailyTarget: 13, dailyActual: 2, mtdTarget: 50, mtdActual: 2, mtdVariance: -96.00 },
    { branch: "Ramnagar", cluster: "Karnataka", dailyTarget: 13, dailyActual: 5, mtdTarget: 50, mtdActual: 51, mtdVariance: 2.00 },
    { branch: "West", cluster: "Maharastra", dailyTarget: 15, dailyActual: 8, mtdTarget: 50, mtdActual: 8, mtdVariance: -84.00 },
    { branch: "Bhiwadi", cluster: "Gurugram", dailyTarget: 14, dailyActual: 9, mtdTarget: 50, mtdActual: 9, mtdVariance: -82.00 },
    { branch: "Mathura", cluster: "Faridabad", dailyTarget: 13, dailyActual: 12, mtdTarget: 50, mtdActual: 12, mtdVariance: -76.00 },
    { branch: "Palwal", cluster: "Faridabad", dailyTarget: 13, dailyActual: 5, mtdTarget: 50, mtdActual: 15, mtdVariance: -70.00 },
    { branch: "Kanakpura", cluster: "Karnataka", dailyTarget: 13, dailyActual: 2, mtdTarget: 50, mtdActual: 2, mtdVariance: -96.00 },
    { branch: "Rewari", cluster: "Gurugram", dailyTarget: 16, dailyActual: 10, mtdTarget: 50, mtdActual: 10, mtdVariance: -80.00 },
    { branch: "Badarpur", cluster: "Faridabad", dailyTarget: 13, dailyActual: 5, mtdTarget: 50, mtdActual: 5, mtdVariance: -90.00 },
    { branch: "East Delhi", cluster: "Ghaziabad", dailyTarget: 13, dailyActual: 8, mtdTarget: 50, mtdActual: 51, mtdVariance: 2.00 },
    { branch: "Goverdhan", cluster: "Faridabad", dailyTarget: 13, dailyActual: 9, mtdTarget: 50, mtdActual: 15, mtdVariance: -70.00 },
    { branch: "Alipur", cluster: "Delhi", dailyTarget: 13, dailyActual: 13, mtdTarget: 50, mtdActual: 13, mtdVariance: -74.00 }
  ];

  const [selectedCluster, setSelectedCluster] = useState('All');

  // Process data
  const processedData = useMemo(() => {
    return rawData.map(branch => ({
      ...branch,
      dailyAchievement: (branch.dailyActual / branch.dailyTarget * 100),
      performanceCategory: branch.mtdVariance > 0 ? 'Exceeding' : 
                          branch.mtdVariance === 0 ? 'Meeting' :
                          branch.mtdVariance > -25 ? 'Slightly Under' :
                          branch.mtdVariance > -50 ? 'Underperforming' : 'Critical',
      performanceColor: branch.mtdVariance > 0 ? '#22c55e' : 
                       branch.mtdVariance === 0 ? '#3b82f6' :
                       branch.mtdVariance > -25 ? '#f59e0b' :
                       branch.mtdVariance > -50 ? '#ef4444' : '#dc2626'
    }));
  }, []);

  // Filter data by cluster
  const filteredData = selectedCluster === 'All' ? processedData : processedData.filter(d => d.cluster === selectedCluster);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalDailyTarget = filteredData.reduce((sum, d) => sum + d.dailyTarget, 0);
    const totalDailyActual = filteredData.reduce((sum, d) => sum + d.dailyActual, 0);
    const totalMTDTarget = filteredData.reduce((sum, d) => sum + d.mtdTarget, 0);
    const totalMTDActual = filteredData.reduce((sum, d) => sum + d.mtdActual, 0);
    
    return {
      dailyAchievement: ((totalDailyActual / totalDailyTarget) * 100).toFixed(1),
      mtdAchievement: ((totalMTDActual / totalMTDTarget) * 100).toFixed(1),
      totalBranches: filteredData.length,
      avgPerformance: (filteredData.reduce((sum, d) => sum + d.mtdVariance, 0) / filteredData.length).toFixed(1)
    };
  }, [filteredData]);

  // Cluster performance
  const clusterData = useMemo(() => {
    const clusters = {};
    processedData.forEach(branch => {
      if (!clusters[branch.cluster]) {
        clusters[branch.cluster] = { cluster: branch.cluster, branches: [], totalTarget: 0, totalActual: 0 };
      }
      clusters[branch.cluster].branches.push(branch);
      clusters[branch.cluster].totalTarget += branch.mtdTarget;
      clusters[branch.cluster].totalActual += branch.mtdActual;
    });
    
    return Object.values(clusters).map(cluster => ({
      ...cluster,
      performance: ((cluster.totalActual / cluster.totalTarget) * 100).toFixed(1),
      branchCount: cluster.branches.length
    })).sort((a, b) => b.performance - a.performance);
  }, [processedData]);

  // Performance distribution
  const performanceDistribution = useMemo(() => {
    const categories = {};
    filteredData.forEach(branch => {
      const cat = branch.performanceCategory;
      if (!categories[cat]) categories[cat] = { name: cat, value: 0, color: branch.performanceColor };
      categories[cat].value++;
    });
    return Object.values(categories);
  }, [filteredData]);

  // Get unique clusters for filter
  const clusters = ['All', ...new Set(processedData.map(d => d.cluster))];

  // Top and bottom performers
  const topPerformers = [...filteredData].sort((a, b) => b.mtdVariance - a.mtdVariance).slice(0, 3);
  const bottomPerformers = [...filteredData].sort((a, b) => a.mtdVariance - b.mtdVariance).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#1e2939]">
      {/* Navigation */}
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mr-2">
            Dashboard
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <Link href="/reports" className="text-blue-400 hover:text-blue-300 mr-2">
            Reports
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-white">Chart View</span>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Branch Performance Dashboard</h1>
              <div className="flex items-center">
                <p className="text-gray-400 mr-2">
                  {isRealTimeData ? (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      Real-time insights
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Sample data
                    </span>
                  )}
                </p>
                {lastRefreshed && (
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(lastRefreshed).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="h-1 w-24 bg-purple-600 rounded-full mt-2"></div>
            </div>
            <div className="flex space-x-3">
              <select 
                value={selectedCluster} 
                onChange={(e) => setSelectedCluster(e.target.value)}
                className="bg-slate-700 text-white rounded-lg border border-slate-600 px-4 py-2"
                disabled={loading}
              >
                {clusters.map(cluster => (
                  <option key={cluster} value={cluster}>{cluster}</option>
                ))}
              </select>
              <RefreshButton onClick={fetchData} isLoading={loading} />
              <button className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="bg-slate-700 p-4 rounded-lg mb-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mr-3"></div>
              <p className="text-white">Loading real-time data...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-700 p-4 rounded-lg mb-6">
              <p className="text-red-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
              <p className="text-red-400 text-sm mt-1">Showing sample data instead.</p>
            </div>
          )}
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Daily Achievement */}
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Daily Achievement</p>
                  <p className="text-3xl font-bold text-white mt-1">{kpis.dailyAchievement}%</p>
                  <p className="text-sm text-gray-400 mt-1">vs Target</p>
                </div>
                <div className="p-3 bg-slate-600 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center mt-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <span className="text-sm font-medium text-red-400">
                  {Math.abs(100 - parseFloat(kpis.dailyAchievement)).toFixed(1)}% vs target
                </span>
              </div>
            </div>
            
            {/* MTD Achievement */}
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">MTD Achievement</p>
                  <p className="text-3xl font-bold text-white mt-1">{kpis.mtdAchievement}%</p>
                  <p className="text-sm text-gray-400 mt-1">Month to Date</p>
                </div>
                <div className="p-3 bg-slate-600 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center mt-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <span className="text-sm font-medium text-red-400">
                  {Math.abs(100 - parseFloat(kpis.mtdAchievement)).toFixed(1)}% vs target
                </span>
              </div>
            </div>
            
            {/* Total Branches */}
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Total Branches</p>
                  <p className="text-3xl font-bold text-white mt-1">{kpis.totalBranches}</p>
                  <p className="text-sm text-gray-400 mt-1">Active locations</p>
                </div>
                <div className="p-3 bg-slate-600 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Avg Performance */}
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Avg Performance</p>
                  <p className="text-3xl font-bold text-white mt-1">{kpis.avgPerformance}%</p>
                  <p className="text-sm text-gray-400 mt-1">Average variance</p>
                </div>
                <div className="p-3 bg-slate-600 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cluster Performance */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <div className="w-2 h-8 bg-purple-600 rounded-full mr-3"></div>
              Cluster Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clusterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="cluster" tick={{ fill: 'white', fontSize: 12 }} />
                <YAxis tick={{ fill: 'white', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value) => [`${value}%`, 'Achievement']} 
                />
                <Bar 
                  dataKey="performance" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Distribution */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <div className="w-2 h-8 bg-cyan-500 rounded-full mr-3"></div>
              Performance Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {performanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Performance Matrix */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="w-2 h-8 bg-green-500 rounded-full mr-3"></div>
            Branch Performance Matrix
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="dailyAchievement" 
                name="Daily Achievement %" 
                tick={{ fill: 'white', fontSize: 12 }}
              />
              <YAxis 
                dataKey="mtdVariance" 
                name="MTD Variance %" 
                tick={{ fill: 'white', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  borderRadius: '8px',
                  color: 'white'
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-800 p-4 border border-slate-600 rounded-lg shadow-lg">
                        <p className="font-semibold text-white text-lg">{data.branch}</p>
                        <p className="text-gray-300">Cluster: {data.cluster}</p>
                        <p className="text-blue-400">Daily: {data.dailyAchievement.toFixed(1)}%</p>
                        <p className="text-purple-400">MTD: {data.mtdVariance}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="mtdVariance" fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Top and Bottom Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Top Performers
            </h3>
            <div className="space-y-4">
              {topPerformers.map((branch) => (
                <div key={branch.branch} className="flex items-center justify-between p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                  <div>
                    <p className="font-semibold text-white text-lg">{branch.branch}</p>
                    <p className="text-sm text-gray-300">{branch.cluster}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${branch.mtdVariance > 0 ? 'text-green-400' : 'text-red-400'} text-xl`}>{branch.mtdVariance}%</p>
                    <p className="text-sm text-gray-400">{branch.mtdActual}/{branch.mtdTarget}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Performers */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Needs Attention
            </h3>
            <div className="space-y-4">
              {bottomPerformers.map((branch) => (
                <div key={branch.branch} className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                  <div>
                    <p className="font-semibold text-white text-lg">{branch.branch}</p>
                    <p className="text-sm text-gray-300">{branch.cluster}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-400 text-xl">{branch.mtdVariance}%</p>
                    <p className="text-sm text-gray-400">{branch.mtdActual}/{branch.mtdTarget}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartView; 
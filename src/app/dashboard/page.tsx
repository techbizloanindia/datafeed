"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, CreditCard, FileText, DollarSign, Filter, Calendar, MapPin, LogOut } from 'lucide-react';
import GoogleSheetsAuth from '../components/GoogleSheetsAuth';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import RefreshButton from '../components/RefreshButton';
import RoleBasedDataView from '../components/RoleBasedDataView';
import RoleBasedDataTable from '../components/RoleBasedDataTable';

const Dashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedMetric, setSelectedMetric] = useState('visits');
  const [timeframe, setTimeframe] = useState('MTD');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(60); // seconds
  const { user } = useUser();
  const router = useRouter();

  // Branch clusters mapping for role-based filtering
  const branchClusters = useMemo(() => ({
    'Gurugram': ['Gurugram', 'Pataudi', 'Sohna'],
    'Faridabad': ['Faridabad', 'Palwal', 'Ballabgarh'],
    'Karnataka': ['Bangalore', 'Davanagere', 'Mandya', 'Yelahanka'],
    'Delhi': ['Delhi North', 'Delhi South', 'Delhi East', 'Delhi West'],
    'Ghaziabad': ['Ghaziabad', 'Noida', 'Greater Noida']
  }), []);

  // Update current date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (autoRefreshEnabled && user) {
      timer = setInterval(() => {
        fetchDashboardData();
      }, autoRefreshInterval * 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRefreshEnabled, autoRefreshInterval, user, timeframe, selectedRegion]);

  // Format current date
  const formattedDate = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [currentDate]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Build URL with query parameters for role-based filtering
      let url = new URL('/api/dashboard-data', window.location.origin);
      
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
      
      // Add timeframe parameter
      url.searchParams.append('timeframe', timeframe);
      
      // Add region filter if not 'All'
      if (selectedRegion !== 'All') {
        url.searchParams.append('region', selectedRegion);
      }
      
      // Add cache-busting parameter for real-time data
      url.searchParams.append('_t', new Date().getTime().toString());
      
      const response = await fetch(url.toString(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      setDashboardData(result);
      setLastRefreshed(new Date().toISOString());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, timeframe, selectedRegion]);

  // Transform data for branch target leads chart
  const transformBranchLeadsData = (data: any[]) => {
    return {
      labels: data.map(item => item.branch || item.branchName),
      datasets: [
        {
          label: 'Target Leads',
          data: data.map(item => item.mtdTargetLeads),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1
        },
        {
          label: 'Actual Leads',
          data: data.map(item => item.mtdActualLeads),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }
      ]
    };
  };

  // Transform data for branch disbursement chart
  const transformDisbursementData = (data: any[]) => {
    return {
      labels: data.map(item => item.branchName),
      datasets: [
        {
          label: 'Target Disbursements',
          data: data.map(item => item.mtdDisbursementTargetNos),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        },
        {
          label: 'Actual Disbursements',
          data: data.map(item => item.mtdDisbursementActualNos),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1
        }
      ]
    };
  };

  // Fallback metrics in case API fails
  const fallbackMetrics = [
    { label: 'Sales Buddy Login', target: 8190, actual: 3084, achievement: 38, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed Lead', target: 1170, actual: 641, achievement: 55, icon: Target, color: 'from-green-500 to-green-600' },
    { label: 'Credit Login in LOS', target: 430, actual: 228, achievement: 53, icon: CreditCard, color: 'from-purple-500 to-purple-600' },
    { label: 'Cases Sanction', target: 301, actual: 58, achievement: 19.3, icon: FileText, color: 'from-orange-500 to-orange-600' },
    { label: 'Cases Disbursed', target: 259, actual: 4, achievement: 1.5, icon: DollarSign, color: 'from-red-500 to-red-600' }
  ];

  // Convert API data to metrics format
  const overallMetrics = useMemo(() => {
    if (!dashboardData || !dashboardData.kpis) return fallbackMetrics;
    
    const { kpis } = dashboardData;
    
    return [
      { 
        label: 'Sales Buddy Login', 
        target: kpis.salesBuddyLogin.target, 
        actual: kpis.salesBuddyLogin.actual, 
        achievement: kpis.salesBuddyLogin.achievement, 
        icon: Users, 
        color: 'from-blue-500 to-blue-600' 
      },
      { 
        label: 'Completed Lead', 
        target: kpis.completedLead.target, 
        actual: kpis.completedLead.actual, 
        achievement: kpis.completedLead.achievement, 
        icon: Target, 
        color: 'from-green-500 to-green-600' 
      },
      { 
        label: 'Credit Login in LOS', 
        target: kpis.creditLogin.target, 
        actual: kpis.creditLogin.actual, 
        achievement: kpis.creditLogin.achievement, 
        icon: CreditCard, 
        color: 'from-purple-500 to-purple-600' 
      },
      { 
        label: 'Cases Sanction', 
        target: kpis.casesSanctioned.target, 
        actual: kpis.casesSanctioned.actual, 
        achievement: kpis.casesSanctioned.achievement, 
        icon: FileText, 
        color: 'from-orange-500 to-orange-600' 
      },
      { 
        label: 'Cases Disbursed', 
        target: kpis.casesDisbursed.target, 
        actual: kpis.casesDisbursed.actual, 
        achievement: kpis.casesDisbursed.achievement, 
        icon: DollarSign, 
        color: 'from-red-500 to-red-600' 
      }
    ];
  }, [dashboardData]);

  const getMetricColor = (achievement) => {
    if (achievement >= 70) return 'text-green-600 bg-green-50';
    if (achievement >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressColor = (achievement) => {
    if (achievement >= 70) return 'bg-green-500';
    if (achievement >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Define columns for the branch target leads table
  const branchLeadsColumns = [
    { key: 'branch', header: 'Branch' },
    { key: 'cluster', header: 'Cluster' },
    { key: 'mtdTargetLeads', header: 'MTD Target' },
    { key: 'mtdActualLeads', header: 'MTD Actual' },
    { 
      key: 'mtdVariancePercentage', 
      header: 'Variance %',
      format: (value: number) => {
        const color = value >= 0 ? 'text-green-600' : 'text-red-600';
        return <span className={color}>{value.toFixed(2)}%</span>;
      }
    }
  ];

  // Define columns for the branch disbursement table
  const disbursementColumns = [
    { key: 'branchName', header: 'Branch' },
    { key: 'cluster', header: 'Cluster' },
    { key: 'mtdDisbursementTargetNos', header: 'MTD Target' },
    { key: 'mtdDisbursementActualNos', header: 'MTD Actual' },
    { 
      key: 'mtdVariancePercentage', 
      header: 'Variance %',
      format: (value: number) => {
        const color = value >= 0 ? 'text-green-600' : 'text-red-600';
        return <span className={color}>{value.toFixed(2)}%</span>;
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DataFeed
              </h1>
              <p className="text-slate-600 mt-2">Real-time insights into sales and lending performance</p>
              
              {/* Current Date Display */}
              <div className="flex items-center mt-2 text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">{formattedDate}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <GoogleSheetsAuth />
              
              <div className="flex flex-col">
                <RefreshButton 
                  onRefresh={fetchDashboardData} 
                  isLoading={loading}
                  lastRefreshed={lastRefreshed}
                  buttonText="Refresh Dashboard"
                  isRealTimeData={dashboardData?.dataSource === 'real-time'}
                />
                
                <div className="flex items-center mt-2">
                  <input 
                    type="checkbox" 
                    id="autoRefresh" 
                    checked={autoRefreshEnabled}
                    onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="autoRefresh" className="text-xs text-gray-600">
                    Auto-refresh every 
                  </label>
                  <select 
                    value={autoRefreshInterval}
                    onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                    className="ml-1 text-xs border border-gray-300 rounded p-1"
                  >
                    <option value="30">30s</option>
                    <option value="60">1m</option>
                    <option value="300">5m</option>
                    <option value="600">10m</option>
                  </select>
                </div>
              </div>
              
              <select 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Daily">Daily</option>
                <option value="MTD">Month to Date</option>
                <option value="QTD">Quarter to Date</option>
                <option value="YTD">Year to Date</option>
              </select>
              
              <select 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Regions</option>
                <option value="North">North</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {overallMetrics.map((metric, index) => {
            const Icon = metric.icon;
            
            // Determine colors based on metric type and achievement
            let headerBgColor, barColor;
            switch(metric.label) {
              case 'Sales Buddy Login':
                headerBgColor = 'bg-blue-600';
                barColor = metric.achievement >= 50 ? 'bg-green-500' : 
                           metric.achievement >= 30 ? 'bg-amber-500' : 'bg-red-500';
                break;
              case 'Completed Lead':
                headerBgColor = 'bg-green-600';
                barColor = metric.achievement >= 50 ? 'bg-green-500' : 
                           metric.achievement >= 30 ? 'bg-amber-500' : 'bg-red-500';
                break;
              case 'Credit Login in LOS':
                headerBgColor = 'bg-purple-600';
                barColor = metric.achievement >= 50 ? 'bg-green-500' : 
                           metric.achievement >= 30 ? 'bg-amber-500' : 'bg-red-500';
                break;
              case 'Cases Sanction':
                headerBgColor = 'bg-orange-500';
                barColor = metric.achievement >= 50 ? 'bg-green-500' : 
                           metric.achievement >= 30 ? 'bg-amber-500' : 'bg-red-500';
                break;
              case 'Cases Disbursed':
                headerBgColor = 'bg-red-600';
                barColor = metric.achievement >= 50 ? 'bg-green-500' : 
                           metric.achievement >= 30 ? 'bg-amber-500' : 'bg-red-500';
                break;
              default:
                headerBgColor = 'bg-blue-600';
                barColor = 'bg-blue-500';
            }
            
            // Determine text color for achievement
            const achievementColor = metric.achievement >= 50 ? 'text-green-600' : 
                                   metric.achievement >= 30 ? 'text-amber-500' : 'text-red-600';
            
            return (
              <div key={metric.label} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`p-4 ${headerBgColor}`}>
                  <div className="text-white font-bold uppercase">{metric.label}</div>
                </div>
                
                <div className="grid grid-cols-3 text-center border-b border-gray-200">
                  <div className="py-2 px-1">
                    <div className="text-xs text-gray-500">TARGET</div>
                    <div className="font-bold text-gray-800">{metric.target.toLocaleString()}</div>
                  </div>
                  <div className="py-2 px-1 border-l border-r border-gray-200">
                    <div className="text-xs text-gray-500">ACTUAL</div>
                    <div className="font-bold text-gray-800">{metric.actual.toLocaleString()}</div>
                  </div>
                  <div className="py-2 px-1">
                    <div className="text-xs text-gray-500">ACHIEVEMENT</div>
                    <div className={`font-bold ${achievementColor}`}>{metric.achievement}%</div>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-100">
                  <div 
                    className={`h-full ${barColor}`}
                    style={{ width: `${Math.min(metric.achievement, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Role-based data views */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RoleBasedDataView
            userData={user}
            title="Branch Target Leads"
            endpoint="/api/branch-target-leads"
            chartType="bar"
            height={300}
            branchClusters={branchClusters}
            dataTransformer={transformBranchLeadsData}
            filterField="branch"
            showRefresh={true}
            reportLink="/reports/branch-leads"
            description="Monthly target vs. actual leads by branch"
            refreshInterval={autoRefreshEnabled ? autoRefreshInterval : 0} 
          />
          
          <RoleBasedDataView
            userData={user}
            title="Branch Disbursements"
            endpoint="/api/branch-disbursement-data"
            chartType="bar"
            height={300}
            branchClusters={branchClusters}
            dataTransformer={transformDisbursementData}
            filterField="branchName"
            showRefresh={true}
            reportLink="/reports/disbursements"
            description="Monthly target vs. actual disbursements by branch"
            refreshInterval={autoRefreshEnabled ? autoRefreshInterval : 0}
          />
        </div>
        
        {/* Role-based data tables */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <RoleBasedDataTable
            userData={user}
            title="Branch Target Leads Details"
            endpoint="/api/branch-target-leads"
            columns={branchLeadsColumns}
            branchClusters={branchClusters}
            filterField="branch"
            showRefresh={true}
            reportLink="/reports/branch-leads"
            maxRows={5}
            refreshInterval={autoRefreshEnabled ? autoRefreshInterval : 0}
          />
          
          <RoleBasedDataTable
            userData={user}
            title="Branch Disbursement Details"
            endpoint="/api/branch-disbursement-data"
            columns={disbursementColumns}
            branchClusters={branchClusters}
            filterField="branchName"
            showRefresh={true}
            reportLink="/reports/disbursements"
            maxRows={5}
            refreshInterval={autoRefreshEnabled ? autoRefreshInterval : 0}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
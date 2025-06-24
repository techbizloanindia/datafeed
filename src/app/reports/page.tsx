"use client";

import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Calendar, FileText, BarChart3, PieChart, LineChart } from 'lucide-react';
import Link from 'next/link';

const Reports = () => {
  const [timeframe, setTimeframe] = useState('MTD');
  
  const reportTypes = [
    { 
      title: 'Performance Charts', 
      description: 'Visual representation of performance metrics across branches and clusters',
      icon: BarChart3,
      path: '/reports/chart-view',
      color: 'bg-blue-500'
    },
    { 
      title: 'Cluster Analysis', 
      description: 'Detailed analysis of cluster-wise performance and trends',
      icon: PieChart,
      path: '/reports/chart-view?type=cluster',
      color: 'bg-purple-500'
    },
    { 
      title: 'Branch Comparison', 
      description: 'Compare performance metrics between different branches',
      icon: LineChart,
      path: '/reports/chart-view?type=branch',
      color: 'bg-green-500'
    },
    { 
      title: 'Raw Data Export', 
      description: 'Export raw performance data in various formats',
      icon: FileText,
      path: '/reports/chart-view?type=export',
      color: 'bg-amber-500'
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
                Reports
              </h1>
              <p className="text-slate-600 mt-2">Generate and view detailed performance reports</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
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
            </div>
          </div>
        </div>
        
        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportTypes.map((report, index) => {
            const Icon = report.icon;
            return (
              <Link 
                key={report.title} 
                href={report.path}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden"
              >
                <div className={`${report.color} h-2`}></div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-xl ${report.color} bg-opacity-10`}>
                      <Icon className={`h-6 w-6 ${report.color.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Recent Reports */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Reports</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Report Name</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Generated On</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="font-medium text-gray-800">Monthly Performance Report</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">Today, 9:30 AM</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Chart</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-green-600 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Available
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-purple-500 mr-2" />
                      <span className="font-medium text-gray-800">Cluster Performance Analysis</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">Yesterday, 4:15 PM</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Analysis</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-green-600 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Available
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="font-medium text-gray-800">Raw Data Export</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">Sep 28, 2023, 11:20 AM</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">Export</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-green-600 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Available
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 
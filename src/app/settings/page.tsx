"use client";

import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Bell, Lock, User, Shield, Database, Save } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Settings = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataRefreshInterval, setDataRefreshInterval] = useState('5');
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data Settings', icon: Database },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-600 mt-2">Manage your account preferences and application settings</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-xl shadow-md p-4">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 bg-white rounded-xl shadow-md p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Settings</h2>
                
                {user && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-10 h-10 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                        <p className="text-gray-500">{user.email}</p>
                        <p className="text-sm text-blue-600 mt-1">{user.role}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={user.name}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={user.email}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input
                          type="text"
                          value={user.role}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                      {user.branch && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                          <input
                            type="text"
                            value={user.branch}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                      )}
                      {user.cluster && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cluster</label>
                          <input
                            type="text"
                            value={user.cluster}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Contact your administrator to update your profile information.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">Enhance your account security with 2FA</p>
                        <p className="text-sm text-gray-500 mt-1">Protect your account with an additional layer of security</p>
                      </div>
                      <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Enable 2FA</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">Email Notifications</h3>
                      <p className="text-sm text-gray-500 mt-1">Receive email updates about your account activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notificationsEnabled}
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-3">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input 
                          id="performance-alerts" 
                          type="checkbox" 
                          checked={notificationsEnabled}
                          disabled={!notificationsEnabled}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" 
                        />
                        <label htmlFor="performance-alerts" className="ml-2 text-sm font-medium text-gray-700">
                          Performance Alerts
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          id="report-ready" 
                          type="checkbox" 
                          checked={notificationsEnabled}
                          disabled={!notificationsEnabled}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" 
                        />
                        <label htmlFor="report-ready" className="ml-2 text-sm font-medium text-gray-700">
                          Report Ready Notifications
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          id="system-updates" 
                          type="checkbox" 
                          checked={notificationsEnabled}
                          disabled={!notificationsEnabled}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" 
                        />
                        <label htmlFor="system-updates" className="ml-2 text-sm font-medium text-gray-700">
                          System Updates
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'data' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Data Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Data Refresh Interval</h3>
                    <p className="text-sm text-gray-500 mb-3">Control how often the dashboard data is automatically refreshed</p>
                    <select
                      value={dataRefreshInterval}
                      onChange={(e) => setDataRefreshInterval(e.target.value)}
                      className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">Every 1 minute</option>
                      <option value="5">Every 5 minutes</option>
                      <option value="15">Every 15 minutes</option>
                      <option value="30">Every 30 minutes</option>
                      <option value="60">Every hour</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-3">Google Sheets Connection</h3>
                    <p className="text-sm text-gray-500 mb-3">Manage your connection to Google Sheets data source</p>
                    <div className="flex items-center gap-4">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        <span>Reconnect to Google Sheets</span>
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                        Test Connection
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-3">Data Export Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="px-4 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-left">
                        <span className="font-medium">Export to Excel</span>
                        <p className="text-xs text-gray-500 mt-1">Download dashboard data as Excel spreadsheet</p>
                      </button>
                      <button className="px-4 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-left">
                        <span className="font-medium">Export to CSV</span>
                        <p className="text-xs text-gray-500 mt-1">Download dashboard data as CSV file</p>
                      </button>
                    </div>
                  </div>
                  
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 
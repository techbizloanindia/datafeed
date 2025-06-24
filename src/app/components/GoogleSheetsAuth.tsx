"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const GoogleSheetsAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
    sheetNames?: string[];
  } | null>(null);
  const router = useRouter();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuth();
    
    // Set up periodic auth check
    const interval = setInterval(() => {
      checkAuth(false);
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async (showLoading = true) => {
    if (showLoading) {
      setIsChecking(true);
    }
    setError(null);
    try {
      // Try to fetch a simple test endpoint that requires authentication
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check authentication status');
      }
      
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      
      if (data.authenticated) {
        setLastRefreshed(new Date(data.lastChecked));
        
        // Set connection status if available
        if (data.sheetsConnection) {
          setConnectionStatus(data.sheetsConnection);
        }
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      setIsAuthenticated(false);
      setError('Connection check failed');
    } finally {
      if (showLoading) {
        setIsChecking(false);
      }
    }
  };

  // Handle authentication button click
  const handleAuthClick = () => {
    setError(null);
    try {
      router.push('/api/auth');
    } catch (error) {
      console.error('Error navigating to auth page:', error);
      setError('Authentication failed');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setError(null);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      setIsAuthenticated(false);
      setLastRefreshed(null);
      setConnectionStatus(null);
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Logout failed');
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    await checkAuth();
  };

  // Format last refreshed time
  const getLastRefreshedText = () => {
    if (!lastRefreshed) return '';
    
    return lastRefreshed.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // If authentication status is still being checked
  if (isChecking && isAuthenticated === null) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Checking connection...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {isAuthenticated ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${
              connectionStatus?.success 
                ? 'bg-green-50 border-green-100' 
                : 'bg-yellow-50 border-yellow-100'
            }`}>
              <svg 
                className={`w-4 h-4 ${connectionStatus?.success ? 'text-green-600' : 'text-yellow-600'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {connectionStatus?.success ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                )}
              </svg>
              <span className={`text-sm font-medium ${connectionStatus?.success ? 'text-green-700' : 'text-yellow-700'}`}>
                {connectionStatus?.success 
                  ? 'Connected to Google Sheets' 
                  : connectionStatus?.message || 'Connection issue'}
              </span>
              
              {connectionStatus?.success && (
                <span className="inline-flex items-center px-2 py-0.5 ml-2 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  REAL DATA
                </span>
              )}
            </div>
            
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Refresh connection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <button
              onClick={handleLogout}
              className="text-xs text-red-500 hover:text-red-700 hover:underline"
            >
              Disconnect
            </button>
          </div>
          
          {connectionStatus?.success && connectionStatus.sheetNames && connectionStatus.sheetNames.length > 0 && (
            <div className="text-xs text-gray-600 ml-1">
              Available sheets: {connectionStatus.sheetNames.slice(0, 3).join(', ')}
              {connectionStatus.sheetNames.length > 3 && ` +${connectionStatus.sheetNames.length - 3} more`}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleAuthClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span>Connect to Google Sheets</span>
          </button>
          
          {error && (
            <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Using mock data until connected</span>
          </div>
        </div>
      )}
      
      {lastRefreshed && (
        <div className="text-xs text-gray-500 mt-1">
          Last refreshed: {getLastRefreshedText()}
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsAuth; 
import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

interface RefreshButtonProps {
  onRefresh?: () => Promise<void>;
  onClick?: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
  lastRefreshed?: string | null;
  showLastRefreshed?: boolean;
  buttonText?: string;
  isRealTimeData?: boolean;
}

export default function RefreshButton({
  onRefresh,
  onClick,
  isLoading = false,
  className = '',
  lastRefreshed = null,
  showLastRefreshed = true,
  buttonText = 'Refresh Data',
  isRealTimeData = true
}: RefreshButtonProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [timeSinceRefresh, setTimeSinceRefresh] = useState<string>('');

  // Update time since refresh every second
  useEffect(() => {
    if (!lastRefreshed) return;
    
    const updateTimeSinceRefresh = () => {
      const lastRefreshTime = new Date(lastRefreshed).getTime();
      const now = new Date().getTime();
      const diffSeconds = Math.floor((now - lastRefreshTime) / 1000);
      
      if (diffSeconds < 60) {
        setTimeSinceRefresh(`${diffSeconds}s ago`);
      } else if (diffSeconds < 3600) {
        setTimeSinceRefresh(`${Math.floor(diffSeconds / 60)}m ago`);
      } else {
        setTimeSinceRefresh(`${Math.floor(diffSeconds / 3600)}h ago`);
      }
    };
    
    updateTimeSinceRefresh();
    const interval = setInterval(updateTimeSinceRefresh, 1000);
    
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  const handleClick = async () => {
    setIsSpinning(true);
    
    // Support both onClick and onRefresh interfaces
    if (onClick) {
      await onClick();
    } else if (onRefresh) {
      await onRefresh();
    }
    
    // Only set spinning to false if isLoading is not provided
    if (!isLoading) {
      setTimeout(() => setIsSpinning(false), 1000);
    }
  };

  // Format the last refreshed time
  const formatLastRefreshed = (timestamp: string) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp;
    }
  };

  return (
    <div className="flex flex-col items-end">
      <div className="relative">
        <button
          onClick={handleClick}
          disabled={isLoading}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
          className={`flex items-center px-4 py-2 text-white bg-[#7f7acf] hover:bg-[#6c67b5] rounded-lg disabled:opacity-50 transition-colors shadow-md hover:shadow-lg ${className}`}
        >
          <FiRefreshCw 
            className={`h-5 w-5 mr-2 ${isLoading || isSpinning ? 'animate-spin' : ''}`}
          />
          {isLoading ? 'Refreshing...' : buttonText}
          
          {isRealTimeData && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="h-2 w-2 mr-1 rounded-full bg-green-500 animate-pulse"></span>
              REAL-TIME
            </span>
          )}
        </button>
        
        {tooltipVisible && lastRefreshed && (
          <div className="absolute bottom-full mb-2 right-0 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Last refreshed: {formatLastRefreshed(lastRefreshed)}
          </div>
        )}
      </div>
      
      {showLastRefreshed && lastRefreshed && (
        <div className="text-xs text-gray-500 mt-1">
          {timeSinceRefresh ? `Updated ${timeSinceRefresh}` : `Last refreshed: ${formatLastRefreshed(lastRefreshed)}`}
        </div>
      )}
    </div>
  );
} 
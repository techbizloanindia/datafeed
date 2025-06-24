"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import DataFeedLogo from "../../components/DataFeedLogo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Check if admin is authenticated via session storage
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated") === "true";
    
    if (isAuthenticated) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
      if (pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    }
    setLoading(false);
  }, [router, pathname]);

  // Don't apply layout to login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7f7acf] border-t-transparent"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Will redirect in the useEffect
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white text-gray-800 transition-all duration-300 ease-in-out flex flex-col border-r border-gray-200`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#7f7acf] rounded-md flex items-center justify-center mr-2">
                <span className="font-bold text-white">DF</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">DATAFEED</h1>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 bg-[#7f7acf] rounded-md flex items-center justify-center mx-auto">
              <span className="font-bold text-white">DF</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-500 hover:text-gray-800"
          >
            {sidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

                <nav className="mt-6 flex-1">
          <ul>
            <li>
              <Link 
                href="/admin/dashboard" 
                className={`flex items-center px-4 py-3 ${pathname === '/admin/dashboard' ? 'bg-[#7f7acf] text-white' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                {!sidebarCollapsed && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users" 
                className={`flex items-center px-4 py-3 ${pathname === '/admin/users' ? 'bg-[#7f7acf] text-white' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                {!sidebarCollapsed && <span>User List</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users/create" 
                className={`flex items-center px-4 py-3 ${pathname === '/admin/users/create' ? 'bg-[#7f7acf] text-white' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                {!sidebarCollapsed && <span>Create User</span>}
              </Link>
            </li>
          </ul>
        </nav>

      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow z-10 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {pathname === '/admin/dashboard' && 'Dashboard'}
                {pathname === '/admin/users' && 'User Management'}
                {pathname === '/admin/users/create' && 'Create New User'}
              </h2>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-700 hover:text-white hover:bg-[#7f7acf] rounded-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto bg-white">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 
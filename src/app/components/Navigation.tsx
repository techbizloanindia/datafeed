"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "../context/UserContext";
import DataFeedLogo from "./DataFeedLogo";
import { LogOut, User, MapPin, Building, ChevronDown } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useUser();

  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <DataFeedLogo size="small" />
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">DATAFEED</span>
            </Link>
          </div>
          
          {/* Main Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/dashboard') 
                  ? 'bg-[#7f7acf] text-white' 
                  : 'text-gray-700 hover:bg-[#f0f0fa] hover:text-[#7f7acf]'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/reports" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/reports') 
                  ? 'bg-[#7f7acf] text-white' 
                  : 'text-gray-700 hover:bg-[#f0f0fa] hover:text-[#7f7acf]'
              }`}
            >
              Reports
            </Link>
            <Link 
              href="/settings" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/settings') 
                  ? 'bg-[#7f7acf] text-white' 
                  : 'text-gray-700 hover:bg-[#f0f0fa] hover:text-[#7f7acf]'
              }`}
            >
              Settings
            </Link>
          </div>
          
          {/* User Menu - Desktop */}
          {user && (
            <div className="hidden md:block relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">User Information</p>
                  </div>
                  
                  <div className="p-3 space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Role</p>
                        <p className="text-sm font-medium text-gray-800">{user.role}</p>
                      </div>
                    </div>
                    
                    {user.cluster && (
                      <div className="flex items-start gap-3">
                        <Building className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Cluster</p>
                          <p className="text-sm font-medium text-gray-800">{user.cluster}</p>
                        </div>
                      </div>
                    )}
                    
                    {user.branch && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Branch</p>
                          <p className="text-sm font-medium text-gray-800">{user.branch || "All Branches"}</p>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 focus:outline-none text-[#7f7acf]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
            {/* User Role Info (Mobile) */}
            {user && (
              <div className="px-3 py-3 bg-gray-50 rounded-md mb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 border-t border-gray-200 pt-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-xs text-gray-500">Role:</span> 
                      <span className="text-sm font-medium text-gray-800 ml-1">{user.role}</span>
                    </div>
                  </div>
                  
                  {user.cluster && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-purple-600" />
                      <div>
                        <span className="text-xs text-gray-500">Cluster:</span>
                        <span className="text-sm font-medium text-gray-800 ml-1">{user.cluster}</span>
                      </div>
                    </div>
                  )}
                  
                  {user.branch && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <div>
                        <span className="text-xs text-gray-500">Branch:</span>
                        <span className="text-sm font-medium text-gray-800 ml-1">{user.branch || "All Branches"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Link 
              href="/dashboard" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/dashboard') 
                  ? 'bg-[#7f7acf] text-white' 
                  : 'text-gray-700 hover:bg-[#f0f0fa] hover:text-[#7f7acf]'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/reports" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/reports') 
                  ? 'bg-[#7f7acf] text-white' 
                  : 'text-gray-700 hover:bg-[#f0f0fa] hover:text-[#7f7acf]'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Reports
            </Link>
            <Link 
              href="/settings" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/settings') 
                  ? 'bg-[#7f7acf] text-white' 
                  : 'text-gray-700 hover:bg-[#f0f0fa] hover:text-[#7f7acf]'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Settings
            </Link>
            <button 
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
} 
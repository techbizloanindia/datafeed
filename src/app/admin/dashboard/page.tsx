"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  createdAt: string;
  role?: string;
  branch?: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("All Roles");

  // Fetch users from localStorage
  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get users from localStorage
      const usersJSON = localStorage.getItem("users");
      if (usersJSON) {
        const userList = JSON.parse(usersJSON);
        setUsers(userList);
      } else {
        // Initialize with empty array if no users exist
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    fetchUsers();
  };

  // Filter users based on selected role
  const filteredUsers = selectedRole === "All Roles" 
    ? users 
    : users.filter(user => user.role === selectedRole);

  // Get unique roles for filter
  const roles = ["All Roles", ...new Set(users.map(user => user.role || "Unknown"))];

  // Calculate user statistics
  const calculateUserStats = () => {
    if (users.length === 0) return null;
    
    const totalUsers = users.length;
    const branchLevelUsers = users.filter(user => user.role === "Branch Level").length;
    const clusterLevelUsers = users.filter(user => user.role === "Cluster Level").length;
    const ceoUsers = users.filter(user => user.role === "Chief Executive Officer").length;
    
    // Count unique branches
    const uniqueBranches = new Set();
    users.forEach(user => {
      if (user.branch) uniqueBranches.add(user.branch);
    });
    
    return {
      totalUsers,
      branchLevelUsers,
      clusterLevelUsers,
      ceoUsers,
      uniqueBranches: uniqueBranches.size
    };
  };

  const userStats = calculateUserStats();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !refreshing) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#9a99dc] border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 texture-bg">
      {/* Dashboard Header */}
      <div className="card texture-card">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">User management and information</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            {/* Role Filter */}
            <div className="flex items-center">
              <label htmlFor="role-select" className="form-label mr-2 mb-0">Role:</label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="form-select w-auto"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-secondary"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh
                </>
              )}
            </button>
            
            {/* Create User Button */}
            <Link 
              href="/admin/users/create" 
              className="btn btn-primary"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create User
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* User Statistics */}
      {userStats && (
        <div className="responsive-grid md:grid-cols-4">
          {/* Total Users */}
          <div className="card texture-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h2>
            <div className="flex justify-between items-center">
              <div className="bg-[#f0f0fa] p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9a99dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{userStats.totalUsers}</p>
                <p className="text-xs text-gray-600">Registered Users</p>
              </div>
            </div>
          </div>

          {/* Branch Level Users */}
          <div className="card texture-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Branch Level</h2>
            <div className="flex justify-between items-center">
              <div className="bg-[#f0f0fa] p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9a99dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{userStats.branchLevelUsers}</p>
                <p className="text-xs text-gray-600">Branch Level Users</p>
              </div>
            </div>
          </div>

          {/* Cluster Level Users */}
          <div className="card texture-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Cluster Level</h2>
            <div className="flex justify-between items-center">
              <div className="bg-[#f0f0fa] p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9a99dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{userStats.clusterLevelUsers}</p>
                <p className="text-xs text-gray-600">Cluster Level Users</p>
              </div>
            </div>
          </div>

          {/* Unique Branches */}
          <div className="card texture-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Branches</h2>
            <div className="flex justify-between items-center">
              <div className="bg-[#f0f0fa] p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9a99dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{userStats.uniqueBranches}</p>
                <p className="text-xs text-gray-600">Unique Branches</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="card texture-card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">User List</h2>
          <p className="text-gray-600 text-sm">Manage system users</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Employee ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Branch
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#9a99dc]">
                      {user.employeeId}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {user.role || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {user.branch || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link href={`/admin/users`} className="text-[#9a99dc] hover:text-[#8180c7]">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
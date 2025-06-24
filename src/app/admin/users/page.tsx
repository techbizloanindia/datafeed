"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role?: string;
  roles?: string[];
  branch?: string | null;
  cluster?: string | null;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [clusterFilter, setClusterFilter] = useState("");
  const [clusters, setClusters] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    "Branch Level", "Cluster Level", "Chief Executive Officer", "Admin", "Manager"
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch users from localStorage on component mount
  useEffect(() => {
    const fetchUsers = () => {
      try {
        setIsLoading(true);
        const usersJSON = localStorage.getItem("users");
        const userData = usersJSON ? JSON.parse(usersJSON) : [];
        setUsers(userData);
        setFilteredUsers(userData);
        
        // Extract unique clusters for filtering
        const uniqueClusters = [...new Set(userData
          .filter((user: User) => user.cluster)
          .map((user: User) => user.cluster))]
          .filter(Boolean) as string[];
          
        setClusters(uniqueClusters);
        
        // Extract unique roles for filtering
        const allRoles = new Set<string>();
        userData.forEach((user: User) => {
          if (user.roles && Array.isArray(user.roles)) {
            user.roles.forEach(role => allRoles.add(role));
          } else if (user.role) {
            allRoles.add(user.role);
          }
        });
        
        if (allRoles.size > 0) {
          setAvailableRoles([...allRoles]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Apply filters when search term, role filter, or cluster filter changes
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...users];

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (user) =>
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.employeeId.toLowerCase().includes(term)
        );
      }

      // Apply role filter
      if (roleFilter) {
        filtered = filtered.filter((user) => {
          if (user.roles && Array.isArray(user.roles)) {
            return user.roles.includes(roleFilter);
          }
          return user.role === roleFilter;
        });
      }

      // Apply cluster filter
      if (clusterFilter) {
        filtered = filtered.filter((user) => user.cluster === clusterFilter);
      }

      setFilteredUsers(filtered);
    };

    applyFilters();
  }, [users, searchTerm, roleFilter, clusterFilter]);

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Get current users from localStorage
        const usersJSON = localStorage.getItem("users");
        const currentUsers = usersJSON ? JSON.parse(usersJSON) : [];
        
        // Filter out the user to delete
        const updatedUsers = currentUsers.filter((user: User) => user.id !== userId);
        
        // Save updated users back to localStorage
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        
        // Update state
        setUsers(updatedUsers);
        setSuccessMessage("User deleted successfully");
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user");
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          setError("");
        }, 3000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <Link 
            href="/admin/users/create"
            className="bg-[#7f7acf] hover:bg-[#6c67b5] text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New User
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            <p>{successMessage}</p>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-2 text-gray-700">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf]"
              placeholder="Search by name, email, or employee ID"
            />
          </div>

          <div>
            <label htmlFor="roleFilter" className="block text-sm font-medium mb-2 text-gray-700">
              Filter by Role
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf]"
            >
              <option value="">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="clusterFilter" className="block text-sm font-medium mb-2 text-gray-700">
              Filter by Cluster
            </label>
            <select
              id="clusterFilter"
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf]"
            >
              <option value="">All Clusters</option>
              {clusters.map((cluster) => (
                <option key={cluster} value={cluster}>
                  {cluster}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7f7acf]"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-md">
            <p className="text-gray-500">
              {searchTerm || roleFilter || clusterFilter
                ? "No users match your search criteria"
                : "No users found. Create a new user to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cluster
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.roles && Array.isArray(user.roles) ? (
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role, index) => (
                            <span key={index} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${role === 'Chief Executive Officer' ? 'bg-purple-100 text-purple-800' : 
                                role === 'Cluster Level' ? 'bg-blue-100 text-blue-800' : 
                                role === 'Admin' ? 'bg-red-100 text-red-800' :
                                role === 'Manager' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'}`}>
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'Chief Executive Officer' ? 'bg-purple-100 text-purple-800' : 
                            user.role === 'Cluster Level' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'}`}>
                          {user.role || 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.cluster || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.branch || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
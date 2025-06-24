"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ClusterBranchMap {
  [key: string]: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  employeeId: string;
  role: string;
  roles: string[];
  branch: string | null;
  cluster: string | null;
}

export default function CreateUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("Branch Level");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Branch Level"]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [cluster, setCluster] = useState("");
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [branch, setBranch] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [clusters, setClusters] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [clusterBranchMap, setClusterBranchMap] = useState<ClusterBranchMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showClusterDropdown, setShowClusterDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Available roles
  const availableRoles = ["Branch Level", "Cluster Level", "Chief Executive Officer", "Admin", "Manager"];

  // Fetch clusters and branches on component mount
  useEffect(() => {
    const fetchClusterBranchData = async () => {
      try {
        const response = await fetch('/api/branch-clusters');
        const data = await response.json();
        
        if (data && data.clusters) {
          setClusterBranchMap(data.clusters);
          setClusters(Object.keys(data.clusters));
        }
      } catch (error) {
        console.error("Error fetching clusters and branches:", error);
        // Fallback to mock data
        const mockData = {
          "Gurugram": ["Gurugram", "Bhiwadi", "Rewari"],
          "Karanatka": ["Yelahanka", "Davanagere", "Kengeri", "Ramnagar", "Kanakpura"],
          "Faridabad": ["Faridabad", "Mathura", "Palwal", "Badarpur", "Goverdhan"],
          "Delhi": ["Pitampura", "Panipat", "Alipur"],
          "Ghaziabad": ["East Delhi"],
          "Maharashtra": ["West"]
        };
        setClusterBranchMap(mockData);
        setClusters(Object.keys(mockData));
      }
    };

    fetchClusterBranchData();
  }, []);

  // Update branches when selectedClusters changes
  useEffect(() => {
    if (selectedClusters.length === 0) {
      // No clusters selected, clear branches
      setBranches([]);
      setSelectedBranches([]);
      return;
    }
    
    if (selectedClusters.length === 1) {
      // Single cluster selected
      const selectedCluster = selectedClusters[0];
      if (clusterBranchMap[selectedCluster]) {
        setBranches(clusterBranchMap[selectedCluster]);
        setBranch(""); // Reset branch selection when cluster changes
        setSelectedBranches([]); // Reset selected branches when cluster changes
      }
    } else {
      // Multiple clusters selected
      const allBranches: string[] = [];
      selectedClusters.forEach(clusterName => {
        if (clusterBranchMap[clusterName]) {
          allBranches.push(...clusterBranchMap[clusterName]);
        }
      });
      
      // Remove duplicates and sort alphabetically
      const uniqueBranches = [...new Set(allBranches)].sort();
      setBranches(uniqueBranches);
      setBranch("");
      setSelectedBranches([]); // Reset selected branches when clusters change
    }
  }, [selectedClusters, clusterBranchMap]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.role-dropdown') && showRoleDropdown) {
        setShowRoleDropdown(false);
      }
      if (!target.closest('.cluster-dropdown') && showClusterDropdown) {
        setShowClusterDropdown(false);
      }
      if (!target.closest('.branch-dropdown') && showBranchDropdown) {
        setShowBranchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleDropdown, showClusterDropdown, showBranchDropdown]);

  // Update role when selected roles change
  useEffect(() => {
    if (selectedRoles.length > 0) {
      // Set the primary role to the first selected role
      setRole(selectedRoles[0]);
    } else {
      setRole("Branch Level");
    }
  }, [selectedRoles]);

  // Auto-clear success and error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validate form
    if (!name || !email || !password || !employeeId || selectedRoles.length === 0) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    // Check if Branch Level or Cluster Level roles are selected and validate clusters
    const hasBranchOrClusterRole = selectedRoles.some(r => r === "Branch Level" || r === "Cluster Level");
    if (hasBranchOrClusterRole && selectedClusters.length === 0) {
      setError("Please select at least one cluster");
      setIsLoading(false);
      return;
    }

    // For Branch Level users, require branch selection only if branches are available
    if (selectedRoles.includes("Branch Level") && selectedClusters.length > 0 && selectedBranches.length === 0 && branches.length > 0) {
      setError("Please select at least one branch");
      setIsLoading(false);
      return;
    }

    try {
      // First check localStorage for existing users with this employeeId
      const localUsersJSON = localStorage.getItem("users");
      const localUsers = localUsersJSON ? JSON.parse(localUsersJSON) : [];
      const localUserExists = localUsers.some((user: User) => user.employeeId === employeeId);
      
      if (localUserExists) {
        setError("Employee ID already exists in local storage");
        setIsLoading(false);
        return;
      }
      
      // Then check the API for predefined users
      const checkResponse = await fetch(`/api/users/check-employee-id?employeeId=${employeeId}`);
      const checkData = await checkResponse.json();
      
      if (checkResponse.ok && checkData.success && checkData.user) {
        setError("Employee ID already exists");
        setIsLoading(false);
        return;
      }

      // Prepare cluster and branch data
      let clusterValue = null;
      let branchValue = null;

      // Handle cluster value
      if (hasBranchOrClusterRole && selectedClusters.length > 0) {
        clusterValue = selectedClusters.join(', ');
      }

      // Handle branch value
      if (selectedRoles.includes("Branch Level")) {
        if (selectedBranches.length > 0) {
          branchValue = selectedBranches.join(', ');
        } else if (branches.length === 0 && selectedClusters.length > 0) {
          branchValue = "All Branches";
        }
      } else if (selectedRoles.includes("Chief Executive Officer")) {
        branchValue = "All Branches";
      }

      // Create new user object
      const userData = {
        name,
        email,
        password,
        employeeId,
        role: selectedRoles[0], // Primary role is the first selected role
        roles: selectedRoles, // Store all selected roles
        branch: branchValue,
        cluster: clusterValue
      };

      // Call API to create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      // Store user in localStorage
      try {
        // Get existing users or initialize empty array
        const usersJSON = localStorage.getItem("users");
        const users = usersJSON ? JSON.parse(usersJSON) : [];
        
        // Add new user to the array with the ID from the API response
        const newUser = {
          ...userData,
          id: data.user?.id || `user-${Date.now()}` // Use API ID or generate one
        };
        
      users.push(newUser);
        
        // Save updated users array back to localStorage
      localStorage.setItem("users", JSON.stringify(users));
        
        console.log("User saved to localStorage successfully:", newUser);
      } catch (storageError) {
        console.error("Error saving to localStorage:", storageError);
        // Continue execution even if localStorage fails
      }

      // Show success message and reset form
      setSuccess(`User ${name} (${employeeId}) created successfully!`);
      
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setEmployeeId("");
      setRole("Branch Level");
      setSelectedRoles(["Branch Level"]);
      setCluster("");
      setSelectedClusters([]);
      setBranch("");
      setSelectedBranches([]);
      setShowRoleDropdown(false);
      setShowClusterDropdown(false);
      setShowBranchDropdown(false);
      
      // Optionally redirect to users list after a delay
      // setTimeout(() => router.push('/admin/users'), 2000);
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error instanceof Error ? error.message : "An error occurred while creating the user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Create New User</h1>
          <Link 
            href="/admin/users"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            Back to Users
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded animate-pulse">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded animate-pulse">
            <p className="font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf]"
                placeholder="Enter user's full name"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf]"
                placeholder="Enter user's email address"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium mb-2 text-gray-700">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf]"
                placeholder="Enter unique employee ID"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                This ID will be used for login and must be unique
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
              <input
                id="password"
                  type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf]"
                placeholder="Enter password"
                required
                disabled={isLoading}
              />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium mb-2 text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative role-dropdown">
                <div 
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf] cursor-pointer flex justify-between items-center"
                >
                  <span className={`${selectedRoles.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                    {selectedRoles.length === 0 
                      ? 'Select Role' 
                      : selectedRoles.length === availableRoles.length 
                        ? 'All Roles Selected' 
                        : `${selectedRoles.length} role(s) selected`}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {showRoleDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <label className="inline-flex items-center w-full px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRoles.length === availableRoles.length}
                          onChange={() => {
                            if (selectedRoles.length === availableRoles.length) {
                              setSelectedRoles([]);
                              setRole("Branch Level");
                            } else {
                              setSelectedRoles([...availableRoles]);
                              setRole(availableRoles[0]);
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-[#7f7acf] rounded border-gray-300 focus:ring-[#7f7acf]"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Select All</span>
                      </label>
                    </div>
                    {availableRoles.map((roleName) => (
                      <label key={roleName} className="inline-flex items-center w-full px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(roleName)}
                          onChange={() => {
                            const isSelected = selectedRoles.includes(roleName);
                            let newSelectedRoles;
                            
                            if (isSelected) {
                              newSelectedRoles = selectedRoles.filter(r => r !== roleName);
                            } else {
                              newSelectedRoles = [...selectedRoles, roleName];
                            }
                            
                            setSelectedRoles(newSelectedRoles);
                            if (newSelectedRoles.length > 0) {
                              setRole(newSelectedRoles[0]);
                            } else {
                              setRole("Branch Level");
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-[#7f7acf] rounded border-gray-300 focus:ring-[#7f7acf]"
                        />
                        <span className="ml-2 text-sm text-gray-700">{roleName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {/* Keep the original select but hide it for form submission */}
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="hidden"
                required={selectedRoles.length > 0}
                disabled={isLoading}
              >
                {availableRoles.map((roleName) => (
                  <option key={roleName} value={roleName}>{roleName}</option>
                ))}
              </select>
            </div>

            {/* Cluster selection - only for Branch Level or Cluster Level users */}
            {selectedRoles.some(r => r === "Branch Level" || r === "Cluster Level") && (
              <div className="mb-4">
                <label htmlFor="cluster" className="block text-sm font-medium mb-2 text-gray-700">
                  Cluster {(selectedRoles.includes("Branch Level") || selectedRoles.includes("Cluster Level")) && <span className="text-red-500">*</span>}
                </label>
                <div className="relative cluster-dropdown">
                  <div 
                    onClick={() => setShowClusterDropdown(!showClusterDropdown)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf] cursor-pointer flex justify-between items-center"
                  >
                    <span className={`${selectedClusters.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                      {selectedClusters.length === 0 
                        ? 'Select Cluster' 
                        : selectedClusters.length === clusters.length 
                          ? 'All Clusters Selected' 
                          : selectedClusters.join(', ')}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {showClusterDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200">
                        <label className="inline-flex items-center w-full px-3 py-2 hover:bg-gray-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedClusters.length === clusters.length}
                            onChange={() => {
                              if (selectedClusters.length === clusters.length) {
                                setSelectedClusters([]);
                              } else {
                                setSelectedClusters([...clusters]);
                              }
                            }}
                            className="form-checkbox h-4 w-4 text-[#7f7acf] rounded border-gray-300 focus:ring-[#7f7acf]"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Select All</span>
                        </label>
                      </div>
                      {clusters.map((clusterName) => (
                        <label key={clusterName} className="inline-flex items-center w-full px-3 py-2 hover:bg-gray-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedClusters.includes(clusterName)}
                            onChange={() => {
                              const isSelected = selectedClusters.includes(clusterName);
                              if (isSelected) {
                                setSelectedClusters(selectedClusters.filter(c => c !== clusterName));
                              } else {
                                setSelectedClusters([...selectedClusters, clusterName]);
                              }
                            }}
                            className="form-checkbox h-4 w-4 text-[#7f7acf] rounded border-gray-300 focus:ring-[#7f7acf]"
                          />
                          <span className="ml-2 text-sm text-gray-700">{clusterName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Branch selection - only for Branch Level users */}
            {selectedRoles.includes("Branch Level") && selectedClusters.length > 0 && branches.length > 0 && (
              <div className="mb-4">
                <label htmlFor="branch" className="block text-sm font-medium mb-2 text-gray-700">
                  Branch <span className="text-red-500">*</span>
                </label>
                <div className="relative branch-dropdown">
                  <div 
                    onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf] cursor-pointer flex justify-between items-center"
                  >
                    <span className={`${selectedBranches.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                      {selectedBranches.length === 0 
                        ? 'Select Branch' 
                        : selectedBranches.length === branches.length 
                          ? 'All Branches Selected' 
                          : selectedBranches.join(', ')}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {showBranchDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200">
                        <label className="inline-flex items-center w-full px-3 py-2 hover:bg-gray-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBranches.length === branches.length}
                            onChange={() => {
                              if (selectedBranches.length === branches.length) {
                                setSelectedBranches([]);
                              } else {
                                setSelectedBranches([...branches]);
                              }
                            }}
                            className="form-checkbox h-4 w-4 text-[#7f7acf] rounded border-gray-300 focus:ring-[#7f7acf]"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Select All</span>
                        </label>
                      </div>
                      {branches.map((branchName) => (
                        <label key={branchName} className="inline-flex items-center w-full px-3 py-2 hover:bg-gray-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBranches.includes(branchName)}
                            onChange={() => {
                              const isSelected = selectedBranches.includes(branchName);
                              if (isSelected) {
                                setSelectedBranches(selectedBranches.filter(b => b !== branchName));
                              } else {
                                setSelectedBranches([...selectedBranches, branchName]);
                              }
                            }}
                            className="form-checkbox h-4 w-4 text-[#7f7acf] rounded border-gray-300 focus:ring-[#7f7acf]"
                          />
                          <span className="ml-2 text-sm text-gray-700">{branchName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/admin/users"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className={`px-6 py-3 bg-[#7f7acf] hover:bg-[#6c67b5] text-white rounded-md ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
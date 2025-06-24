"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DataFeedLogo from "../components/DataFeedLogo";
import { useUser } from "../context/UserContext";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  employeeId: string;
  username?: string;
  role?: string;
  branch?: string | null;
  cluster?: string | null;
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userFound, setUserFound] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");
  const router = useRouter();
  const { login } = useUser();

  useEffect(() => {
    // Initialize demo users if none exist
    const initializeDemoUsers = () => {
      const usersJSON = localStorage.getItem("users");
      if (!usersJSON) {
        const demoUsers = [
          {
            id: "ceo-1",
            name: "John CEO",
            email: "ceo@datafeed.com",
            password: "password",
            employeeId: "CEO001",
            role: "Chief Executive Officer",
            branch: "All Branches",
            cluster: null
          },
          {
            id: "cluster-1",
            name: "Mike Manager",
            email: "cluster@datafeed.com",
            password: "password",
            employeeId: "CLU001",
            role: "Cluster Level",
            branch: null,
            cluster: "Gurugram"
          },
          {
            id: "branch-1",
            name: "Bob Branch",
            email: "branch@datafeed.com",
            password: "password",
            employeeId: "BRA001",
            role: "Branch Level",
            branch: "Gurugram",
            cluster: "Gurugram"
          },
          {
            id: "user-1",
            name: "User",
            email: "user@datafeed.com",
            password: "password",
            employeeId: "USER001",
            role: "Branch Level",
            branch: "Faridabad",
            cluster: "Faridabad"
          }
        ];
        localStorage.setItem("users", JSON.stringify(demoUsers));
      }
    };

    initializeDemoUsers();
  }, []);

  // Auto-fill user data based on Employee ID
  const handleEmployeeIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setUserFound(false);
    setUserRole("");
    
    // If Employee ID is empty, reset form
    if (!value) {
      return;
    }
    
    try {
      // First try to fetch from API
      const response = await fetch(`/api/users/check-employee-id?employeeId=${value}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUserFound(true);
          setUserRole(data.user.role || "");
          return;
        }
      }
      
      // Fallback to localStorage if API fails
      const usersJSON = localStorage.getItem("users");
      if (usersJSON) {
        const users: User[] = JSON.parse(usersJSON);
        const user = users.find(u => u.employeeId === value);
        
        if (user) {
          setUserFound(true);
          setUserRole(user.role || "");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Continue with localStorage fallback
      const usersJSON = localStorage.getItem("users");
      if (usersJSON) {
        const users: User[] = JSON.parse(usersJSON);
        const user = users.find(u => u.employeeId === value);
        
        if (user) {
          setUserFound(true);
          setUserRole(user.role || "");
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simple validation
    if (!username || !password) {
      setError("Please enter both Employee ID and password");
      setIsLoading(false);
      return;
    }

    try {
      // Get users from localStorage
      const usersJSON = localStorage.getItem("users");
      let users: User[] = usersJSON ? JSON.parse(usersJSON) : [];
      
      // Find user by employeeId and validate password
      const user = users.find(
        u => (u.employeeId === username || u.username === username || u.email === username) && u.password === password
      );

      if (!user) {
        setError("Invalid Employee ID or password. Please contact your administrator if you need access.");
        setIsLoading(false);
        return;
      }
      
      // Use the context login function
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "User",
        branch: user.branch || undefined,
        cluster: user.cluster || undefined
      });
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-8">
          <DataFeedLogo />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">Login</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2 text-gray-700">
              Employee ID
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleEmployeeIdChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf]"
              placeholder="Enter your Employee ID (e.g., EMP123456)"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {userFound 
                ? `User found! Role: ${userRole}` 
                : "Use the Employee ID provided by your administrator"}
            </p>
          </div>

          {userFound && userRole && (
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">Role: {userRole}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f7acf] focus:border-[#7f7acf]"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 px-2 py-1 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#7f7acf] focus:ring-[#7f7acf] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link href="/login/reset-password" className="text-[#7f7acf] hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-md bg-[#7f7acf] text-white font-medium hover:bg-[#6a66b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7f7acf] ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center">
          <Link 
            href="/admin/users"
            className="bg-[#7f7acf] hover:bg-[#6c67b5] text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            User Management
          </Link>
        </div>
      </div>
    </div>
  );
} 
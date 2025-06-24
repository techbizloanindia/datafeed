"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import DataFeedLogo from "./components/DataFeedLogo";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="flex justify-center mb-6">
          <DataFeedLogo />
        </div>
        
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-800">Welcome to DATAFEED</h1>
        <p className="mb-8 text-center text-gray-600">
          Your comprehensive data management solution
        </p>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
          <Link 
            href="/login" 
            className="rounded-md bg-blue-600 px-6 py-3 text-center text-white hover:bg-blue-700 transition-colors"
          >
            User Login
          </Link>
          <Link 
            href="/admin/login" 
            className="rounded-md bg-gray-700 px-6 py-3 text-center text-white hover:bg-gray-800 transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}

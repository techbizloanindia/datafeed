"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function DataFeedLogo({ size = "large" }: { size?: "small" | "medium" | "large" }) {
  const [logoUrl, setLogoUrl] = useState("/datafeed-logo.svg");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate loading delay to show the loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Determine dimensions based on size prop
  const getDimensions = () => {
    switch (size) {
      case "small":
        return { height: "h-8", width: "w-24" };
      case "medium":
        return { height: "h-12", width: "w-36" };
      case "large":
      default:
        return { height: "h-16", width: "w-48" };
    }
  };

  const { height, width } = getDimensions();

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${height} ${width} bg-gray-100 dark:bg-gray-700 rounded animate-pulse`}>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md font-bold text-xl">
          DATAFEED
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${height} ${width}`}>
      <Image
        src={logoUrl}
        alt="DATAFEED Logo"
        fill
        style={{ objectFit: "contain" }}
        priority
        onError={() => setError(true)}
      />
    </div>
  );
} 
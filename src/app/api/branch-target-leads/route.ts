import { NextResponse } from "next/server";
import { fetchSheetDataWithRoleFilter } from "@/lib/googleSheets";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    // Get query parameters for role-based filtering
    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const cluster = url.searchParams.get("cluster");
    const branch = url.searchParams.get("branch");
    
    // Get the sheet name from query params or use default
    const sheetName = url.searchParams.get("sheetName") || "Branch Target Leads";
    
    // Create role filter if parameters are provided
    const roleFilter = role ? {
      role,
      cluster: cluster || undefined,
      branch: branch || undefined
    } : undefined;
    
    // Fetch data from Google Sheets with role-based filtering
    const { data, lastUpdated } = await fetchSheetDataWithRoleFilter(sheetName, roleFilter);
    
    // Store last updated timestamp in a cookie for client-side access
    cookies().set("last_data_refresh", lastUpdated, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400 // 24 hours
    });
    
    return NextResponse.json({ data, lastUpdated });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data from Google Sheets" }, { status: 500 });
  }
}

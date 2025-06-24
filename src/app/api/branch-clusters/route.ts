import { NextResponse } from "next/server";

// This would typically come from a database
const clusterBranchMap = {
  "Gurugram": ["Gurugram", "Bhiwadi", "Rewari", "Narnaul", "Pataudi", "Sohna", "Behror"],
  "Karnataka": ["Yelahanka", "Davanagere", "Kengeri", "Ramnagar", "Kanakpura", "Mandya"],
  "Faridabad": ["Faridabad", "Mathura", "Palwal", "Badarpur", "Goverdhan", "Jewar"],
  "Delhi": ["Pitampura", "Panipat", "Alipur", "Nangloi", "Sonipat"],
  "Ghaziabad": ["East Delhi", "Ghaziabad", "Hapur", "Loni", "Surajpur"],
  "Karnal": ["Karnal", "Panipat"],
  "Maharashtra": ["Kalyan", "West"]
};

export async function GET() {
  try {
    // In a real application, this would fetch data from a database
    return NextResponse.json({
      success: true,
      clusters: clusterBranchMap
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching cluster and branch data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cluster and branch data'
    }, { status: 500 });
  }
} 
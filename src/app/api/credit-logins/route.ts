import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Mock data for credit logins
    const mockData = [
      {
        branchName: "Mumbai Central",
        cluster: "West",
        greenLeadsToLoginsPercentage: 68,
        amberLeadsToLoginsPercentage: 48
      },
      {
        branchName: "Delhi North",
        cluster: "North",
        greenLeadsToLoginsPercentage: 47,
        amberLeadsToLoginsPercentage: 50
      },
      {
        branchName: "Bangalore North",
        cluster: "South",
        greenLeadsToLoginsPercentage: 60,
        amberLeadsToLoginsPercentage: 35
      },
      {
        branchName: "Chennai South",
        cluster: "South",
        greenLeadsToLoginsPercentage: 61,
        amberLeadsToLoginsPercentage: 42
      },
      {
        branchName: "Pune East",
        cluster: "West",
        greenLeadsToLoginsPercentage: 52,
        amberLeadsToLoginsPercentage: 40
      },
      {
        branchName: "Hyderabad Central",
        cluster: "South",
        greenLeadsToLoginsPercentage: 62,
        amberLeadsToLoginsPercentage: 38
      }
    ];

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
} 
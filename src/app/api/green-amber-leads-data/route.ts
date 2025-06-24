import { NextResponse } from 'next/server';
import { getGoogleSheetsData } from '../../../lib/googleSheets';

export const dynamic = 'force-dynamic'; // Disable caching for this route

export async function GET() {
  try {
    // Mock data for green and amber leads
    const mockData = [
      {
        branchName: "Gurugram",
        cluster: "GM",
        greenLeads: 0,
        amberLeads: 12,
        totalLeads: 12,
        greenLeadsPercentage: 0.0,
        amberLeadsPercentage: 100.0
      },
      {
        branchName: "Yelahanka",
        cluster: "GM",
        greenLeads: 0,
        amberLeads: 12,
        totalLeads: 10,
        greenLeadsPercentage: -2.0,
        amberLeadsPercentage: -18.7
      },
      {
        branchName: "Davanagere",
        cluster: "GM",
        greenLeads: 0,
        amberLeads: 12,
        totalLeads: 9,
        greenLeadsPercentage: -3.0,
        amberLeadsPercentage: -25.0
      },
      {
        branchName: "Faridabad",
        cluster: "GM",
        greenLeads: 0,
        amberLeads: 13,
        totalLeads: 12,
        greenLeadsPercentage: -1.0,
        amberLeadsPercentage: -7.7
      },
      {
        branchName: "Pitampura",
        cluster: "GM",
        greenLeads: 0,
        amberLeads: 13,
        totalLeads: 12,
        greenLeadsPercentage: -1.0,
        amberLeadsPercentage: -7.7
      },
      {
        branchName: "Panipat",
        cluster: "GM",
        greenLeads: 0,
        amberLeads: 13,
        totalLeads: 10,
        greenLeadsPercentage: -3.0,
        amberLeadsPercentage: -23.1
      },
      {
        branchName: "Kengeri",
        cluster: "GM",
        greenLeads: 0,
        amberLeads: 13,
        totalLeads: 2,
        greenLeadsPercentage: -11.0,
        amberLeadsPercentage: -84.6
      },
      {
        branchName: "Ramnagar",
        cluster: "GM",
        greenLeads: 0,
        amberLeads: 13,
        totalLeads: 10,
        greenLeadsPercentage: -3.0,
        amberLeadsPercentage: -23.1
      },
      {
        branchName: "West",
        cluster: "GM",
        greenLeads: 0,
        amberLeads: 15,
        totalLeads: 8,
        greenLeadsPercentage: -7.0,
        amberLeadsPercentage: -46.7
      },
      {
        branchName: "Bhiwadi",
        cluster: "GM",
        greenLeads: 0,
        amberLeads: 14,
        totalLeads: 51,
        greenLeadsPercentage: 37.0,
        amberLeadsPercentage: 264.3
      }
    ];

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
} 
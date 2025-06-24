import { NextRequest, NextResponse } from 'next/server';

interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role?: string;
  branch?: string | null;
  cluster?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    
    if (!employeeId) {
      return NextResponse.json({
        success: false,
        error: 'Employee ID is required'
      }, { status: 400 });
    }
    
    // Default mock users (in a real app, this would come from a database)
    const defaultUsers = [
      {
        id: "ceo-1",
        name: "John CEO",
        email: "ceo@datafeed.com",
        employeeId: "CEO001",
        role: "Chief Executive Officer",
        branch: "All Branches",
        cluster: null
      },
      {
        id: "cluster-1",
        name: "Mike Manager",
        email: "cluster@datafeed.com",
        employeeId: "CLU001",
        role: "Cluster Level",
        branch: null,
        cluster: "Gurugram"
      },
      {
        id: "branch-1",
        name: "Bob Branch",
        email: "branch@datafeed.com",
        employeeId: "BRA001",
        role: "Branch Level",
        branch: "Gurugram",
        cluster: "Gurugram"
      },
      {
        id: "user-1",
        name: "User",
        email: "user@datafeed.com",
        employeeId: "USER001",
        role: "Branch Level",
        branch: "Faridabad",
        cluster: "Faridabad"
      }
    ];
    
    // Note: localStorage is not available in server components/API routes
    // The actual check will happen in the client component
    
    // Find user by employee ID from default users
    const user = defaultUsers.find(u => u.employeeId === employeeId);
    
    if (user) {
      // Return user data without sensitive information
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          branch: user.branch,
          cluster: user.cluster
        }
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error checking employee ID:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check employee ID'
    }, { status: 500 });
  }
} 
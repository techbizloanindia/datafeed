import { NextRequest, NextResponse } from 'next/server';

// Define User interface
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  employeeId: string;
  role: string;
  roles?: string[];
  branch: string | null;
  cluster: string | null;
}

// GET all users
export async function GET() {
  try {
    // In a real application, this would query a database
    // For now, we'll return mock data for demonstration
    
    const defaultUsers = [
      {
        id: "ceo-1",
        name: "John CEO",
        email: "ceo@datafeed.com",
        employeeId: "CEO001",
        role: "Chief Executive Officer",
        roles: ["Chief Executive Officer"],
        branch: "All Branches",
        cluster: null
      },
      {
        id: "cluster-1",
        name: "Mike Manager",
        email: "cluster@datafeed.com",
        employeeId: "CLU001",
        role: "Cluster Level",
        roles: ["Cluster Level"],
        branch: null,
        cluster: "Gurugram"
      },
      {
        id: "branch-1",
        name: "Bob Branch",
        email: "branch@datafeed.com",
        employeeId: "BRA001",
        role: "Branch Level",
        roles: ["Branch Level"],
        branch: "Gurugram",
        cluster: "Gurugram"
      }
    ];
    
    // Note: In a real application, we would combine default users with those from the database
    // For this demo, the client component will handle combining default users with localStorage users
    
    return NextResponse.json({
      success: true,
      users: defaultUsers
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch users"
    }, { status: 500 });
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // Validate required fields
    const { name, email, password, employeeId, role } = userData;
    
    if (!name || !email || !password || !employeeId || !role) {
      return NextResponse.json({
        success: false,
        message: "Please fill in all required fields"
      }, { status: 400 });
    }
    
    // Handle multiple roles
    let roles = userData.roles || [role];
    
    // Ensure roles is an array
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    
    // Ensure at least one role is selected
    if (roles.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Please select at least one role"
      }, { status: 400 });
    }
    
    // Handle multiple clusters and branches
    let branch = userData.branch || null;
    let cluster = userData.cluster || null;
    
    // Ensure branch and cluster values are properly formatted
    if (branch && typeof branch === 'string' && branch.includes(',')) {
      // Trim any whitespace around commas
      branch = branch.split(',').map((b: string) => b.trim()).join(', ');
    }
    
    if (cluster && typeof cluster === 'string' && cluster.includes(',')) {
      // Trim any whitespace around commas
      cluster = cluster.split(',').map((c: string) => c.trim()).join(', ');
    }
    
    // Create a unique ID for the user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password, // Note: In production, this should be hashed
      employeeId,
      role: roles[0], // Primary role is the first one
      roles, // Store all roles
      branch,
      cluster
    };
    
    // Store user data in localStorage (client-side only)
    // This will be handled in the client component
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        ...newUser,
        password: undefined // Don't return the password
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({
      success: false,
      message: "An error occurred while creating the user"
    }, { status: 500 });
  }
}

// PUT - Update a user by ID (endpoint would be /api/users/[id])
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // In a real application, you would:
    // 1. Validate the user ID
    // 2. Check if user exists
    // 3. Update user in database
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}

// DELETE - Delete a user by ID (endpoint would be /api/users/[id])
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }
    
    // In a real application, you would:
    // 1. Check if user exists
    // 2. Delete user from database
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
} 
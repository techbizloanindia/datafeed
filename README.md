# DataFeed

DataFeed is a Next.js-based web application for visualizing and analyzing financial data from multiple sources. It provides real-time access to key business metrics through an intuitive dashboard interface with a clean, modern design featuring a purple (#7f7acf) and white color scheme.

![DataFeed Logo](/public/datafeed-logo.svg)

## Features

- **User Authentication**: Secure login system with session management
- **Interactive Dashboard**: Centralized view of all key metrics
- **Real-time Data Integration**: Connect to Google Sheets data sources
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Role-based Access Control**: Branch, RM, and Admin permission levels
- **Executive Dashboard**: Chief Executive Officer dashboard with advanced analytics
- **Advanced Data Visualization**: Interactive charts and graphs for data analysis
- **Modern UI**: Clean, card-based design with consistent styling

## Modules

### User Interface
- **Main Dashboard**: Overview of all key business metrics
- **Role-based Dashboards**: Customized views for Branch and RM level users
- **Reports Module**: Detailed reports with filterable data views
- **Admin Panel**: User management and system configuration
- **CEO Dashboard**: Executive-level metrics and performance indicators
- **Settings**: User preferences and application configuration

### Role-based Dashboards
- **Branch Level Dashboard**: Shows branch-specific metrics:
  - Branch-level Target Leads vs Actual Leads
  - Branch Disbursement Target No. of Cases vs Actual
  - % of Green and Amber Leads to Total Leads
  - % of Green and Amber Leads to Credit Logins

- **RM Level Dashboard**: Shows RM-specific metrics:
  - No. of Visits (Target vs Actuals) - Top & Bottom 20 RMs
  - % of Green and Amber Leads to Total Leads - Top & Bottom 20 RMs
  - % of Credit Logins to Green & Amber Leads - Top & Bottom 20 RMs
  - Disbursement Value (Target vs Actuals) - Top & Bottom 20 RMs

### Data Reports
1. **Branch-level Target Leads vs Actual Leads**: Compare target and actual lead generation metrics by branch
2. **Branch Disbursement Target No. of Cases vs Actual**: Track disbursement targets against actual case numbers
3. **% of Green and Amber Leads to Total Leads**: Analyze the percentage of high-quality leads in your pipeline
4. **% of Green and Amber Leads to Credit Logins**: Measure conversion rate from qualified leads to credit applications
5. **Chart View**: Visual representation of all report data with filtering options

### Administration
- **User Management**: Create, view, and manage user accounts
- **Dashboard Configuration**: Customize dashboard views and metrics
- **Access Control**: Role-based permissions for different user types
- **Branch Management**: Configure and manage branch information
- **CEO Dashboard**: Executive-level analytics and performance tracking

### External Integrations
- **LOS (Loan Origination System)**: Integration with loan processing data
- **Sales Buddy**: Integration with sales performance metrics
- **MIS Reports**: Management Information System reporting
- **Google Sheets**: Data import and synchronization

## Technology Stack

- **Frontend**: Next.js 15.x, React, TypeScript, Tailwind CSS
- **Data Visualization**: Chart.js with React-chartjs-2
- **Authentication**: Session-based authentication with secure storage
- **External Data**: Google Sheets API integration
- **State Management**: React hooks and context API
- **Styling**: Custom CSS variables with Tailwind utility classes
- **Deployment**: Vercel-ready configuration

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Google API credentials for Sheets integration

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/datafeed.git
   cd datafeed
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Configuration

### Google Sheets Integration

The application is configured to fetch data from specific Google Sheets:

1. Branch Disbursement data: Sheet with gid=64962969
2. Green Amber Leads data: Configured in the API routes
3. Credit Logins data: Configured in the API routes
4. Branch Target Leads data: Configured in the API routes

To use your own Google Sheets:
1. Update the `SPREADSHEET_ID` constant in the API route files
2. Ensure your Google Sheets have the correct column headers
3. Make sure the sheets are accessible with your API key

## Design System

The application uses a consistent design system with the following key elements:

- **Color Palette**:
  - Primary: #7f7acf (Purple)
  - Primary Hover: #6c67b5 (Darker Purple)
  - Primary Light: #f0f0fa (Light Purple Background)
  - Background: #ffffff (White)
  - Foreground: #171717 (Near Black)

- **Typography**:
  - Primary Font: Arial, Helvetica, sans-serif
  - Headings: Bold weight with consistent sizing
  - Body Text: Regular weight with appropriate line height

- **Components**:
  - Cards: 12px border radius with consistent shadow and padding
  - Buttons: 8px border radius with hover effects
  - Inputs: 8px border radius with focus states
  - Tables: Clean design with proper spacing and hover states

- **Layout**:
  - Responsive grid system
  - Consistent spacing using CSS variables
  - Mobile-first approach with breakpoints

## Project Structure

```
datafeed/
├── public/                    # Static assets
│   ├── datafeed-logo.svg      # Application logo
│   ├── favicon.svg            # Browser favicon
│   ├── file.svg               # File icon
│   ├── globe.svg              # Globe icon
│   ├── window.svg             # Window icon
│   └── vercel.svg             # Vercel logo
│
├── src/                       # Source code
│   ├── app/                   # Next.js App Router structure
│   │   ├── admin/             # Admin section
│   │   │   ├── components/    # Admin-specific components
│   │   │   │   └── DataChart.tsx  # Admin chart component
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   │   └── page.tsx   # Admin dashboard page
│   │   │   ├── login/         # Admin login
│   │   │   │   └── page.tsx   # Admin login page
│   │   │   ├── users/         # User management
│   │   │   │   ├── create/    # Create user
│   │   │   │   │   └── page.tsx # Create user page
│   │   │   │   └── page.tsx   # User list page
│   │   │   ├── ceo-dashboard/ # Chief Executive Officer dashboard
│   │   │   │   └── page.tsx   # CEO dashboard page
│   │   │   └── layout.tsx     # Admin layout with sidebar
│   │   │
│   │   ├── api/               # API routes
│   │   │   ├── branch-disbursement-data/  # Branch disbursement data API
│   │   │   │   └── route.ts   # API endpoint handler
│   │   │   ├── branch-target-leads/       # Branch target leads API
│   │   │   │   └── route.ts   # API endpoint handler
│   │   │   ├── ceo-dashboard-data/        # CEO dashboard data API
│   │   │   │   └── route.ts   # API endpoint handler
│   │   │   ├── green-amber-leads-data/    # Green amber leads API
│   │   │   │   └── route.ts   # API endpoint handler
│   │   │   ├── credit-logins/             # Credit logins API
│   │   │   │   └── route.ts   # API endpoint handler
│   │   │   └── branch-disbursement/       # Branch disbursement API
│   │   │
│   │   ├── components/        # Shared UI components
│   │   │   ├── DataChart.tsx           # Chart component
│   │   │   ├── DataFeedLogo.tsx        # Logo component
│   │   │   ├── GreenAmberLeadsTable.tsx # Table component
│   │   │   ├── Navigation.tsx          # Navigation component
│   │   │   └── RefreshButton.tsx       # Refresh button component
│   │   │
│   │   ├── dashboard/         # Main user dashboard
│   │   │   ├── page.tsx       # Branch level dashboard
│   │   │   └── rm/            # RM level dashboard
│   │   │       └── page.tsx   # RM dashboard page
│   │   │
│   │   ├── login/             # User authentication
│   │   │   ├── page.tsx       # Login page
│   │   │   └── reset-password/ # Password reset functionality
│   │   │
│   │   ├── reports/           # Report pages
│   │   │   ├── branch-disbursement/    # Branch disbursement report
│   │   │   │   └── page.tsx   # Branch disbursement report page
│   │   │   ├── branch-target-leads/    # Branch target leads report
│   │   │   │   └── page.tsx   # Branch target leads report page
│   │   │   ├── chart-view/            # Chart visualization
│   │   │   │   └── page.tsx   # Chart view page
│   │   │   ├── credit-logins/         # Credit logins report
│   │   │   │   └── page.tsx   # Credit logins report page
│   │   │   ├── green-amber-leads/     # Green amber leads report
│   │   │   │   └── page.tsx   # Green amber leads report page
│   │   │   └── page.tsx       # Reports landing page
│   │   │
│   │   ├── settings/          # User settings
│   │   │   └── page.tsx       # Settings page
│   │   │
│   │   ├── globals.css        # Global styles with CSS variables
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   │
│   └── lib/                   # Utility libraries
│       ├── firebase.ts        # Firebase configuration
│       └── googleSheets.ts    # Google Sheets API client
│
├── next.config.ts             # Next.js configuration
├── package.json               # Project dependencies
├── postcss.config.mjs         # PostCSS configuration
├── eslint.config.mjs          # ESLint configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

## Application Flow

### User Authentication Flow
1. User navigates to the application
2. If not authenticated, redirected to `/login`
3. User enters credentials (Employee ID and password)
4. System validates credentials against stored user data
5. Upon successful authentication:
   - User data is stored in session storage
   - User is redirected to appropriate dashboard based on role

### Dashboard Data Flow
1. Dashboard component loads and checks user authentication
2. Based on user role, appropriate data endpoints are called
3. API routes fetch data (from Google Sheets or mock data)
4. Data is processed and filtered based on user's branch/role
5. Charts and tables are rendered with the processed data
6. User can refresh individual sections using the RefreshButton component

### Admin User Management Flow
1. Admin logs in through `/admin/login`
2. Navigates to `/admin/users` to view existing users
3. Can create new users at `/admin/users/create`:
   - Enter user details (name, email, employee ID, etc.)
   - Select user role (Branch Level, RM, Cluster Level, CEO)
   - Assign branches using the interactive branch selection
   - Submit to create the user

### Report Generation Flow
1. User navigates to a specific report (e.g., `/reports/green-amber-leads`)
2. Report component loads and fetches data from appropriate API endpoint
3. Data is displayed in tables and charts
4. User can filter and sort the data based on various parameters
5. Charts provide visual representation of the data metrics

## User Roles and Permissions

1. **Branch Level User**
   - Access to Branch Level Dashboard
   - View reports filtered to their assigned branch
   - Cannot access admin features

2. **RM (Relationship Manager)**
   - Access to RM Level Dashboard
   - View reports filtered to their assigned customers/leads
   - Cannot access admin features

3. **Cluster Level User**
   - Access to Branch Level Dashboard with cluster-wide data
   - View reports across all branches in their cluster
   - Cannot access admin features

4. **Chief Executive Officer**
   - Access to CEO Dashboard
   - View all reports across all branches and clusters
   - Access to executive-level metrics and KPIs
   - Real-time data filtering capabilities by Role, Cluster, and Branch levels
   - Ability to drill down from organization-wide metrics to specific branch performance

5. **Admin User**
   - Access to Admin Dashboard
   - User management capabilities
   - System configuration access
   - Full access to all reports and data

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Chart.js for powerful data visualization
- Google Sheets API for data integration capabilities

## Recent Updates

### May 2023

1. **Role-based Dashboards**
   - Implemented Branch Level Dashboard with key metrics:
     - Branch-level Target Leads vs Actual Leads
     - Branch Disbursement Target No. of Cases vs Actual
     - % of Green and Amber Leads to Total Leads
     - % of Green and Amber Leads to Credit Logins
   - Created RM Level Dashboard showing:
     - Top & Bottom performing RMs across various metrics
     - Performance visualization with comparative charts

2. **CEO Dashboard with Google Sheets Integration**
   - Built API endpoint to fetch data from all sheets in a Google Sheets document
   - Implemented dynamic dashboard displaying data from each sheet with charts and tables
   - Added features for sheet selection, data refresh, and summary metrics
   - Created chart view for visualizing trends across different data sets
   - Implemented role-based real-time data filtering by Role, Cluster, and Branch levels
   - Enabled authenticated users to access granular data based on their permission level

3. **GreenAmberLeadsTable Component**
   - Developed reusable table component for displaying branch data with green and amber leads
   - Implemented sorting, filtering by cluster, and summary statistics
   - Added visual indicators for performance metrics
   - Integrated with data refresh functionality for real-time updates

4. **UI/UX Improvements**
   - Standardized component design across the application
   - Improved responsive layout for better mobile experience
   - Enhanced data visualization with consistent chart styling
   - Added loading states and error handling for better user experience

# DataFeed

DataFeed is a Next.js-based web application for visualizing and analyzing financial data from multiple sources. It provides real-time access to key business metrics through an intuitive dashboard interface with a clean, modern design featuring a purple (#7f7acf) and white color scheme.

![DataFeed Logo](/public/datafeed-logo.svg)

## 🚀 Quick Links

- **Live Demo**: [Coming Soon](#)
- **GitHub Repository**: [github.com/techbizloanindia/datafeed](https://github.com/techbizloanindia/datafeed)
- **Documentation**: [See below](#features)
- **Issues**: [Report a bug](https://github.com/techbizloanindia/datafeed/issues)

## ✨ Features

- **User Authentication**: Secure login system with session management
- **Interactive Dashboard**: Centralized view of all key metrics
- **Real-time Data Integration**: Connect to Google Sheets data sources
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Role-based Access Control**: Branch, RM, and Admin permission levels
- **Executive Dashboard**: Chief Executive Officer dashboard with advanced analytics
- **Advanced Data Visualization**: Interactive charts and graphs for data analysis
- **Modern UI**: Clean, card-based design with consistent styling

## 📊 Modules

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

## 💻 Technology Stack

- **Frontend**: Next.js 15.x, React, TypeScript, Tailwind CSS
- **Data Visualization**: Chart.js with React-chartjs-2
- **Authentication**: Session-based authentication with secure storage
- **External Data**: Google Sheets API integration
- **State Management**: React hooks and context API
- **Styling**: Custom CSS variables with Tailwind utility classes
- **Deployment**: Vercel-ready configuration

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/techbizloanindia/datafeed.git
   cd datafeed
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn
   ```

3. Set up environment variables
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Run the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Build for production
   ```
   npm run build
   # or
   yarn build
   ```

## 🚀 Deployment

The application can be deployed to Vercel or any other hosting platform that supports Next.js.

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy with a single click

## 🔧 Configuration

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

## 🎨 Design System

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

## 📁 Project Structure

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

## 🔄 Application Flow

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

## 👥 User Roles and Permissions

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Chart.js for powerful data visualization
- Google Sheets API for data integration capabilities

## 📅 Recent Updates

### June 2023

1. **GitHub Repository Setup**
   - Created and configured GitHub repository at [github.com/techbizloanindia/datafeed](https://github.com/techbizloanindia/datafeed)
   - Set up proper project structure and documentation
   - Configured ESLint and TypeScript for code quality

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

## 👨‍💻 Developer Guide

This section provides guidance on how to correctly utilize and add features to the DataFeed project.

### Code Organization

When adding new features or modifying existing ones, follow these guidelines:

1. **Component Structure**:
   - Place shared components in `src/app/components/`
   - Place role-specific components in their respective folders (e.g., `src/app/admin/components/`)
   - Each component should have a single responsibility
   - Use TypeScript interfaces for props

2. **API Routes**:
   - Place new API routes in `src/app/api/`
   - Follow the existing pattern of separating route handlers into their own files
   - Use TypeScript for request and response types
   - Implement proper error handling

3. **Pages**:
   - Follow Next.js App Router conventions
   - Place pages in their respective directories based on URL structure
   - Use the `page.tsx` naming convention
   - Implement proper loading states and error boundaries

### Best Practices

1. **TypeScript**:
   - Use proper TypeScript types for all variables, function parameters, and return values
   - Avoid using `any` type when possible
   - Create interfaces for data structures
   - Use generics for reusable components

2. **State Management**:
   - Use React Context for global state
   - Use React hooks for component state
   - Implement proper state initialization and updates
   - Consider performance implications for state updates

3. **Data Fetching**:
   - Use API routes for data fetching
   - Implement proper error handling
   - Use loading states during data fetching
   - Consider caching strategies for frequently accessed data

4. **Styling**:
   - Use Tailwind CSS for styling
   - Follow the design system guidelines
   - Use CSS variables for theme colors
   - Ensure responsive design for all components

### Adding New Features

When adding a new feature to the project, follow these steps:

1. **Plan**:
   - Define the feature requirements
   - Identify the components needed
   - Determine the data requirements
   - Consider the user experience

2. **Implement**:
   - Create necessary components
   - Implement API routes if needed
   - Add proper TypeScript types
   - Follow the styling guidelines

3. **Test**:
   - Test the feature in development mode
   - Verify it works across different screen sizes
   - Check for any TypeScript or ESLint errors
   - Ensure it integrates well with existing features

4. **Document**:
   - Add comments to complex code sections
   - Update the README.md if necessary
   - Document any API changes
   - Add the feature to the "Recent Updates" section

### Component Development

When developing new components:

1. **Component Architecture**:
   - Use functional components with hooks
   - Keep components small and focused
   - Extract reusable logic into custom hooks
   - Use proper prop types

2. **Data Visualization Components**:
   - Use Chart.js with React-chartjs-2 for charts
   - Follow the existing chart configuration patterns
   - Ensure proper data transformation for visualization
   - Implement responsive chart sizing

3. **Form Components**:
   - Use controlled components for forms
   - Implement proper validation
   - Provide clear error messages
   - Use consistent styling for form elements

4. **Table Components**:
   - Follow the existing table component patterns
   - Implement sorting and filtering functionality
   - Ensure proper pagination for large datasets
   - Use consistent styling for table elements

### Google Sheets Integration

When working with Google Sheets integration:

1. **API Configuration**:
   - Update the `SPREADSHEET_ID` constant in the API route files
   - Ensure your Google Sheets have the correct column headers
   - Make sure the sheets are accessible with your API key

2. **Data Transformation**:
   - Transform the raw data from Google Sheets into the required format
   - Handle edge cases such as missing data
   - Implement proper error handling
   - Consider caching strategies for frequently accessed data

3. **Authentication**:
   - Use the provided Google authentication flow
   - Ensure proper handling of authentication tokens
   - Implement token refresh logic
   - Handle authentication errors gracefully

### Deployment

When deploying updates:

1. **Build Process**:
   - Run `npm run build` to ensure the build succeeds
   - Fix any TypeScript or ESLint errors
   - Optimize images and assets

2. **Environment Variables**:
   - Ensure all required environment variables are set
   - Use different values for development and production
   - Never commit sensitive information to the repository

3. **Vercel Deployment**:
   - Connect your GitHub repository to Vercel
   - Configure environment variables in the Vercel dashboard
   - Use preview deployments for testing changes
   - Monitor deployment logs for any issues

### Troubleshooting Common Issues

1. **Build Errors**:
   - Check for TypeScript errors
   - Ensure all dependencies are installed
   - Verify environment variables are properly set
   - Check for ESLint errors

2. **Data Fetching Issues**:
   - Verify API routes are working correctly
   - Check network requests in the browser console
   - Ensure authentication tokens are valid
   - Verify data transformation logic

3. **Styling Issues**:
   - Check for CSS conflicts
   - Verify responsive design across different screen sizes
   - Ensure proper use of Tailwind CSS classes
   - Check for any custom CSS overrides

4. **Performance Issues**:
   - Optimize component rendering
   - Implement proper memoization
   - Reduce unnecessary re-renders
   - Optimize data fetching and caching

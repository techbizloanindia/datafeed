import { useState } from "react";

interface GreenAmberLeadData {
  date: string;
  branchName: string;
  branchVintage: string;
  cluster: string;
  greenLeads: number;
  amberLeads: number;
  totalLeads: number;
  greenLeadsPercentage: number;
  amberLeadsPercentage: number;
}

interface GreenAmberLeadsTableProps {
  data: GreenAmberLeadData[];
  isLoading?: boolean;
}

export default function GreenAmberLeadsTable({ data, isLoading = false }: GreenAmberLeadsTableProps) {
  const [sortField, setSortField] = useState<keyof GreenAmberLeadData>("branchName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterCluster, setFilterCluster] = useState<string>("all");

  // Get unique clusters for filtering
  const clusters = ["all", ...Array.from(new Set(data.map(item => item.cluster)))];

  // Handle sorting
  const handleSort = (field: keyof GreenAmberLeadData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort data
  const filteredAndSortedData = data
    .filter(item => filterCluster === "all" || item.cluster === filterCluster)
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

  // Calculate totals for the filtered data
  const totalGreenLeads = filteredAndSortedData.reduce((sum, item) => sum + item.greenLeads, 0);
  const totalAmberLeads = filteredAndSortedData.reduce((sum, item) => sum + item.amberLeads, 0);
  const totalLeads = filteredAndSortedData.reduce((sum, item) => sum + item.totalLeads, 0);
  const avgGreenLeadsPercentage = totalLeads > 0 ? (totalGreenLeads / totalLeads) * 100 : 0;
  const avgAmberLeadsPercentage = totalLeads > 0 ? (totalAmberLeads / totalLeads) * 100 : 0;

  // Render sort indicator
  const renderSortIndicator = (field: keyof GreenAmberLeadData) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7f7acf]"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-4 md:mb-0">
          <label className="block text-sm font-medium text-gray-400 mb-1">Filter by Cluster</label>
          <select
            className="bg-slate-700 text-white rounded-lg border border-slate-600 px-4 py-2"
            value={filterCluster}
            onChange={(e) => setFilterCluster(e.target.value)}
          >
            {clusters.map((cluster) => (
              <option key={cluster} value={cluster}>
                {cluster === "all" ? "All Clusters" : cluster}
              </option>
            ))}
          </select>
        </div>
        
        <div className="bg-slate-700 p-3 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Total Branches</p>
              <p className="text-white font-bold text-lg">{filteredAndSortedData.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg. Green %</p>
              <p className="text-green-400 font-bold text-lg">{avgGreenLeadsPercentage.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg. Amber %</p>
              <p className="text-amber-400 font-bold text-lg">{avgAmberLeadsPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-700">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("branchName")}
            >
              Branch Name {renderSortIndicator("branchName")}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("branchVintage")}
            >
              Vintage {renderSortIndicator("branchVintage")}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("cluster")}
            >
              Cluster {renderSortIndicator("cluster")}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("greenLeads")}
            >
              Green Leads {renderSortIndicator("greenLeads")}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("amberLeads")}
            >
              Amber Leads {renderSortIndicator("amberLeads")}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("totalLeads")}
            >
              Total Leads {renderSortIndicator("totalLeads")}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("greenLeadsPercentage")}
            >
              Green % {renderSortIndicator("greenLeadsPercentage")}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("amberLeadsPercentage")}
            >
              Amber % {renderSortIndicator("amberLeadsPercentage")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-slate-800 divide-y divide-slate-700">
          {filteredAndSortedData.map((item, index) => (
            <tr key={`${item.branchName}-${index}`} className="hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                {item.branchName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {item.branchVintage}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {item.cluster}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                {item.greenLeads}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                {item.amberLeads}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                {item.totalLeads}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span className={`font-medium ${item.greenLeadsPercentage >= 40 ? 'text-green-400' : 'text-gray-300'}`}>
                  {item.greenLeadsPercentage.toFixed(1)}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span className={`font-medium ${item.amberLeadsPercentage >= 30 ? 'text-amber-400' : 'text-gray-300'}`}>
                  {item.amberLeadsPercentage.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-700">
          <tr>
            <td className="px-6 py-3 text-sm font-medium text-white">Totals</td>
            <td className="px-6 py-3"></td>
            <td className="px-6 py-3"></td>
            <td className="px-6 py-3 text-sm font-medium text-right text-green-400">{totalGreenLeads}</td>
            <td className="px-6 py-3 text-sm font-medium text-right text-amber-400">{totalAmberLeads}</td>
            <td className="px-6 py-3 text-sm font-medium text-right text-white">{totalLeads}</td>
            <td className="px-6 py-3 text-sm font-medium text-right text-green-400">
              {avgGreenLeadsPercentage.toFixed(1)}%
            </td>
            <td className="px-6 py-3 text-sm font-medium text-right text-amber-400">
              {avgAmberLeadsPercentage.toFixed(1)}%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

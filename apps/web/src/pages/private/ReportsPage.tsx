import React, { useState, useEffect } from 'react';
// Assuming you have an api service setup like previous turns
import { api, parseApiError, downloadFile } from '../../services/api'; 
import type { MonthlyReportData, TransactionType } from '../../types/report';
import { Download, FileText, Loader2, AlertTriangle } from 'lucide-react';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper to generate a range of years for the dropdown
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const ReportsPage: React.FC = () => {
  // State for selectors
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // State for API data
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch report data function
  const fetchReport = async (month: number, year: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/reports/monthly`, {
        params: { month, year }
      });
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch report');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching the report data.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReport(selectedMonth, selectedYear);
  }, []);

  // Handle viewing report after selection changes
  const handleViewReport = () => {
    fetchReport(selectedMonth, selectedYear);
  };

  // Handle downloading programmatically with AJAX
  const handleExport = async (endpoint: string, type: string) => {
    setLoading(true); // Show loader for download too
    setError(null);
    const filename = `report_${selectedYear}_${selectedMonth}.${type}`; // default filename
    
    try {
      const exportPath = `${endpoint}?month=${selectedMonth}&year=${selectedYear}`;
      
      // Use our new authenticated download helper
      await downloadFile(exportPath, filename);
    } catch (err: any) {
      // 2. Consistent error handling (Turns 10 & 19)
      setError(`Failed to download ${type.toUpperCase()} report: ${parseApiError(err).join('; ')}`);
    } finally {
      setLoading(false); // Hide loader
    }
  };

  // Helper UI component for summary cards
  const StatCard: React.FC<{ title: string; value: number; type: TransactionType | 'SAVINGS' }> = ({ title, value, type }) => {
    const valueColor = type === 'INCOME' ? 'text-green-600' : type === 'EXPENSE' ? 'text-red-600' : value >= 0 ? 'text-green-600' : 'text-red-600';
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className={`mt-2 text-3xl font-bold ${valueColor}`}>{formatCurrency(value)}</p>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        </header>

        {/* Controls Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700">Month</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {months.map((name, index) => (
                <option key={name} value={index + 1}>{name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleViewReport}
            className="flex-shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition font-medium text-sm h-[38px]"
          >
            View Report
          </button>
          
          <div className="flex gap-2 h-[38px] ml-auto">
            {/* 3. Updated button handlers to use the new handles and pass file extensions */}
            <button 
              onClick={() => handleExport('/reports/export/csv', 'csv')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition font-medium text-sm"
              disabled={loading} // Add loading check
            >
              <FileText size={16} />
              Export CSV
            </button>
            <button 
              onClick={() => handleExport('/reports/export/pdf', 'pdf')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition font-medium text-sm"
              disabled={loading} // Add loading check
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-12 text-gray-500 gap-3">
            <Loader2 className="animate-spin" />
            <span>Fetching data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
            <AlertTriangle className="flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Data Display */}
        {!loading && !error && reportData && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Income" value={reportData.totalIncome} type="INCOME" />
              <StatCard title="Total Expenses" value={reportData.totalExpense} type="EXPENSE" />
              <StatCard title="Net Savings" value={reportData.netSavings} type="SAVINGS" />
            </section>

            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Transactions for {months[reportData.month - 1]} {reportData.year}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No transactions found for this period.</td>
                      </tr>
                    )}
                    {reportData.transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(tx.transactionDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {tx.description}
                          {tx.notes && <p className="text-xs text-gray-500 font-normal mt-1">{tx.notes}</p>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${tx.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {tx.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tx.account.name}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'EXPENSE' ? '-' : '+'} {formatCurrency(parseFloat(tx.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  AlertCircle, 
  PieChart, 
  Target, 
  ArrowRightLeft,
  Clock
} from 'lucide-react';
import { api, parseApiError } from '../../services/api';
import type { DashboardSummary } from '../../types/dashboard';
import { CategoryIcon } from '../../components/CategoryIcon';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/summary');
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (err) {
      const errors = parseApiError(err);
      setError(errors.join(', '));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numericAmount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm">Loading dashboard summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        { /* <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1> */ }
        <p className="text-sm text-slate-500">Overview of your financial balance, budgets, and recent activity.</p>
      </div>

      {/* 1. Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Balance</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.netBalance)}</p>
        </div>

        {/* Monthly Income */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Income</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.monthlyIncome)}</p>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Expenses</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600">{formatCurrency(summary.monthlyExpenses)}</p>
        </div>

        {/* Monthly Savings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Savings</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${summary.monthlySavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(summary.monthlySavings)}
          </p>
        </div>
      </div>

      {/* 2. Middle Grid: Category Breakdown & Budget Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900 text-base">Expense Category Breakdown</h2>
          </div>

          {summary.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No category expense data available for this period.</p>
          ) : (
            <div className="space-y-4">
              {summary.categoryBreakdown.map((item) => (
                <div key={item.categoryId} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.categoryName}</span>
                    <span className="text-slate-500 font-semibold">{formatCurrency(item.amount)} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget Statuses */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900 text-base">Budget Statuses</h2>
          </div>

          {summary.budgetStatus.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No active budgets found.</p>
          ) : (
            <div className="space-y-4">
              {summary.budgetStatus.map((b) => {
                const isWarning = b.isNearLimit || b.isExceeded;
                const barColor = b.isExceeded ? 'bg-rose-600' : b.isNearLimit ? 'bg-amber-500' : 'bg-emerald-500';

                return (
                  <div key={b.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon icon={b.icon} className="w-4 h-4 text-slate-600" />
                        <span className="font-bold text-sm text-slate-800">{b.categoryName}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {formatCurrency(b.spent)} / {formatCurrency(b.allocated)}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`${barColor} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(b.percentageUsed, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-0.5">
                      <span>{b.percentageUsed}% used</span>
                      {isWarning ? (
                        <span className={`font-semibold ${b.isExceeded ? 'text-rose-600' : 'text-amber-600'}`}>
                          {b.isExceeded ? 'Exceeded limit!' : 'Near limit!'}
                        </span>
                      ) : (
                        <span>{formatCurrency(b.remaining)} left</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900 text-base">Recent Transactions</h2>
          </div>
        </div>

        {summary.recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No recent transactions recorded.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {summary.recentTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const isTransfer = tx.type === 'TRANSFER';
              const typeColor = isIncome ? 'text-emerald-600' : isTransfer ? 'text-indigo-600' : 'text-rose-600';

              return (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600">
                      {isTransfer ? (
                        <ArrowRightLeft className="w-5 h-5" />
                      ) : (
                        <CategoryIcon icon={tx.category?.icon} className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{tx.description}</h4>
                      <p className="text-xs text-slate-500">
                        {tx.account.name} • {tx.category?.name || 'Uncategorized'} • {new Date(tx.transactionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${typeColor}`}>
                      {isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
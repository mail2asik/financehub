import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, AlertCircle, TrendingUp, TrendingDown, Target, X } from 'lucide-react';
import { api, parseApiError } from '../../services/api';
import type { Budget, CreateBudgetPayload } from '../../types/budget';
import type { Category } from '../../types/category';
import { CategoryIcon } from '../../components/CategoryIcon';
    
const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

export const Budgets: React.FC = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Filter state
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  // Data state
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formCategoryId, setFormCategoryId] = useState<string>('');
  const [formAllocated, setFormAllocated] = useState<number | ''>('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Generate year options (current year to 5 years in the future)
  const yearOptions = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => currentYear + i);
  }, [currentYear]);

  const fetchReferenceData = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchBudget = async (month: number, year: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/budgets?month=${month}&year=${year}`);
      if (response.data.success) {
        setBudget(response.data.data);
      } else {
        setBudget(null);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setBudget(null); // No budget set for this month yet
      } else {
        setError('Failed to fetch budget data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReferenceData();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBudget(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const openModal = (existingCategoryId?: string, existingAllocated?: number) => {
    setFormCategoryId(existingCategoryId || '');
    setFormAllocated(existingAllocated || '');
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    if (!formCategoryId) {
      setFormErrors(['Category selection is required']);
      return;
    }
    if (!formAllocated || Number(formAllocated) <= 0) {
      setFormErrors(['Allocated amount must be greater than 0']);
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateBudgetPayload = {
        month: selectedMonth,
        year: selectedYear,
        categories: [
          {
            categoryId: formCategoryId,
            allocated: Number(formAllocated),
          }
        ]
      };

      await api.post('/budgets', payload);
      setIsModalOpen(false);
      fetchBudget(selectedMonth, selectedYear);
    } catch (err) {
      setFormErrors(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Summary Calculations (Fallback to 0 if no budget exists)
  const totalAllocated = budget?.totalAllocated || 0;
  const totalSpent = budget?.totalSpent || 0;
  const totalRemaining = budget?.totalRemaining || 0;
  const totalPercentage = totalAllocated > 0 ? Math.min((totalSpent / totalAllocated) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          { /* <h1 className="text-2xl font-bold text-slate-900">Budgets</h1> */ }
          <p className="text-sm text-slate-500">Plan and monitor your monthly spending.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Budget
          </button>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Budgeted</p>
            <p className="text-xl font-bold text-slate-900">₹{totalAllocated.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Spent</p>
            <p className="text-xl font-bold text-slate-900">₹{totalSpent.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Remaining</p>
            <p className="text-xl font-bold text-slate-900">₹{totalRemaining.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <h3 className="font-semibold text-slate-800">Overall Month Progress</h3>
          <span className="text-sm font-medium text-slate-600">{totalPercentage.toFixed(1)}% Used</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              totalPercentage >= 100 ? 'bg-rose-500' : totalPercentage > 85 ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${totalPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading budget data...</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>
      ) : !budget || budget.categories.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-400 mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No Budgets Set</h3>
          <p className="text-slate-500 text-sm mb-4">You haven't allocated any budgets for this month yet.</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium rounded-lg transition"
          >
            Create First Budget
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {budget.categories.map((cat) => (
            <div key={cat.id} className="p-5 hover:bg-slate-50/50 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{cat.categoryName}</h4>
                    <p className="text-xs text-slate-500">
                      ₹{cat.spent.toLocaleString()} / ₹{cat.allocated.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-semibold ${cat.isExceeded ? 'text-rose-600' : 'text-slate-900'}`}>
                      {cat.remaining < 0 ? '-' : ''}₹{Math.abs(cat.remaining).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">left</p>
                  </div>
                  <button
                    onClick={() => openModal(cat.categoryId, cat.allocated)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.isExceeded ? 'bg-rose-500' : cat.isNearLimit ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(cat.percentageUsed, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-slate-600 w-9 text-right">
                  {cat.percentageUsed}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Manage Budget</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formErrors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1 mb-4">
                  {formErrors.map((err, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-rose-700">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  required
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Allocated Amount (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formAllocated}
                  onChange={(e) => setFormAllocated(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition"
                >
                  {submitting ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
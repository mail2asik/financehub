import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  Plus, 
  Trash2, 
  ArrowRightLeft, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  X,
  type LucideIcon
} from 'lucide-react';
import { api, parseApiError } from '../../services/api'; 
import type { RecurringTransaction, CreateRecurringPayload, RecurringTransactionType, RecurringFrequency } from '../../types/recurring';
import type { Account } from '../../types/account'; 
import type { Category } from '../../types/category'; 
import { StatusBadge } from '../../components/StatusBadge';

const FREQUENCIES: RecurringFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

const RecurringTransactions: React.FC = () => {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form Fields
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [type, setType] = useState<RecurringTransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>(''); 
  const [description, setDescription] = useState<string>('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('MONTHLY');
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0] 
  );

  const fetchPreloadedData = async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/categories')
      ]);
      if (accRes.data.success) setAccounts(accRes.data.data.accounts || []);
      if (catRes.data.success) setCategories(catRes.data.data || []);
    } catch (err) {
      console.error('Failed to load preloaded options', err);
    }
  };

  const fetchRecurring = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/recurring-transactions');
      if (response.data.success) {
        setRecurring(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch recurring transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPreloadedData();
    fetchRecurring();
  }, []);

  const resetForm = () => {
    setAccountId('');
    setToAccountId('');
    setCategoryId('');
    setType('EXPENSE');
    setAmount('');
    setDescription('');
    setFrequency('MONTHLY');
    setStartDate(new Date().toISOString().split('T')[0]);
    setFormErrors([]);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!accountId) errors.push('Source Account (Account ID) is mandatory');
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0.01) {
      errors.push('Amount must be a number greater than or equal to 0.01');
    }
    if (!description.trim()) errors.push('Description is required');
    
    // Conditional Mandatory Validation for Transfers
    if (type === 'TRANSFER' && !toAccountId) {
      errors.push('Destination Account (To Account) is mandatory for transfers');
    }

    if (accountId && toAccountId && accountId === toAccountId) {
        errors.push('Source and Destination accounts cannot be identical');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload: CreateRecurringPayload = {
        accountId,
        toAccountId: type === 'TRANSFER' ? toAccountId : null,
        categoryId: categoryId || null,
        type,
        amount: Number(amount),
        description,
        frequency,
        startDate
      };
      
      await api.post('/recurring-transactions', payload);
      setIsModalOpen(false);
      fetchRecurring(); 
    } catch (err) {
      setFormErrors(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this recurring schedule?')) return;
    try {
      await api.delete(`/recurring-transactions/${id}`);
      fetchRecurring(); 
    } catch (err) {
      alert('Failed to delete transaction');
    }
  };

  const getAccountName = (id: string | null) => {
    if (!id) return '';
    return accounts.find(acc => acc.id === id)?.name || id;
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return 'Uncategorized';
    return categories.find(cat => cat.id === id)?.name || 'Uncategorized';
  };

  const getTypeDetails = (type: RecurringTransactionType): { label: string; icon: LucideIcon; color: string } => {
    switch (type) {
      case 'INCOME': return { label: 'Income', icon: TrendingUp, color: 'text-emerald-600' };
      case 'EXPENSE': return { label: 'Expense', icon: TrendingDown, color: 'text-rose-600' };
      case 'TRANSFER': return { label: 'Transfer', icon: ArrowRightLeft, color: 'text-indigo-600' };
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          { /* <h1 className="text-2xl font-bold text-slate-900">Recurring Payments</h1> */ }
          <p className="text-sm text-slate-500">Manage automated incomes, expenses, and transfers.</p> 
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Schedule
        </button>
      </div>

      {/* List Area */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading schedules...</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>
      ) : recurring.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <p>No recurring transaction schedules found.</p>
          <button
            onClick={handleOpenModal}
            className="px-4 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
          >
            Create your first schedule
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {recurring.map((item) => {
            const { icon: Icon, color: typeColor } = getTypeDetails(item.type);
            return (
              <div key={item.id} className="p-5 hover:bg-slate-50/50 transition grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                
                <div className="md:col-span-2 space-y-1">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${typeColor}`} />
                    <h3 className="font-bold text-slate-900 text-sm">{item.description}</h3>
                    <StatusBadge isActive={item.isActive} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Repeats <span className="font-semibold text-slate-700">{item.frequency}</span> starting {new Date(item.startDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-sm space-y-1.5 md:col-span-2">
                    {item.type === 'TRANSFER' ? (
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <span>{getAccountName(item.accountId)}</span>
                            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                            <span>{getAccountName(item.toAccountId)}</span>
                        </div>
                    ) : (
                        <p className="font-medium text-slate-700">{getAccountName(item.accountId)}</p>
                    )}
                    <p className="text-xs text-slate-500">Category: <span className="font-medium text-slate-600">{getCategoryName(item.categoryId)}</span></p>
                </div>

                <div className="flex items-center justify-between md:justify-end md:gap-6">
                  <div className="text-right">
                    <p className={`text-xl font-bold ${typeColor}`}>
                        ₹{Number(item.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">Next: {new Date(item.nextExecutionDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Archive Schedule"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-md transition disabled:opacity-50"
                      disabled={!item.isActive}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Repeat className="w-5 h-5 text-indigo-500" />
                Create Recurring Schedule
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 pb-6 space-y-4">
              {formErrors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
                  {formErrors.map((err, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-rose-700">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as RecurringTransactionType)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="EXPENSE">EXPENSE</option>
                    <option value="INCOME">INCOME</option>
                    <option value="TRANSFER">TRANSFER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-left text-xs font-semibold text-slate-700 mb-1">
                    {type === 'TRANSFER' ? 'From Account' : 'Account'} *
                  </label>
                  <select
                    required
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                {type === 'TRANSFER' ? (
                  <div>
                    <label className="block text-left text-xs font-semibold text-slate-700 mb-1">To Account *</label>
                    <select
                      required
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Select Destination</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Category (Optional)</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Monthly Salary or Broadband Bill"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Frequency *</label>
                  <select
                    required
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
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
                  {submitting ? 'Creating...' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTransactions;
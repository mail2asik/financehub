import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  X 
} from 'lucide-react';
import { api, parseApiError } from '../../services/api';
import type { Transaction, TransactionType, PaginationMeta } from '../../types/transaction';
import type { Account } from '../../types/account';
import type { Category } from '../../types/category';
import { CategoryIcon } from '../../components/CategoryIcon';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Preloaded Reference Data
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form State
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch preloaded options for dropdowns
  const fetchReferenceData = async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/categories')
      ]);
      if (accRes.data.success) {
        setAccounts(accRes.data.data.accounts || []);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load reference options', err);
    }
  };

  // Fetch paginated transactions list
  const fetchTransactions = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await api.get(`/transactions?page=${page}&limit=${limit}`);
      if (response.data.success) {
        setTransactions(response.data.data.items);
        setMeta(response.data.data.meta);
      }
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
    fetchTransactions(1, 10);
  }, []);

  const openCreateModal = () => {
    setEditingTransaction(null);
    setAccountId(accounts[0]?.id || '');
    setToAccountId('');
    setCategoryId('');
    setType('EXPENSE');
    setAmount('');
    setDescription('');
    setNotes('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setAccountId(tx.accountId);
    setToAccountId(tx.toAccountId || '');
    setCategoryId(tx.categoryId || '');
    setType(tx.type);
    setAmount(Number(tx.amount));
    setDescription(tx.description);
    setNotes(tx.notes || '');
    setTransactionDate(tx.transactionDate.split('T')[0]);
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!accountId) {
      errors.push('Account selection is required');
    }

    if (type === 'TRANSFER') {
      if (!toAccountId) {
        errors.push('Destination Account (To Account) is required for transfers');
      }
      if (accountId && toAccountId && accountId === toAccountId) {
        errors.push('Source and Destination accounts cannot be the same');
      }
    }

    if (!amount || Number(amount) <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!description.trim()) {
      errors.push('Description is required');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        accountId,
        toAccountId: type === 'TRANSFER' ? toAccountId : null,
        categoryId: categoryId ? categoryId : null,
        type,
        amount: Number(amount),
        description,
        notes,
        transactionDate
      };

      if (editingTransaction) {
        await api.patch(`/transactions/${editingTransaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      setIsModalOpen(false);
      fetchTransactions(meta.page, meta.limit);
    } catch (err) {
      setFormErrors(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions(meta.page, meta.limit);
    } catch (err) {
      alert('Failed to delete transaction');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          { /* <h1 className="text-2xl font-bold text-slate-900">Transactions</h1> */ }
          <p className="text-sm text-slate-500">Track and manage your incomes, expenses, and account transfers.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading transactions...</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Account</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isExpense = tx.type === 'EXPENSE';
                  const isTransfer = tx.type === 'TRANSFER';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {new Date(tx.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                          isIncome ? 'bg-emerald-50 text-emerald-700' :
                          isExpense ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {isIncome && <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />}
                          {isExpense && <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />}
                          {isTransfer && <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{tx.description}</p>
                        {tx.notes && <p className="text-xs text-slate-400 mt-0.5">{tx.notes}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                        {isTransfer ? (
                          <span className="flex items-center gap-1.5 font-medium">
                            {tx.account?.name} <ArrowRightLeft className="w-3 h-3 text-slate-400" /> {tx.toAccount?.name}
                          </span>
                        ) : (
                          <span>{tx.account?.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {tx.category ? (
                          <div className="flex items-center gap-2">
                            <CategoryIcon name={tx.category.icon} className="w-4 h-4 text-slate-500" />
                            <span>{tx.category.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${
                        isIncome ? 'text-emerald-600' : isExpense ? 'text-slate-900' : 'text-blue-600'
                      }`}>
                        {isExpense ? '-' : isIncome ? '+' : ''}₹{Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Control */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} Total Items)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => fetchTransactions(meta.page - 1, meta.limit)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white disabled:opacity-50 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchTransactions(meta.page + 1, meta.limit)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white disabled:opacity-50 hover:bg-slate-50 transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingTransaction ? 'Edit Transaction' : 'Create New Transaction'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 pb-6 space-y-4">
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
                  <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="EXPENSE">EXPENSE</option>
                    <option value="INCOME">INCOME</option>
                    <option value="TRANSFER">TRANSFER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
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
                      <option value="">None / Uncategorized</option>
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
                  placeholder="e.g. Grocery Purchase"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Transaction Date</label>
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add supplementary notes..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
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
                  {submitting ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Create Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
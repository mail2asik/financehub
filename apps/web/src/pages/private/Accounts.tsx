import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  CreditCard, 
  CircleDollarSign, 
  PiggyBank, 
  Landmark,
  AlertCircle,
  X
} from 'lucide-react';
import { api, parseApiError } from '../../services/api';
import type { Account, AccountSummary, AccountType, AccountCurrency } from '../../types/account';

const ACCOUNT_TYPES: AccountType[] = ['BANK', 'CASH', 'CREDIT_CARD', 'WALLET', 'INVESTMENT', 'LOAN'];
const CURRENCIES: AccountCurrency[] = ['INR', 'USD', 'CAD', 'AUD', 'SGD'];

export const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<AccountSummary>({ netBalance: 0, totalAssets: 0, totalLiabilities: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  // Form fields
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AccountType>('BANK');
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<AccountCurrency>('INR');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/accounts');
      if (response.data.success) {
        setAccounts(response.data.data.accounts);
        setSummary(response.data.data.summary);
      }
    } catch (err) {
      setError('Failed to fetch accounts list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openCreateModal = () => {
    setEditingAccount(null);
    setName('');
    setType('BANK');
    setInitialBalance(0);
    setCurrency('INR');
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setName(account.name);
    setType(account.type);
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    if (!name.trim()) {
      setFormErrors(['Account name is required']);
      return;
    }

    setSubmitting(true);
    try {
      if (editingAccount) {
        await api.patch(`/accounts/${editingAccount.id}`, { name, type });
      } else {
        await api.post('/accounts', {
          name,
          type,
          initialBalance: Number(initialBalance),
          currency
        });
      }
      setIsModalOpen(false);
      fetchAccounts();
    } catch (err) {
      setFormErrors(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this account?')) return;
    try {
      await api.delete(`/accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      alert('Failed to archive account');
    }
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'BANK': return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'CREDIT_CARD': return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'CASH': return <CircleDollarSign className="w-5 h-5 text-emerald-600" />;
      case 'WALLET': return <Wallet className="w-5 h-5 text-amber-600" />;
      case 'INVESTMENT': return <PiggyBank className="w-5 h-5 text-indigo-600" />;
      case 'LOAN': return <Landmark className="w-5 h-5 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* <h1 className="text-2xl font-bold text-slate-900">Accounts</h1> */}
          <p className="text-sm text-slate-500">Manage your bank accounts, cards, wallets, and investments.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Balance</span>
            <Wallet className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{summary.netBalance.toLocaleString()}</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Assets</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">₹{summary.totalAssets.toLocaleString()}</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Liabilities</span>
            <TrendingDown className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600">₹{summary.totalLiabilities.toLocaleString()}</p>
        </div>
      </div>

      {/* Account Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading accounts...</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{acc.name}</h3>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-slate-100 text-slate-600 rounded mt-0.5">
                      {acc.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(acc)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-md transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">Balance</span>
                <span className={`text-lg font-bold ${Number(acc.balance) < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {acc.currency} {Number(acc.balance).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{editingAccount ? 'Edit Account' : 'Create New Account'}</h3>
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

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HDFC Savings"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Account Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {!editingAccount && (
                <>
                  <div>
                    <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Initial Balance</label>
                    <input
                      type="number"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as AccountCurrency)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

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
                  {submitting ? 'Saving...' : editingAccount ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
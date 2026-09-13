import React, { useState, useEffect } from 'react';
import { Target, Plus, PiggyBank, X, AlertCircle } from 'lucide-react';
import { api, parseApiError } from '../../services/api';
import type { GoalListItem, CreateGoalPayload, ContributeGoalPayload } from '../../types/goal';

const Goals: React.FC = () => {
  // State for listing goals
  const [goals, setGoals] = useState<GoalListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for Create Goal Modal/Form
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newTarget, setNewTarget] = useState<string>(''); // Keep as string for input handling

  // State for Contribute Modal/Form
  const [contributingGoal, setContributingGoal] = useState<GoalListItem | null>(null);
  const [contribAmount, setContribAmount] = useState<string>(''); // Keep as string for input handling
  const [contribNotes, setContribNotes] = useState<string>('');

  // Form interaction state
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 1. Fetch data function
  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/goals');
      if (response.data.success) {
        setGoals(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch goals list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGoals();
  }, []);

  // 2. Handle Create Goal Submission
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    const target = Number(newTarget);

    // Frontend Validation
    if (!newName.trim()) {
      setFormErrors(['Goal name is required']);
      return;
    }
    if (isNaN(target) || target < 1) {
      setFormErrors(['Target amount must be a number greater than or equal to 1']);
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateGoalPayload = { name: newName, targetAmount: target };
      const response = await api.post('/goals', payload);
      if (response.data.success) {
        // Reset form, close modal, refresh list
        setIsCreateModalOpen(false);
        setNewName('');
        setNewTarget('');
        fetchGoals();
      }
    } catch (err) {
      setFormErrors(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Handle Contribution Submission
  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    const amount = Number(contribAmount);

    if (!contributingGoal) return;

    // Frontend Validation
    if (isNaN(amount) || amount < 0.01) {
      setFormErrors(['Contribution amount must be a number greater than or equal to 0.01']);
      return;
    }

    setSubmitting(true);
    try {
      const payload: ContributeGoalPayload = { amount, notes: contribNotes };
      const response = await api.post(`/goals/${contributingGoal.id}/contribute`, payload);
      if (response.data.success) {
        // Reset form, close modal, refresh list
        setContributingGoal(null);
        setContribAmount('');
        setContribNotes('');
        fetchGoals();
      }
    } catch (err) {
      setFormErrors(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Savings Goals</h1>
          <p className="text-sm text-slate-500">Plan and track your long-term savings</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add New Goal
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading your goals...</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">No Goals Yet</h3>
          <p className="text-slate-500 text-sm mb-5">Set your first savings target to get started!</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium rounded-lg transition"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        /* Goals Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{goal.name}</h3>
                  <p className="text-xs text-slate-500">
                    {goal.isCompleted ? 'Completed!' : `Target: ₹${goal.targetAmount.toLocaleString()}`}
                  </p>
                </div>
                {goal.targetDate && (
                  <div className="text-right text-xs text-slate-400">
                    Target Date: <br /> {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">
                    Saved: ₹{goal.currentAmount.toLocaleString()} (₹{(goal.targetAmount - goal.currentAmount).toLocaleString()} left)
                  </span>
                  <span className="text-indigo-600">{goal.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              {!goal.isCompleted && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setContributingGoal(goal)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    <PiggyBank className="w-4 h-4" /> Contribute
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- Modals --- */}

      {/* 1. Create Goal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add Savings Goal</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Display */}
            {formErrors.length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                {formErrors.map((err, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-medium text-rose-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. New Car"
                />
              </div>
              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Target Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. 500000"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg shadow-sm transition text-sm"
              >
                {submitting ? 'Creating...' : 'Create Goal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Contribute Modal */}
      {contributingGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add Contribution</h2>
                <p className="text-sm text-slate-500">For: {contributingGoal.name}</p>
              </div>
              <button onClick={() => setContributingGoal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Display */}
            {formErrors.length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                {formErrors.map((err, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-medium text-rose-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Contribution Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={contribNotes}
                  onChange={(e) => setContribNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Source of funds"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg shadow-sm transition text-sm flex items-center justify-center gap-2"
              >
                <PiggyBank className="w-4 h-4" />
                {submitting ? 'Processing...' : 'Add Contribution'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
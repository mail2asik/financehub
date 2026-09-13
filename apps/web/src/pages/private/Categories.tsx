import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { api, parseApiError } from '../../services/api';
import type { Category, CategoryType } from '../../types/category';
import { CategoryIcon, COMMON_ICONS } from '../../components/CategoryIcon';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering tab state
  const [activeTab, setActiveTab] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form input states
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<CategoryType>('EXPENSE');
  const [icon, setIcon] = useState<string>('tag');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch categories list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setType('EXPENSE');
    setIcon('tag');
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    // Prevent opening edit for system categories
    if (category.userId === null) return;

    setEditingCategory(category);
    setName(category.name);
    setType(category.type);
    setIcon(category.icon);
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    if (!name.trim()) {
      setFormErrors(['Category name is required']);
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, { name, type, icon });
      } else {
        await api.post('/categories', { name, type, icon });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormErrors(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.userId === null) return;

    if (!window.confirm(`Are you sure you want to delete category "${category.name}"?`)) return;
    try {
      await api.delete(`/categories/${category.id}`);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (activeTab === 'ALL') return true;
    return cat.type === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* <h1 className="text-2xl font-bold text-slate-900">Categories</h1> */}
          <p className="text-sm text-slate-500">Organize your income and expense tracking categories.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['ALL', 'INCOME', 'EXPENSE'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All Categories' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading categories...</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const isSystem = cat.userId === null;
            const isIncome = cat.type === 'INCOME';

            return (
              <div
                key={cat.id}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg border ${
                      isIncome
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                      {isSystem && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-500 rounded border border-slate-200">
                          <ShieldCheck className="w-3 h-3 text-slate-400" /> System
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {cat.type}
                    </span>
                  </div>
                </div>

                {/* Actions: Disabled for system categories */}
                {!isSystem ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-md transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-1 text-slate-300" title="System categories cannot be edited or deleted">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
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

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Share Dividends"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Category Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CategoryType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="INCOME">INCOME</option>
                  <option value="EXPENSE">EXPENSE</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-xs font-semibold text-slate-700 mb-1">Select Icon</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {COMMON_ICONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} ({item.id})
                    </option>
                  ))}
                </select>
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
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
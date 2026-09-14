import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Zap, PieChart, ArrowRight, CheckCircle2 } from 'lucide-react';
import dashboardImg from '../../assets/dashboard.png';

export const Home: React.FC = () => {
  const features: string[] = [
    'Automated recurring bill notifications',
    'Custom Category tagging & color coding',
    'Multi-account asset aggregation'
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-b from-indigo-50/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
              <Zap className="w-3.5 h-3.5" /> Next-Gen Personal Wealth Management
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Master your money with total clarity and control.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Track multi-currency accounts, automate budgets, and monitor recurring bills in one centralized platform built for modern financial management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/register"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 text-center transition flex items-center justify-center gap-2"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/how-it-works"
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 text-center transition"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Banner Showcase linked to Register/Dashboard */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <Link
              to="/register"
              className="relative block bg-white border border-slate-200 rounded-2xl p-2 shadow-xl overflow-hidden transition-transform transform group-hover:-translate-y-1"
            >
              <img
                src={dashboardImg}
                alt="FinanceHub Dashboard Preview"
                className="w-full h-auto rounded-xl object-cover"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-bold text-slate-900">Designed for Total Financial Control</h2>
          <p className="text-slate-600">Everything you need to plan budgets, analyze spending, and reach financial goals faster.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Real-Time Analytics</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Automatically categorize transactions and visualize cashflow trends with dynamic charts and graphs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Smart Budgeting</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Set monthly budgets by category and receive alerts before exceeding your threshold limits.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Bank-Grade Security</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Your credentials and records are protected using standard JWT authentication and encrypted data storage.
            </p>
          </div>
        </div>
      </section>

      {/* Secondary Visual Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-snug">
              Uncover insights into your spending habits effortlessly.
            </h2>
            <ul className="space-y-3">
              {features.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 h-64 flex items-center justify-center border-dashed">
            <p className="text-slate-400 font-medium text-sm">Analytics Chart Preview</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
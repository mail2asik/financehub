import React from 'react';
import { Target, Shield, Heart } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-100 text-slate-900 py-20 relative overflow-hidden flex justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 flex flex-col items-center">
          <span className="text-indigo-400 font-semibold text-xs uppercase tracking-widest">Our Mission</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto">
            Democratizing Personal Financial Clarity for Everyone
          </h1>
          <p className="text-slate-700 max-w-2xl mx-auto text-base sm:text-lg">
            We believe financial freedom starts with transparency. FinanceHub was built to provide intuitive wealth management tools without complex spreadsheets.
          </p>
        </div>
      </section>

      {/* Vision & Team Image Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">Empowering individuals to reach long-term goals</h2>
          <p className="text-slate-600 leading-relaxed">
            Founded by financial engineering experts and software architects, FinanceHub bridges the gap between bank accounts and strategic financial planning. Our platform process millions in monthly transactions securely.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border-l-4 border-indigo-600 pl-4">
              <span className="block text-2xl font-bold text-slate-900">100K+</span>
              <span className="text-xs text-slate-500">Active Monthly Users</span>
            </div>
            <div className="border-l-4 border-emerald-500 pl-4">
              <span className="block text-2xl font-bold text-slate-900">$2.5B+</span>
              <span className="text-xs text-slate-500">Assets Tracked</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
          <img
            src="image_agent_tag_13494431757081107068"
            alt="FinanceHub team collaborating in modern office space"
            title="The Team Behind FinanceHub"
          />
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Guided by Our Core Principles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Privacy First</h3>
            <p className="text-sm text-slate-600">Your financial data is never sold or shared. We enforce zero-trust encryption standards.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <Target className="w-8 h-8 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Actionable Insights</h3>
            <p className="text-sm text-slate-600">We don't just display numbers; we transform raw data into custom spending strategies.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <Heart className="w-8 h-8 text-rose-500" />
            <h3 className="text-lg font-bold text-slate-900">User Centric</h3>
            <p className="text-sm text-slate-600">Every feature is designed with simplicity in mind, ensuring an effortless experience.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
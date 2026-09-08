import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Sequence: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="space-y-6">{children}</div>
);

const Step: React.FC<React.PropsWithChildren<{ subtitle: string; title: string }>> = ({
  subtitle,
  title,
  children,
}) => (
  <div className="border-l-4 border-indigo-500 pl-6">
    <p className="text-sm font-semibold text-indigo-600">{subtitle}</p>
    <h2 className="mt-1 text-xl font-bold text-slate-900">{title}</h2>
    <p className="mt-2 text-slate-600">{children}</p>
  </div>
);

export const HowItWorks: React.FC = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <section className="bg-indigo-50 text-slate-900 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-4xl font-extrabold">How FinanceHub Works</h1>
          <p className="text-slate-700 text-base sm:text-lg">
            Four simple steps to transform fragmented bank accounts into structured financial insights.
          </p>
        </div>
      </section>

      {/* Workflow Sequence */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Sequence>
          <Step subtitle="Duration: ~1 minute" title="1. Create Your Free Account">
            Register with your primary email address and verify your account. No credit card is required to begin.
          </Step>

          <Step subtitle="Duration: ~2 minutes" title="2. Add Accounts & Initial Balances">
            Set up cash, bank accounts, credit cards, or investment ledgers across multiple currencies.
          </Step>

          <Step subtitle="Duration: Ongoing" title="3. Define Custom Categories & Budgets">
            Organize spending into custom color-coded categories (e.g., Groceries, Rent, Subscriptions) and assign target monthly thresholds.
          </Step>

          <Step subtitle="Instant Analysis" title="4. Monitor Real-Time Analytics & Growth Goals">
            Review automated spending distribution charts, keep track of recurring payments, and monitor target goal progress.
          </Step>
        </Sequence>
      </section>

      {/* Platform Screenshot Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md">Live Platform View</span>
            <h3 className="text-2xl font-bold text-slate-900">Unified Multi-Account Analytics</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Filter transactions by category, period, or account type. Our intelligent charts compute net wealth and cash balance flow in real-time.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div>
            <img
              src="image_agent_tag_13494431757081104509"
              alt="FinanceHub real-time dashboard analytics user interface"
              title="Real-Time Analytics Dashboard"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
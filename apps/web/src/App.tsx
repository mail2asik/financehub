import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';
import Home from './pages/public/Home';

const queryClient = new QueryClient();

interface PagePlaceholderProps {
  title: string;
}

const PagePlaceholder: React.FC<PagePlaceholderProps> = ({ title }) => (
  <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
    <h2 className="text-2xl font-bold text-slate-800 mb-2">{title} Page</h2>
    <p className="text-slate-500">API integration and views will be populated in the next step.</p>
  </div>
);

export function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<PagePlaceholder title="About Us" />} />
            <Route path="how-it-works" element={<PagePlaceholder title="How It Works" />} />
            <Route path="contact" element={<PagePlaceholder title="Contact Us" />} />
            <Route path="login" element={<PagePlaceholder title="Login" />} />
            <Route path="register" element={<PagePlaceholder title="Register" />} />
            <Route path="activation" element={<PagePlaceholder title="Account Activation" />} />
            <Route path="forgot-password" element={<PagePlaceholder title="Forgot Password" />} />
            <Route path="reset-password" element={<PagePlaceholder title="Reset Password" />} />
          </Route>

          {/* Private Routes */}
          <Route path="/" element={<PrivateLayout />}>
            <Route path="dashboard" element={<PagePlaceholder title="Dashboard" />} />
            <Route path="accounts" element={<PagePlaceholder title="Accounts" />} />
            <Route path="categories" element={<PagePlaceholder title="Categories" />} />
            <Route path="transactions" element={<PagePlaceholder title="Transactions" />} />
            <Route path="budgets" element={<PagePlaceholder title="Budgets" />} />
            <Route path="goals" element={<PagePlaceholder title="Goals" />} />
            <Route path="recurring" element={<PagePlaceholder title="Recurring Transactions" />} />
            <Route path="reports" element={<PagePlaceholder title="Reports" />} />
            <Route path="profile" element={<PagePlaceholder title="Profile Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
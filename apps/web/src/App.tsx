import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import HowItWorks from './pages/public/HowItWorks';
import Contact from './pages/public/Contact';
import Register from './pages/public/Register';
import Activation from './pages/public/Activation';
import Login from './pages/public/Login';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import Accounts from './pages/private/Accounts';
import Categories from './pages/private/Categories';
import Transactions from './pages/private/Transactions';
import Budgets from './pages/private/Budgets';
import Goals from './pages/private/Goals';
import RecurringTransactions from './pages/private/RecurringTransactions';
import ReportsPage from './pages/private/ReportsPage';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PagePlaceholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
    <h2 className="text-2xl font-bold text-slate-800 mb-2">{title} Page</h2>
    <p className="text-slate-500">API endpoints will be integrated in subsequent steps.</p>
  </div>
);

export function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="activation" element={<Activation />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>

            {/* Private Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <PrivateLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<PagePlaceholder title="Dashboard" />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="categories" element={<Categories />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="goals" element={<Goals />} />
              <Route path="recurring" element={<RecurringTransactions />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="profile" element={<PagePlaceholder title="Profile Settings" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
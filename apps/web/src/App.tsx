import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  FinanceHub
                </h1>
                <p className="mt-2 text-base text-gray-600">
                  Foundation successfully configured with Tailwind CSS.
                </p>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
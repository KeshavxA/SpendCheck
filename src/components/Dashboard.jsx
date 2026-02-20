import { useState } from 'react';
import { Receipt } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import StatsCards from './StatsCards';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Charts from './Charts';
import AIInsights from './AIInsights';

const Dashboard = () => {
  const { clearAll } = useFinance();
  const { theme } = useTheme();
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">

      <header className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg shadow-blue-200 dark:shadow-none">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SpendCheck</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your finances with ease</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                  transition-colors font-medium shadow-sm"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <StatsCards />
        <AIInsights />

        <TransactionForm
          editingTransaction={editingTransaction}
          onCancelEdit={handleCancelEdit}
        />

        <div className="mb-6">
          <Charts />
        </div>

        <TransactionList onEditTransaction={handleEditTransaction} />
      </main>

      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            Created by Keshav Sharma
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
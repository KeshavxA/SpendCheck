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
import BudgetProgress from './BudgetProgress';
import BudgetForm from './BudgetForm';

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 pb-12">

      <header className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700 transition-colors sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 sm:p-3 rounded-lg shadow-blue-200 dark:shadow-none">
                <Receipt className="w-6 h-6 sm:w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">SpendCheck</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Master your money with AI</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <ThemeToggle />
              <button
                onClick={clearAll}
                className="px-3 sm:px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white 
                  transition-all font-medium text-sm sm:text-base"
              >
                Reset App
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Section: Overview & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <StatsCards />
            <AIInsights />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <BudgetProgress />
            <BudgetForm />
          </div>
        </div>

        {/* Action Section: Transactions & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-12 xl:col-span-5">
            <TransactionForm
              editingTransaction={editingTransaction}
              onCancelEdit={handleCancelEdit}
            />
          </div>
          <div className="lg:col-span-12 xl:col-span-7">
            <Charts />
          </div>
        </div>

        {/* Detailed List */}
        <div className="pt-4">
          <TransactionList onEditTransaction={handleEditTransaction} />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="border-t border-gray-200 dark:border-slate-700 py-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © 2024 SpendCheck • Crafted by <span className="font-semibold text-blue-500">Keshav Sharma</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
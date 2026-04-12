import { useState } from 'react';
import { RotateCcw, LayoutDashboard, Wallet, Briefcase, Receipt } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import ThemeToggle from './ThemeToggle';
import StatsCards from './StatsCards';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Charts from './Charts';
import AIInsights from './AIInsights';
import BudgetProgress from './BudgetProgress';
import HealthScore from './HealthScore';
import ExportReports from './ExportReports';
import AffordabilityPredictor from './AffordabilityPredictor';
import SavingsGoals from './SavingsGoals';
import SavingsChallenges from './SavingsChallenges';
import WealthDashboard from './WealthDashboard';

const Dashboard = () => {
  const { clearAll } = useFinance();
  const [activeTab, setActiveTab] = useState('daily');
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 pb-12">

      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-[50] border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">SpendCheck</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wealth Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveTab('daily')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'daily'
                    ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                >
                  <Receipt className="w-4 h-4" /> Tracker
                </button>
                <button
                  onClick={() => setActiveTab('wealth')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'wealth'
                    ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                >
                  <Briefcase className="w-4 h-4" /> Wealth
                </button>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
              <ThemeToggle />
              <button
                onClick={clearAll}
                className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 rounded-xl transition-all border border-red-100 dark:border-red-900/20"
                title="Reset Workspace"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <div className="md:hidden flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'daily'
              ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm'
              : 'text-slate-400'
              }`}
          >
            Tracker
          </button>
          <button
            onClick={() => setActiveTab('wealth')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'wealth'
              ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm'
              : 'text-slate-400'
              }`}
          >
            Wealth
          </button>
        </div>

        {activeTab === 'daily' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <HealthScore />
                  <AffordabilityPredictor />
                </div>
                <StatsCards />
                <SavingsChallenges />
                <Charts />
                <AIInsights />
              </div>
              <div className="lg:col-span-4 space-y-8">
                <TransactionForm editingTransaction={editingTransaction} onCancelEdit={handleCancelEdit} />
                <BudgetProgress />
                <SavingsGoals />
                <ExportReports />
              </div>
            </div>
          </div>
        ) : (
          <WealthDashboard />
        )}

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <TransactionList onEditTransaction={handleEditTransaction} />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            © 2024 <span className="font-black text-indigo-500">SpendCheck</span> • AI-Powered Wealth Intelligence
          </p>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Security Verified</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Privacy Focused</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
import { useState } from 'react';
import { Receipt } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import StatsCards from './StatsCards';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Charts from './Charts';

const Dashboard = () => {
  const { clearAll } = useFinance();
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">SpendCheck</h1>
                <p className="text-sm text-gray-600">Track your finances with ease</p>
              </div>
            </div>
            
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                transition-colors font-medium"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards />
        <TransactionForm 
          editingTransaction={editingTransaction}
          onCancelEdit={handleCancelEdit}
        />

        <div className="mb-6">
          <Charts />
        </div>

        <TransactionList onEditTransaction={handleEditTransaction} />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Built with React, Tailwind CSS, and Recharts
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;


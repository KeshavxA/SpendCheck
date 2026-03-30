import { TrendingUp, TrendingDown, Wallet, Hash } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  calculateBalance, calculateTotal, formatCurrency,
  getMonthlyTransactions
} from '../utils/calculations';
import { TRANSACTION_TYPES } from '../constants/categories';

const StatsCards = () => {
  const { transactions } = useFinance();
  const monthlyTransactions = getMonthlyTransactions(transactions);

  const balance = calculateBalance(transactions);
  const monthlyIncome = calculateTotal(monthlyTransactions, TRANSACTION_TYPES.INCOME);
  const monthlyExpenses = calculateTotal(monthlyTransactions, TRANSACTION_TYPES.EXPENSE);
  const transactionCount = transactions.length;

  const stats = [
    {
      title: 'Balance',
      value: formatCurrency(balance),
      icon: Wallet,
      color: balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: balance >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(monthlyIncome),
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(monthlyExpenses),
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Transactions',
      value: transactionCount,
      icon: Hash,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              
              <div className={`${stat.bgColor} p-3 rounded-full transition-colors duration-300`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
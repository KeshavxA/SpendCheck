import { TRANSACTION_TYPES } from '../constants/categories';
import { isThisMonth } from 'date-fns';

export const calculateTotal = (transactions, type) => {
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
};

export const calculateBalance = (transactions) => {
  const income = calculateTotal(transactions, TRANSACTION_TYPES.INCOME);
  const expenses = calculateTotal(transactions, TRANSACTION_TYPES.EXPENSE);
  return income - expenses;
};

export const getMonthlyTransactions = (transactions) => {
  return transactions.filter(t => isThisMonth(new Date(t.date)));
};

export const getCategoryBreakdown = (transactions) => {
  const expenses = transactions.filter(t => 
    t.type === TRANSACTION_TYPES.EXPENSE
  );
  
  const breakdown = {};
  expenses.forEach(t => {
    if (!breakdown[t.category]) {
      breakdown[t.category] = 0;
    }
    breakdown[t.category] += parseFloat(t.amount);
  });
  
  return Object.entries(breakdown).map(([name, value]) => ({
    name,
    value
  }));
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
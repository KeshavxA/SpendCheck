import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { getCategoryBreakdown, calculateTotal, getMonthlyTransactions } from '../utils/calculations';
import { TRANSACTION_TYPES, EXPENSE_CATEGORIES } from '../constants/categories';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const Charts = () => {
  const { transactions } = useFinance();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const monthlyTransactions = getMonthlyTransactions(transactions);

  const categoryData = getCategoryBreakdown(transactions);
  const dataWithColors = categoryData.map(item => {
    const category = EXPENSE_CATEGORIES.find(cat => cat.name === item.name);
    return {
      ...item,
      color: category?.color || '#999999'
    };
  });

  const incomeVsExpense = [
    {
      name: 'Income',
      amount: calculateTotal(monthlyTransactions, TRANSACTION_TYPES.INCOME),
      color: '#4CAF50'
    },
    {
      name: 'Expenses',
      amount: calculateTotal(monthlyTransactions, TRANSACTION_TYPES.EXPENSE),
      color: '#FF6384'
    }
  ];


  const getSpendingTrends = () => {
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = subMonths(new Date(), i);
      const start = startOfMonth(targetDate);
      const end = endOfMonth(targetDate);

      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return isWithinInterval(transactionDate, { start, end });
      });

      const income = calculateTotal(monthTransactions, TRANSACTION_TYPES.INCOME);
      const expenses = calculateTotal(monthTransactions, TRANSACTION_TYPES.EXPENSE);

      trends.push({
        month: format(targetDate, 'MMM yyyy'),
        income,
        expenses,
        balance: income - expenses
      });
    }
    return trends;
  };

  const spendingTrends = getSpendingTrends();

  const getTopCategoriesComparison = () => {
    const currentMonth = getMonthlyTransactions(transactions);
    const lastMonth = transactions.filter(t => {
      const targetDate = subMonths(new Date(), 1);
      const start = startOfMonth(targetDate);
      const end = endOfMonth(targetDate);
      const transactionDate = new Date(t.date);
      return isWithinInterval(transactionDate, { start, end });
    });

    const currentCategories = getCategoryBreakdown(currentMonth);
    const lastCategories = getCategoryBreakdown(lastMonth);

    const allCategories = new Set([
      ...currentCategories.map(c => c.name),
      ...lastCategories.map(c => c.name)
    ]);

    return Array.from(allCategories).map(category => {
      const current = currentCategories.find(c => c.name === category)?.value || 0;
      const last = lastCategories.find(c => c.name === category)?.value || 0;

      return {
        category,
        'This Month': current,
        'Last Month': last
      };
    }).sort((a, b) => b['This Month'] - a['This Month']).slice(0, 5);
  };

  const categoryComparison = getTopCategoriesComparison();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-blue-600">
            ₹{payload[0].value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
      );
    }
    return null;
  };

  const MultiLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: ₹{entry.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Add transactions to see visual insights</p>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Loading charts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Spending Trends (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={spendingTrends}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6384" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FF6384" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<MultiLineTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#4CAF50"
              fillOpacity={1}
              fill="url(#colorIncome)"
              name="Income"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#FF6384"
              fillOpacity={1}
              fill="url(#colorExpenses)"
              name="Expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {categoryComparison.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Category Comparison (This Month vs Last Month)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip content={<MultiLineTooltip />} />
              <Legend />
              <Bar dataKey="This Month" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Last Month" fill="#d8b4fe" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataWithColors}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataWithColors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Income vs Expenses (This Month)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeVsExpense}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#8884d8" radius={[8, 8, 0, 0]}>
                {incomeVsExpense.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;

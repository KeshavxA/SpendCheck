import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { getCategoryBreakdown, calculateTotal, getMonthlyTransactions } from '../utils/calculations';
import { TRANSACTION_TYPES, EXPENSE_CATEGORIES } from '../constants/categories';

const Charts = () => {
  const { transactions } = useFinance();
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

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Add transactions </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {categoryData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Spending by Category</h3>
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
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Income vs Expenses (This Month)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={incomeVsExpense}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Bar dataKey="amount" fill="#8884d8">
              {incomeVsExpense.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
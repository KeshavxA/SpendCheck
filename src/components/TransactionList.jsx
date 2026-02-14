import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/calculations';
import { TRANSACTION_TYPES } from '../constants/categories';

const TransactionList = ({ onEditTransaction }) => {
  const { transactions, deleteTransaction } = useFinance();

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 text-lg">No transactions</p>
        <p className="text-gray-400 text-sm mt-2">Add your transaction above</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold">Recent Transactions</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      transaction.type === TRANSACTION_TYPES.INCOME
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {transaction.category}
                    </p>
                    {transaction.description && (
                      <p className="text-sm text-gray-600">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p
                  className={`text-xl font-bold ${
                    transaction.type === TRANSACTION_TYPES.INCOME
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.type === TRANSACTION_TYPES.INCOME ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => onEditTransaction(transaction)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Repeat } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  EXPENSE_CATEGORIES, INCOME_CATEGORIES,
  TRANSACTION_TYPES
} from '../constants/categories';
import { RECURRING_FREQUENCIES, getFrequencyLabel } from '../utils/recurringExpenses';

const TransactionForm = ({ editingTransaction, onCancelEdit }) => {
  const { addTransaction, editTransaction } = useFinance();

  const [formData, setFormData] = useState({
    type: TRANSACTION_TYPES.EXPENSE,
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    isRecurring: false,
    recurringFrequency: RECURRING_FREQUENCIES.MONTHLY
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTransaction) {
      setFormData(editingTransaction);
    }
  }, [editingTransaction]);

  const categories = formData.type === TRANSACTION_TYPES.EXPENSE
    ? EXPENSE_CATEGORIES
    : INCOME_CATEGORIES;

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const transaction = {
      ...formData,
      id: editingTransaction ? editingTransaction.id : uuidv4(),
      amount: parseFloat(formData.amount)
    };

    if (editingTransaction) {
      editTransaction(transaction);
      onCancelEdit();
    } else {
      addTransaction(transaction);
    }

    setFormData({
      type: TRANSACTION_TYPES.EXPENSE,
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      isRecurring: false,
      recurringFrequency: RECURRING_FREQUENCIES.MONTHLY
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'type' && { category: '' })
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">
        {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              type: TRANSACTION_TYPES.EXPENSE,
              category: ''
            }))}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${formData.type === TRANSACTION_TYPES.EXPENSE
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700'
              }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              type: TRANSACTION_TYPES.INCOME,
              category: ''
            }))}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${formData.type === TRANSACTION_TYPES.INCOME
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700'
              }`}
          >
            Income
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 
              focus:ring-blue-500 focus:border-transparent ${errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 
              focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Grocery shopping"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 
              focus:ring-blue-500 focus:border-transparent ${errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isRecurring" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <Repeat className="w-4 h-4 text-blue-500" />
              Make this a recurring transaction
            </label>
          </div>

          {formData.isRecurring && (
            <div className="ml-7 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat Frequency
              </label>
              <select
                name="recurringFrequency"
                value={formData.recurringFrequency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {Object.values(RECURRING_FREQUENCIES).map(freq => (
                  <option key={freq} value={freq}>
                    {getFrequencyLabel(freq)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-2">
                💡 This transaction will automatically repeat {getFrequencyLabel(formData.recurringFrequency).toLowerCase()}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg 
              hover:bg-blue-600 transition-colors font-medium"
          >
            {editingTransaction ? 'Update' : 'Add'} Transaction
          </button>
          {editingTransaction && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-2 border border-gray-300 rounded-lg 
                hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
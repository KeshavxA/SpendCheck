import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useFinance } from '../context/FinanceContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, 
         TRANSACTION_TYPES } from '../constants/categories';

const TransactionForm = ({ editingTransaction, onCancelEdit }) => {
  const { addTransaction, editTransaction } = useFinance();
  
  const [formData, setFormData] = useState({
    type: TRANSACTION_TYPES.EXPENSE,
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
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

    // Reset form
    setFormData({
      type: TRANSACTION_TYPES.EXPENSE,
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' && { category: '' })
    }));
    // Clear error when user starts typing
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
        {/* Type Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ 
              ...prev, 
              type: TRANSACTION_TYPES.EXPENSE,
              category: '' 
            }))}
            className={`${
              formData.type === TRANSACTION_TYPES.EXPENSE
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
            className={`${
              formData.type === TRANSACTION_TYPES.INCOME
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount */}
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
            className={` ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category"
            
            className={`
               ${
               'border-gray-300'
            }`}
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          
          
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <input
            type="text"
            name="description"
            
            placeholder="e.g., Grocery shopping"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-2">
          <button
            type="submit"
           
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
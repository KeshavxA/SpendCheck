import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Repeat, Plus, Edit3 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  EXPENSE_CATEGORIES, INCOME_CATEGORIES,
  TRANSACTION_TYPES
} from '../constants/categories';
import { RECURRING_FREQUENCIES, getFrequencyLabel } from '../utils/recurringExpenses';
import ReceiptScanner from './ReceiptScanner';

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

  const handleScanComplete = (scannedData) => {
    setFormData(prev => ({
      ...prev,
      amount: scannedData.amount.toString(),
      category: scannedData.category,
      description: scannedData.storeName ? `${scannedData.storeName}: ${scannedData.description}` : scannedData.description,
      date: scannedData.date || prev.date,
      type: TRANSACTION_TYPES.EXPENSE
    }));

    setErrors({});
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
      <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex items-center gap-2">
        {editingTransaction ? (
          <Edit3 className="w-5 h-5 text-blue-500" />
        ) : (
          <Plus className="w-5 h-5 text-blue-500" />
        )}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {editingTransaction ? 'Edit Transaction' : 'Quick Add'}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {!editingTransaction && (
          <ReceiptScanner onScanComplete={handleScanComplete} />
        )}

        <div className="relative">
          {!editingTransaction && (
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
            </div>
          )}
          {!editingTransaction && (
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 font-medium">Or enter manually</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex p-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                type: TRANSACTION_TYPES.EXPENSE,
                category: ''
              }))}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${formData.type === TRANSACTION_TYPES.EXPENSE
                ? 'bg-white dark:bg-slate-600 text-red-500 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
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
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${formData.type === TRANSACTION_TYPES.INCOME
                ? 'bg-white dark:bg-slate-600 text-green-500 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${errors.amount ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'
                  }`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${errors.category ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'
                  }`}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.category}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="What was this for?"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${errors.date ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'
                }`}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.date}</p>
            )}
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isRecurring ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isRecurring ? 'translate-x-4' : ''}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <Repeat className={`w-4 h-4 ${formData.isRecurring ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">Recurring Transaction</span>
              </div>
            </label>

            {formData.isRecurring && (
              <div className="mt-3 ml-13 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                  Repeat Every
                </label>
                <select
                  name="recurringFrequency"
                  value={formData.recurringFrequency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-blue-200 dark:border-blue-900/50 rounded-lg focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none"
                >
                  {Object.values(RECURRING_FREQUENCIES).map(freq => (
                    <option key={freq} value={freq}>
                      {getFrequencyLabel(freq)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg 
                hover:bg-blue-600 active:scale-95 transition-all font-bold shadow-md shadow-blue-200 dark:shadow-none"
            >
              {editingTransaction ? 'Save Changes' : 'Confirm Transaction'}
            </button>
            {editingTransaction && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-6 py-3 border border-gray-200 dark:border-slate-600 rounded-lg 
                  hover:bg-gray-50 dark:hover:bg-slate-700 transition-all font-medium text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ArrowDownUp, Edit2, Search, Trash2, Repeat, Sparkles, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/calculations';
import { TRANSACTION_TYPES } from '../constants/categories';
import { getFrequencyLabel } from '../utils/recurringExpenses';


const TransactionList = ({ onEditTransaction }) => {
  const { transactions, deleteTransaction } = useFinance();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState('date_desc');

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const categories = useMemo(() => {
    const set = new Set();
    for (const t of transactions) {
      if (t?.category) set.add(t.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = fromDate ? new Date(fromDate).getTime() : null;
    const toTs = toDate ? new Date(toDate).getTime() : null;

    const passes = (t) => {
      if (!t) return false;

      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      const dateTs = t.date ? new Date(t.date).getTime() : NaN;
      if (fromTs != null && !(dateTs >= fromTs)) return false;
      if (toTs != null && !(dateTs <= toTs)) return false;

      if (!q) return true;
      const haystack = `${t.category ?? ''} ${t.description ?? ''}`.toLowerCase();
      return haystack.includes(q);
    };

    const list = transactions.filter(passes);

    const sorters = {
      date_desc: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      date_asc: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      amount_desc: (a, b) => (b.amount ?? 0) - (a.amount ?? 0),
      amount_asc: (a, b) => (a.amount ?? 0) - (b.amount ?? 0),
    };
    const sorter = sorters[sort] ?? sorters.date_desc;

    return list.slice().sort(sorter);
  }, [transactions, query, typeFilter, categoryFilter, fromDate, toDate, sort]);

  const hasActiveFilters =
    query.trim() !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    fromDate !== '' ||
    toDate !== '' ||
    sort !== 'date_desc';

  const clearFilters = () => {
    setQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setFromDate('');
    setToDate('');
    setSort('date_desc');
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center">
        <p className="text-slate-500 dark:text-slate-300 text-lg font-semibold">No transactions yet</p>
        <p className="text-slate-400 text-sm mt-2">Add your first transaction above to see it here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Transactions</h2>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
              Showing {filteredTransactions.length} of {transactions.length}
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all text-xs font-black uppercase tracking-wider"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search category or description…"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
              aria-label="Filter by type"
            >
              <option value="all">All types</option>
              <option value={TRANSACTION_TYPES.EXPENSE}>Expense</option>
              <option value={TRANSACTION_TYPES.INCOME}>Income</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 gap-3">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
              aria-label="From date"
              title="From date"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
              aria-label="To date"
              title="To date"
            />
          </div>

          <div className="md:col-span-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <ArrowDownUp className="w-4 h-4" />
                Sort
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
                aria-label="Sort"
              >
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
                <option value="amount_desc">Amount: high to low</option>
                <option value="amount_asc">Amount: low to high</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-200 font-semibold">No matches</p>
          <p className="text-slate-400 text-sm mt-1">Try clearing filters or adjusting your search.</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all text-xs font-black uppercase tracking-wider"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${transaction.type === TRANSACTION_TYPES.INCOME
                      ? 'bg-green-500'
                      : 'bg-red-500'
                      }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {transaction.category}
                      </p>
                      {transaction.isRecurring && !transaction.isRecurringInstance && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                          <Repeat className="w-3 h-3" />
                          {getFrequencyLabel(transaction.recurringFrequency)}
                        </span>
                      )}
                      {transaction.isRecurringInstance && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                          <Sparkles className="w-3 h-3" />
                          Auto
                        </span>
                      )}
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p
                  className={`text-xl font-black ${transaction.type === TRANSACTION_TYPES.INCOME
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
                    className="p-2 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="p-2 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
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
      )}
    </div>
  );
};

export default TransactionList;
import { createContext, useContext, useReducer, useEffect } from 'react';
import { financeReducer, initialState, ACTIONS } from '../reducers/financeReducer';
import { saveTransactions, loadTransactions, clearStorage } from '../utils/storage';
import { processRecurringTransactions, updateRecurringTransactions } from '../utils/recurringExpenses';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};

export const FinanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  useEffect(() => {
    const savedTransactions = loadTransactions();
    if (savedTransactions.length > 0) {
      dispatch({ type: ACTIONS.LOAD_TRANSACTIONS, payload: savedTransactions });
    }
  }, []);

  useEffect(() => {
    if (state.transactions.length > 0 || localStorage.getItem('spendcheck_data')) {
      saveTransactions(state.transactions);
    }
  }, [state.transactions]);

  // Process recurring transactions daily
  useEffect(() => {
    const processRecurring = () => {
      const newTransactions = processRecurringTransactions(state.transactions);

      if (newTransactions.length > 0) {
        // Add new recurring instances
        newTransactions.forEach(transaction => {
          dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: transaction });
        });

        // Update lastProcessedDate for parent recurring transactions
        const processedIds = newTransactions.map(t => t.parentRecurringId);
        const updatedTransactions = updateRecurringTransactions(
          state.transactions,
          [...new Set(processedIds)]
        );

        dispatch({ type: ACTIONS.LOAD_TRANSACTIONS, payload: updatedTransactions });
      }
    };

    // Process on load
    if (state.transactions.length > 0) {
      processRecurring();
    }

    // Check daily (every 24 hours)
    const interval = setInterval(processRecurring, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.transactions]);

  const addTransaction = (transaction) => {
    dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: transaction });
  };

  const editTransaction = (transaction) => {
    dispatch({ type: ACTIONS.EDIT_TRANSACTION, payload: transaction });
  };

  const deleteTransaction = (id) => {
    dispatch({ type: ACTIONS.DELETE_TRANSACTION, payload: id });
  };

  const clearAll = () => {
    if (window.confirm('Are you sure? This will delete all transactions.')) {
      clearStorage();
      dispatch({ type: ACTIONS.CLEAR_ALL });
    }
  };

  const value = {
    transactions: state.transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    clearAll
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
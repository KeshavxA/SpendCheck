import { createContext, useContext, useReducer, useEffect } from 'react';
import { financeReducer, initialState, ACTIONS } from '../reducers/financeReducer';
import {
  saveTransactions,
  loadTransactions,
  saveBudgets,
  loadBudgets,
  clearStorage
} from '../utils/storage';
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

  // Load initial data
  useEffect(() => {
    const savedTransactions = loadTransactions();
    if (savedTransactions.length > 0) {
      dispatch({ type: ACTIONS.LOAD_TRANSACTIONS, payload: savedTransactions });
    }

    const savedBudgets = loadBudgets();
    if (savedBudgets.length > 0) {
      dispatch({ type: ACTIONS.LOAD_BUDGETS, payload: savedBudgets });
    }
  }, []);

  // Save changes
  useEffect(() => {
    if (state.transactions.length > 0 || localStorage.getItem('spendcheck_data')) {
      saveTransactions(state.transactions);
    }
  }, [state.transactions]);

  useEffect(() => {
    if (state.budgets.length > 0 || localStorage.getItem('spendcheck_budgets')) {
      saveBudgets(state.budgets);
    }
  }, [state.budgets]);


  // Handle recurring transactions
  useEffect(() => {
    const processRecurring = () => {
      if (state.transactions.length === 0) return;

      const newTransactions = processRecurringTransactions(state.transactions);

      if (newTransactions.length > 0) {
        newTransactions.forEach(transaction => {
          dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: transaction });
        });

        const processedIds = newTransactions.map(t => t.parentRecurringId);
        const updatedTransactions = updateRecurringTransactions(
          state.transactions,
          [...new Set(processedIds)]
        );

        dispatch({ type: ACTIONS.LOAD_TRANSACTIONS, payload: updatedTransactions });
      }
    };


    if (state.transactions.length > 0) {
      processRecurring();
    }

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

  const upsertBudget = (budget) => {
    dispatch({ type: ACTIONS.UPSERT_BUDGET, payload: budget });
  };

  const deleteBudget = (category) => {
    dispatch({ type: ACTIONS.DELETE_BUDGET, payload: category });
  };

  const clearAll = () => {
    if (window.confirm('Are you sure? This will delete all transactions and budgets.')) {
      clearStorage();
      dispatch({ type: ACTIONS.CLEAR_ALL });
    }
  };

  const value = {
    transactions: state.transactions,
    budgets: state.budgets,
    addTransaction,
    editTransaction,
    deleteTransaction,
    upsertBudget,
    deleteBudget,
    clearAll
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
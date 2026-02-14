import { createContext, useContext, useReducer, useEffect } from 'react';
import { financeReducer, initialState, ACTIONS } from '../reducers/financeReducer';
import { saveTransactions, loadTransactions, clearStorage } from '../utils/storage';

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

  // Load data on mount
  useEffect(() => {
    const savedTransactions = loadTransactions();
    if (savedTransactions.length > 0) {
      dispatch({ type: ACTIONS.LOAD_TRANSACTIONS, payload: savedTransactions });
    }
  }, []);

  // Save data whenever transactions change
  useEffect(() => {
    if (state.transactions.length > 0 || localStorage.getItem('spendcheck_data')) {
      saveTransactions(state.transactions);
    }
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
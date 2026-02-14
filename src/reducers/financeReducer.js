export const ACTIONS = {
    ADD_TRANSACTION: 'ADD_TRANSACTION',
    EDIT_TRANSACTION: 'EDIT_TRANSACTION',
    DELETE_TRANSACTION: 'DELETE_TRANSACTION',
    LOAD_TRANSACTIONS: 'LOAD_TRANSACTIONS',
    CLEAR_ALL: 'CLEAR_ALL'
  };
  
  export const initialState = {
    transactions: []
  };
  
  export function financeReducer(state, action) {
    switch (action.type) {
      case ACTIONS.ADD_TRANSACTION:
        return {
          ...state,
          transactions: [action.payload, ...state.transactions]
        };
      
      case ACTIONS.EDIT_TRANSACTION:
        return {
          ...state,
          transactions: state.transactions.map(t =>
            t.id === action.payload.id ? action.payload : t
          )
        };
      
      case ACTIONS.DELETE_TRANSACTION:
        return {
          ...state,
          transactions: state.transactions.filter(t => t.id !== action.payload)
        };
      
      case ACTIONS.LOAD_TRANSACTIONS:
        return {
          ...state,
          transactions: action.payload
        };
      
      case ACTIONS.CLEAR_ALL:
        return initialState;
      
      default:
        return state;
    }
  }
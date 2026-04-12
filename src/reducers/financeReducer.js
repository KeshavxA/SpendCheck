export const ACTIONS = {
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  EDIT_TRANSACTION: 'EDIT_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  LOAD_TRANSACTIONS: 'LOAD_TRANSACTIONS',
  CLEAR_ALL: 'CLEAR_ALL',
  PROCESS_RECURRING: 'PROCESS_RECURRING',
  UPSERT_BUDGET: 'UPSERT_BUDGET',
  DELETE_BUDGET: 'DELETE_BUDGET',
  LOAD_BUDGETS: 'LOAD_BUDGETS',
  ADD_GOAL: 'ADD_GOAL',
  UPDATE_GOAL: 'UPDATE_GOAL',
  DELETE_GOAL: 'DELETE_GOAL',
  LOAD_GOALS: 'LOAD_GOALS',
  ADD_CHALLENGE: 'ADD_CHALLENGE',
  UPDATE_CHALLENGE: 'UPDATE_CHALLENGE',
  DELETE_CHALLENGE: 'DELETE_CHALLENGE',
  LOAD_CHALLENGES: 'LOAD_CHALLENGES',
  ADD_BADGE: 'ADD_BADGE',
  LOAD_BADGES: 'LOAD_BADGES',
  ADD_XP: 'ADD_XP',
  LOAD_XP: 'LOAD_XP',
  ADD_ASSET: 'ADD_ASSET',
  UPDATE_ASSET: 'UPDATE_ASSET',
  DELETE_ASSET: 'DELETE_ASSET',
  LOAD_ASSETS: 'LOAD_ASSETS',
  ADD_LIABILITY: 'ADD_LIABILITY',
  UPDATE_LIABILITY: 'UPDATE_LIABILITY',
  DELETE_LIABILITY: 'DELETE_LIABILITY',
  LOAD_LIABILITIES: 'LOAD_LIABILITIES'
};

export const initialState = {
  transactions: [],
  budgets: [],
  goals: [],
  challenges: [],
  badges: [],
  xp: 0,
  assets: [],
  liabilities: []
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

    case ACTIONS.UPSERT_BUDGET: {
      const existingIdx = state.budgets.findIndex(b => b.category === action.payload.category);
      if (existingIdx >= 0) {
        const newBudgets = [...state.budgets];
        newBudgets[existingIdx] = { ...newBudgets[existingIdx], limit: parseFloat(action.payload.limit) };
        return { ...state, budgets: newBudgets };
      }
      return {
        ...state,
        budgets: [...state.budgets, { ...action.payload, limit: parseFloat(action.payload.limit) }]
      };
    }

    case ACTIONS.DELETE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.filter(b => b.category !== action.payload)
      };

    case ACTIONS.LOAD_BUDGETS:
      return {
        ...state,
        budgets: action.payload
      };

    case ACTIONS.ADD_GOAL:
      return {
        ...state,
        goals: [action.payload, ...state.goals]
      };

    case ACTIONS.UPDATE_GOAL:
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.payload.id ? action.payload : g
        )
      };

    case ACTIONS.DELETE_GOAL:
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload)
      };

    case ACTIONS.LOAD_GOALS:
      return {
        ...state,
        goals: action.payload
      };

    case ACTIONS.ADD_CHALLENGE:
      return {
        ...state,
        challenges: [action.payload, ...state.challenges]
      };

    case ACTIONS.UPDATE_CHALLENGE:
      return {
        ...state,
        challenges: state.challenges.map(c =>
          c.id === action.payload.id ? action.payload : c
        )
      };

    case ACTIONS.DELETE_CHALLENGE:
      return {
        ...state,
        challenges: state.challenges.filter(c => c.id !== action.payload)
      };

    case ACTIONS.LOAD_CHALLENGES:
      return {
        ...state,
        challenges: action.payload
      };

    case ACTIONS.ADD_BADGE:
      if (state.badges.some(b => b.name === action.payload.name)) return state;
      return {
        ...state,
        badges: [action.payload, ...state.badges]
      };

    case ACTIONS.LOAD_BADGES:
      return {
        ...state,
        badges: action.payload
      };

    case ACTIONS.ADD_XP:
      return {
        ...state,
        xp: state.xp + action.payload
      };

    case ACTIONS.LOAD_XP:
      return {
        ...state,
        xp: action.payload
      };

    case ACTIONS.ADD_ASSET:
      return {
        ...state,
        assets: [action.payload, ...state.assets]
      };

    case ACTIONS.UPDATE_ASSET:
      return {
        ...state,
        assets: state.assets.map(a =>
          a.id === action.payload.id ? action.payload : a
        )
      };

    case ACTIONS.DELETE_ASSET:
      return {
        ...state,
        assets: state.assets.filter(a => a.id !== action.payload)
      };

    case ACTIONS.LOAD_ASSETS:
      return {
        ...state,
        assets: action.payload
      };

    case ACTIONS.ADD_LIABILITY:
      return {
        ...state,
        liabilities: [action.payload, ...state.liabilities]
      };

    case ACTIONS.UPDATE_LIABILITY:
      return {
        ...state,
        liabilities: state.liabilities.map(l =>
          l.id === action.payload.id ? action.payload : l
        )
      };

    case ACTIONS.DELETE_LIABILITY:
      return {
        ...state,
        liabilities: state.liabilities.filter(l => l.id !== action.payload)
      };

    case ACTIONS.LOAD_LIABILITIES:
      return {
        ...state,
        liabilities: action.payload
      };

    default:
      return state;
  }
}
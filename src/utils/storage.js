const STORAGE_KEYS = {
  TRANSACTIONS: 'spendcheck_data',
  BUDGETS: 'spendcheck_budgets',
  GOALS: 'spendcheck_goals',
  CHALLENGES: 'spendcheck_challenges',
  BADGES: 'spendcheck_badges',
  XP: 'spendcheck_xp',
  ASSETS: 'spendcheck_assets',
  LIABILITIES: 'spendcheck_liabilities'
};

export const saveTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Error saving transactions:', error);
    return false;
  }
};

export const loadTransactions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveBudgets = (budgets) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return true;
  } catch (error) {
    console.error('Error saving budgets:', error);
    return false;
  }
};

export const loadBudgets = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading budgets:', error);
    return [];
  }
};

export const saveGoals = (goals) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return true;
  } catch (error) {
    console.error('Error saving goals:', error);
    return false;
  }
};

export const loadGoals = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading goals:', error);
    return [];
  }
};

export const saveChallenges = (challenges) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
    return true;
  } catch (error) {
    console.error('Error saving challenges:', error);
    return false;
  }
};

export const loadChallenges = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading challenges:', error);
    return [];
  }
};

export const saveBadges = (badges) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
    return true;
  } catch (error) {
    console.error('Error saving badges:', error);
    return false;
  }
};

export const loadBadges = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BADGES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading badges:', error);
    return [];
  }
};

export const saveXP = (xp) => {
  try {
    localStorage.setItem(STORAGE_KEYS.XP, JSON.stringify(xp));
    return true;
  } catch (error) {
    console.error('Error saving XP:', error);
    return false;
  }
};

export const loadXP = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.XP);
    return data ? JSON.parse(data) : 0;
  } catch (error) {
    console.error('Error loading XP:', error);
    return 0;
  }
};

export const saveAssets = (assets) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    return true;
  } catch (error) {
    console.error('Error saving assets:', error);
    return false;
  }
};

export const loadAssets = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading assets:', error);
    return [];
  }
};

export const saveLiabilities = (liabilities) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LIABILITIES, JSON.stringify(liabilities));
    return true;
  } catch (error) {
    console.error('Error saving liabilities:', error);
    return false;
  }
};

export const loadLiabilities = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LIABILITIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading liabilities:', error);
    return [];
  }
};

export const clearStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};
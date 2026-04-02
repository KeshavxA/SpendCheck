import { TRANSACTION_TYPES } from '../constants/categories';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

/**
 * Calculates a financial health score from 1 to 100
 */
export const calculateFinancialHealthScore = (transactions, budgets) => {
    const now = new Date();
    const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) };

    const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return isWithinInterval(d, currentMonth);
    });

    const income = monthTransactions
        .filter(t => t.type === TRANSACTION_TYPES.INCOME)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = monthTransactions
        .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    let score = 0;

    // 1. Savings Rate (Max 40 points)
    // Goal: 20% or more savings
    if (income > 0) {
        const savingsRate = (income - expenses) / income;
        const savingsScore = Math.max(0, Math.min(40, savingsRate * 200)); // 0.2 * 200 = 40
        score += savingsScore;
    }

    // 2. Budget Adherence (Max 40 points)
    // Percentage of categories that are within their set budget
    if (budgets.length > 0) {
        let withinBudgetCount = 0;
        budgets.forEach(budget => {
            const categorySpend = monthTransactions
                .filter(t => t.type === TRANSACTION_TYPES.EXPENSE && t.category === budget.category)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            if (categorySpend <= budget.limit) {
                withinBudgetCount++;
            }
        });
        const budgetAccuracy = withinBudgetCount / budgets.length;
        score += (budgetAccuracy * 40);
    } else {
        // If no budgets are set, we give a neutral score (20 pts) to encourage setting them
        score += 20;
    }

    // 3. Income-to-Expense Ratio (Max 20 points)
    // Healthy if expenses are significantly lower than income
    if (income > 0) {
        const ratio = expenses / income;
        if (ratio <= 0.5) score += 20;
        else if (ratio <= 0.8) score += 15;
        else if (ratio <= 1.0) score += 5;
        // if > 1.0, score is 0
    }

    // Edge case: No data
    if (monthTransactions.length === 0) return 0;

    return Math.round(score);
};

export const getHealthLabel = (score) => {
    if (score >= 90) return { text: 'Excellent', color: 'text-green-500', bg: 'bg-green-500', desc: 'You are a financial master!' };
    if (score >= 75) return { text: 'Good', color: 'text-blue-500', bg: 'bg-blue-500', desc: 'You are on the right track.' };
    if (score >= 50) return { text: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500', desc: 'Room for improvement.' };
    if (score >= 25) return { text: 'Poor', color: 'text-orange-500', bg: 'bg-orange-500', desc: 'Your spending is high.' };
    return { text: 'Critical', color: 'text-red-500', bg: 'bg-red-500', desc: 'Urgent action needed.' };
};

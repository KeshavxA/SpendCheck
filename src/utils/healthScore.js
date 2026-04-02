import { TRANSACTION_TYPES } from '../constants/categories';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';


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

  
    if (income > 0) {
        const savingsRate = (income - expenses) / income;
        const savingsScore = Math.max(0, Math.min(40, savingsRate * 200)); 
        score += savingsScore;
    }

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
       
        score += 20;
    }

    if (income > 0) {
        const ratio = expenses / income;
        if (ratio <= 0.5) score += 20;
        else if (ratio <= 0.8) score += 15;
        else if (ratio <= 1.0) score += 5;
 
    }

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

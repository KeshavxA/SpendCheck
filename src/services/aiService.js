import { GoogleGenerativeAI } from '@google/generative-ai';
import { TRANSACTION_TYPES } from '../constants/categories';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, format } from 'date-fns';

// Initialize Gemini AI
const getAIClient = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('Gemini API key not found. AI insights will be disabled.');
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
};

/**
 * Get transactions for a specific month
 */
const getTransactionsForMonth = (transactions, monthsAgo = 0) => {
    const targetDate = subMonths(new Date(), monthsAgo);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return isWithinInterval(transactionDate, { start, end });
    });
};

/**
 * Calculate spending by category for a month
 */
const getCategorySpending = (transactions) => {
    const expenses = transactions.filter(t => t.type === TRANSACTION_TYPES.EXPENSE);
    const categoryTotals = {};

    expenses.forEach(t => {
        if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += parseFloat(t.amount);
    });

    return categoryTotals;
};

/**
 * Calculate total for a transaction type
 */
const calculateTotal = (transactions, type) => {
    return transactions
        .filter(t => t.type === type)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
};

/**
 * Generate spending analysis data
 */
export const analyzeSpending = (transactions) => {
    const currentMonthTransactions = getTransactionsForMonth(transactions, 0);
    const lastMonthTransactions = getTransactionsForMonth(transactions, 1);

    const currentMonthExpenses = calculateTotal(currentMonthTransactions, TRANSACTION_TYPES.EXPENSE);
    const lastMonthExpenses = calculateTotal(lastMonthTransactions, TRANSACTION_TYPES.EXPENSE);

    const currentMonthIncome = calculateTotal(currentMonthTransactions, TRANSACTION_TYPES.INCOME);
    const lastMonthIncome = calculateTotal(lastMonthTransactions, TRANSACTION_TYPES.INCOME);

    const currentCategorySpending = getCategorySpending(currentMonthTransactions);
    const lastCategorySpending = getCategorySpending(lastMonthTransactions);

    // Calculate percentage changes
    const expenseChange = lastMonthExpenses > 0
        ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
        : 0;

    const incomeChange = lastMonthIncome > 0
        ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
        : 0;

    // Find biggest spending increases
    const categoryChanges = Object.keys(currentCategorySpending).map(category => {
        const current = currentCategorySpending[category] || 0;
        const last = lastCategorySpending[category] || 0;
        const change = last > 0 ? ((current - last) / last) * 100 : 0;
        const absoluteChange = current - last;

        return {
            category,
            current,
            last,
            change,
            absoluteChange
        };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    return {
        currentMonth: {
            expenses: currentMonthExpenses,
            income: currentMonthIncome,
            balance: currentMonthIncome - currentMonthExpenses,
            categorySpending: currentCategorySpending,
            transactionCount: currentMonthTransactions.length
        },
        lastMonth: {
            expenses: lastMonthExpenses,
            income: lastMonthIncome,
            balance: lastMonthIncome - lastMonthExpenses,
            categorySpending: lastCategorySpending,
            transactionCount: lastMonthTransactions.length
        },
        changes: {
            expenseChange,
            incomeChange,
            categoryChanges: categoryChanges.slice(0, 3) // Top 3 changes
        }
    };
};

/**
 * Generate AI-powered insights using Gemini
 */
export const generateAIInsights = async (transactions) => {
    try {
        const genAI = getAIClient();
        if (!genAI) {
            return getFallbackInsights(transactions);
        }

        const analysis = analyzeSpending(transactions);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are a personal finance advisor. Analyze this spending data and provide 3-4 concise, actionable insights in a friendly tone. Use Indian Rupee (₹) format.

Current Month:
- Total Expenses: ₹${analysis.currentMonth.expenses.toFixed(0)}
- Total Income: ₹${analysis.currentMonth.income.toFixed(0)}
- Balance: ₹${analysis.currentMonth.balance.toFixed(0)}
- Transactions: ${analysis.currentMonth.transactionCount}
- Top Categories: ${Object.entries(analysis.currentMonth.categorySpending)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(0)}`)
                .join(', ')}

Last Month:
- Total Expenses: ₹${analysis.lastMonth.expenses.toFixed(0)}
- Total Income: ₹${analysis.lastMonth.income.toFixed(0)}

Changes:
- Expense Change: ${analysis.changes.expenseChange.toFixed(1)}%
- Income Change: ${analysis.changes.incomeChange.toFixed(1)}%
${analysis.changes.categoryChanges.length > 0 ? `- Biggest Category Changes: ${analysis.changes.categoryChanges
                .map(c => `${c.category}: ${c.change > 0 ? '+' : ''}${c.change.toFixed(1)}% (₹${c.absoluteChange.toFixed(0)})`)
                .join(', ')}` : ''}

Provide insights as a JSON array of strings. Each insight should be one sentence, friendly, and actionable. Example format:
["You spent 20% more on Food & Dining this month. Try meal prepping to save ₹500 next week!", "Great job! Your income increased by 15% this month.", "Consider setting aside ₹2000 for savings this month."]

Return ONLY the JSON array, no other text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const insights = JSON.parse(jsonMatch[0]);
                return insights;
            }
        } catch (e) {
            console.error('Failed to parse AI response:', e);
        }

        return getFallbackInsights(transactions);

    } catch (error) {
        console.error('Error generating AI insights:', error);
        return getFallbackInsights(transactions);
    }
};


const getFallbackInsights = (transactions) => {
    const analysis = analyzeSpending(transactions);
    const insights = [];

    if (Math.abs(analysis.changes.expenseChange) > 5) {
        const direction = analysis.changes.expenseChange > 0 ? 'more' : 'less';
        const amount = Math.abs(analysis.currentMonth.expenses - analysis.lastMonth.expenses);
        insights.push(
            `You spent ${Math.abs(analysis.changes.expenseChange).toFixed(0)}% ${direction} this month (₹${amount.toFixed(0)} ${direction}). ${analysis.changes.expenseChange > 0
                ? `Try to reduce spending by ₹${(amount * 0.3).toFixed(0)} next month.`
                : 'Great job keeping expenses down!'
            }`
        );
    }

    if (analysis.changes.categoryChanges.length > 0) {
        const topChange = analysis.changes.categoryChanges[0];
        if (Math.abs(topChange.change) > 10) {
            insights.push(
                `Your ${topChange.category} spending ${topChange.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(topChange.change).toFixed(0)}% (₹${Math.abs(topChange.absoluteChange).toFixed(0)}). ${topChange.change > 0
                    ? `Consider setting a budget of ₹${(topChange.current * 0.8).toFixed(0)} for this category.`
                    : 'Keep up the good work!'
                }`
            );
        }
    }

    if (analysis.currentMonth.balance > 0) {
        const savingsRate = (analysis.currentMonth.balance / analysis.currentMonth.income) * 100;
        insights.push(
            `You saved ₹${analysis.currentMonth.balance.toFixed(0)} this month (${savingsRate.toFixed(0)}% of income). ${savingsRate < 20
                ? `Try to increase your savings rate to 20% by reducing expenses by ₹${((analysis.currentMonth.income * 0.2) - analysis.currentMonth.balance).toFixed(0)}.`
                : 'Excellent savings rate!'
            }`
        );
    } else {
        insights.push(
            `You're spending more than you earn this month. Try to reduce expenses by ₹${Math.abs(analysis.currentMonth.balance).toFixed(0)} to break even.`
        );
    }

    if (insights.length < 3) {
        insights.push(
            `You've made ${analysis.currentMonth.transactionCount} transactions this month. Keep tracking to build better financial habits! 💪`
        );
    }

    return insights.slice(0, 4);
};

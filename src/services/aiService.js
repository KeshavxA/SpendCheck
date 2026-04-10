import { GoogleGenerativeAI } from '@google/generative-ai';
import { TRANSACTION_TYPES, EXPENSE_CATEGORIES } from '../constants/categories';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';

const getAIClient = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('Gemini API key not found. AI features will be limited.');
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
};


const getTransactionsForMonth = (transactions, monthsAgo = 0) => {
    const targetDate = subMonths(new Date(), monthsAgo);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return isWithinInterval(transactionDate, { start, end });
    });
};


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


const calculateTotal = (transactions, type) => {
    return transactions
        .filter(t => t.type === type)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
};


export const analyzeSpending = (transactions) => {
    const currentMonthTransactions = getTransactionsForMonth(transactions, 0);
    const lastMonthTransactions = getTransactionsForMonth(transactions, 1);

    const currentMonthExpenses = calculateTotal(currentMonthTransactions, TRANSACTION_TYPES.EXPENSE);
    const lastMonthExpenses = calculateTotal(lastMonthTransactions, TRANSACTION_TYPES.EXPENSE);

    const currentMonthIncome = calculateTotal(currentMonthTransactions, TRANSACTION_TYPES.INCOME);
    const lastMonthIncome = calculateTotal(lastMonthTransactions, TRANSACTION_TYPES.INCOME);

    const currentCategorySpending = getCategorySpending(currentMonthTransactions);
    const lastCategorySpending = getCategorySpending(lastMonthTransactions);

    const expenseChange = lastMonthExpenses > 0
        ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
        : 0;

    const incomeChange = lastMonthIncome > 0
        ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
        : 0;

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
            categoryChanges: categoryChanges.slice(0, 3)
        }
    };
};


export const generateAIInsights = async (transactions) => {
    try {
        const genAI = getAIClient();
        if (!genAI) {
            return getFallbackInsights(transactions);
        }

        const analysis = analyzeSpending(transactions);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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


export const scanReceipt = async (imageFile) => {
    try {
        const genAI = getAIClient();
        if (!genAI) throw new Error('AI Client not initialized');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(imageFile);
        });

        const prompt = `Analyze this receipt image and extract the following information in JSON format:
        - amount: Total amount (number only)
        - date: Date of transaction in YYYY-MM-DD format
        - storeName: Name of the merchant or store
        - category: One of these categories: ${EXPENSE_CATEGORIES.map(c => c.name).join(', ')}
        - description: A brief summary of items bought

        Return ONLY the JSON object.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: imageFile.type
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Could not extract data from receipt');
    } catch (error) {
        console.error('Error scanning receipt:', error);
        throw error;
    }
};


export const predictAffordability = async (item, amount, transactions, budgets) => {
    try {
        const genAI = getAIClient();
        if (!genAI) throw new Error('AI Client not initialized');

        const analysis = analyzeSpending(transactions);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a savvy personal finance AI. A user wants to buy "${item}" for ₹${amount}. 
        Analyze their financial situation and tell them if they can afford it now or what they need to do.

        Context:
        - Monthly Income: ₹${analysis.currentMonth.income}
        - Monthly Expenses: ₹${analysis.currentMonth.expenses}
        - Current Balance (this month): ₹${analysis.currentMonth.balance}
        - Top Spending Categories: ${JSON.stringify(analysis.currentMonth.categorySpending)}
        - Budgets Set: ${JSON.stringify(budgets)}

        Return a JSON object with:
        - canAfford: boolean
        - verdict: A short punchy verdict (e.g. "Go for it!", "Wait a bit", "Think twice")
        - analysis: A 2-sentence explanation of why.
        - recommendation: A specific saving tip or cutback required (e.g. "Cut dining out by 20% for 2 months").

        Return ONLY the JSON object. Use Indian Rupees (₹).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Failed to generate affordability prediction');
    } catch (error) {
        console.error('Error predicting affordability:', error);
        throw error;
    }
};


export const generateGoalAdvice = async (goals, transactions) => {
    try {
        const genAI = getAIClient();
        if (!genAI || goals.length === 0) return null;

        const analysis = analyzeSpending(transactions);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a financial motivator. Analyze these savings goals and provide a short, punchy, and highly motivating piece of advice (max 2 sentences) for the user to reach them.
        
        Goals: ${JSON.stringify(goals)}
        Current Monthly Balance: ₹${analysis.currentMonth.balance}
        Top Spending: ${JSON.stringify(analysis.currentMonth.categorySpending)}

        Provide advice that is specific. If they have a high balance, encourage them to allocate more. If low, suggest a category to cut.
        Return ONLY the advice string.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Error generating goal advice:', error);
        return null;
    }
};

const getFallbackInsights = (transactions) => {
    const analysis = analyzeSpending(transactions);
    const insights = [];

    if (Math.abs(analysis.changes.expenseChange) > 5) {
        const direction = analysis.changes.expenseChange > 0 ? 'more' : 'less';
        const amount = Math.abs(analysis.currentMonth.expenses - analysis.lastMonth.expenses);
        insights.push(
            `You spent ${Math.abs(analysis.changes.expenseChange).toFixed(0)}% ${direction} this month (₹${amount.toFixed(0)} ${direction}).`
        );
    }

    if (analysis.changes.categoryChanges.length > 0) {
        const topChange = analysis.changes.categoryChanges[0];
        insights.push(
            `Your ${topChange.category} spending ${topChange.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(topChange.change).toFixed(0)}%.`
        );
    }

    if (analysis.currentMonth.balance > 0) {
        const savingsRate = (analysis.currentMonth.balance / analysis.currentMonth.income) * 100;
        insights.push(
            `You saved ₹${analysis.currentMonth.balance.toFixed(0)} this month (${savingsRate.toFixed(0)}% of income).`
        );
    }

    return insights.slice(0, 4);
};

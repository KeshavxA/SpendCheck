import { useFinance } from '../context/FinanceContext';
import { TRANSACTION_TYPES } from '../constants/categories';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Target, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

const BudgetProgress = () => {
    const { transactions, budgets } = useFinance();

    if (budgets.length === 0) return null;

    const currentMonth = {
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    };

    const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return isWithinInterval(transactionDate, currentMonth);
    });

    const getSpendByCategory = (category) => {
        return currentMonthTransactions
            .filter(t => t.type === TRANSACTION_TYPES.EXPENSE && t.category === category)
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    };

    const calculateBudgetStats = (budget) => {
        const spent = getSpendByCategory(budget.category);
        const percent = (spent / budget.limit) * 100;
        const remaining = budget.limit - spent;
        return { spent, percent, remaining };
    };

    const getProgressColor = (percent) => {
        if (percent >= 100) return 'bg-red-500';
        if (percent >= 90) return 'bg-orange-500';
        if (percent >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStatusIcon = (percent) => {
        if (percent >= 100) return <TrendingDown className="w-4 h-4 text-red-500" />;
        if (percent >= 75) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Budget Progress</h2>
            </div>

            <div className="space-y-6">
                {budgets.map((budget) => {
                    const { spent, percent, remaining } = calculateBudgetStats(budget);
                    const colorClass = getProgressColor(percent);

                    return (
                        <div key={budget.category} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        {budget.category}
                                        {getStatusIcon(percent)}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        ₹{spent.toLocaleString()} spent of ₹{budget.limit.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {percent.toFixed(0)}%
                                    </span>
                                    <p className={`text-[10px] font-medium ${remaining >= 0 ? 'text-gray-400' : 'text-red-500'}`}>
                                        {remaining >= 0 ? `₹${remaining.toLocaleString()} left` : `₹${Math.abs(remaining).toLocaleString()} over`}
                                    </p>
                                </div>
                            </div>

                            <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={`h-full ${colorClass} transition-all duration-500 rounded-full flex justify-end items-center px-1 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.1)]`}
                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                >
                                    {percent > 15 && <div className="w-1 h-1 bg-white/40 rounded-full" />}
                                </div>
                            </div>

                            <div className="flex justify-between text-[10px] text-gray-400 font-medium px-1">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetProgress;

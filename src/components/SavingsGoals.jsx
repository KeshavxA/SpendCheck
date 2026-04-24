import { useState } from 'react';
import { Target, TrendingUp, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Sparkles, Loader2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/calculations';
import GoalForm from './GoalForm';
import { generateGoalAdvice } from '../services/aiService';

const SavingsGoals = () => {
    const { goals, deleteGoal, transactions } = useFinance();
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [aiAdvice, setAiAdvice] = useState(null);
    const [loadingAdvice, setLoadingAdvice] = useState(false);

    const handleGetAdvice = async () => {
        setLoadingAdvice(true);
        try {
            const advice = await generateGoalAdvice(goals, transactions);
            setAiAdvice(advice);
        } finally {
            setLoadingAdvice(false);
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            deleteGoal(id);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-bold">Savings Goals 🎯</h2>
                </div>
                <button
                    onClick={() => {
                        setEditingGoal(null);
                        setShowForm(true);
                    }}
                    className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {goals.length > 0 && (
                <div className="mb-6">
                    {!aiAdvice ? (
                        <button
                            onClick={handleGetAdvice}
                            disabled={loadingAdvice}
                            className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"
                        >
                            {loadingAdvice ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Get AI Goal Strategy
                        </button>
                    ) : (
                        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-3 relative overflow-hidden group">
                            <div className="flex gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 italic">
                                    "{aiAdvice}"
                                </p>
                            </div>
                            <button
                                onClick={() => setAiAdvice(null)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {goals.length === 0 ? (
                <div className="text-center py-8">
                    <div className="bg-gray-50 dark:bg-slate-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No savings goals yet.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 text-blue-500 font-bold hover:underline"
                    >
                        Create your first goal
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {goals.map((goal) => {
                        const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                        const isCompleted = progress >= 100;

                        return (
                            <div key={goal.id} className="group relative bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4 border border-transparent hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {goal.name}
                                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Target: {formatCurrency(goal.targetAmount)}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(goal)}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <span className="text-blue-600 dark:text-blue-400">{formatCurrency(goal.currentAmount)}</span>
                                        <span className="text-gray-500">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {goal.deadline && (
                                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <AlertCircle className="w-3 h-3" />
                                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <GoalForm
                    key={editingGoal?.id ?? 'new'}
                    goal={editingGoal}
                    onClose={() => {
                        setShowForm(false);
                        setEditingGoal(null);
                    }}
                />
            )}
        </div>
    );
};

export default SavingsGoals;

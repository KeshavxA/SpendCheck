import { useState, useEffect } from 'react';
import { Trophy, Swords, Sparkles, Loader2, CheckCircle2, AlertCircle, X, Info, Flame, ChevronRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { generateSavingsChallenges } from '../services/aiService';
import { formatCurrency, getMonthlyTransactions } from '../utils/calculations';

const SavingsChallenges = () => {
    const { challenges, addChallenge, deleteChallenge, transactions } = useFinance();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    const handleGenerateChallenges = async () => {
        setLoading(true);
        try {
            const rawChallenges = await generateSavingsChallenges(transactions);
            // Only add challenges that aren't already active
            const newChallenges = rawChallenges.filter(rc => !challenges.some(c => c.title === rc.title));

            newChallenges.forEach(challenge => {
                addChallenge({
                    ...challenge,
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active'
                });
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = (challenge) => {
        const monthly = getMonthlyTransactions(transactions);
        const challengeTransactions = monthly.filter(t =>
            t.category.toLowerCase() === challenge.category.toLowerCase() &&
            new Date(t.date) >= new Date(challenge.startDate)
        );

        const currentSpent = challengeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const remaining = Math.max(0, challenge.targetAmount - currentSpent);
        const percent = Math.min(100, (currentSpent / challenge.targetAmount) * 100);

        return {
            currentSpent,
            remaining,
            percent,
            isFailed: currentSpent > challenge.targetAmount
        };
    };

    const activeChallenges = challenges.filter(c => c.status === 'active');

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
            <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-xl">
                        <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white font-bold leading-none mb-1">Savings Arena</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gamified Savings Challenges</p>
                    </div>
                </div>
                <button
                    onClick={handleGenerateChallenges}
                    disabled={loading}
                    className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </button>
            </div>

            <div className="p-6">
                {activeChallenges.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="bg-gray-50 dark:bg-slate-700/50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3">
                            <Swords className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 dark:text-white font-bold mb-1">No active challenges!</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-[200px] mx-auto">
                            Let AI generate personalized savings challenges based on your spending.
                        </p>
                        <button
                            onClick={handleGenerateChallenges}
                            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold active:scale-95 transition-all"
                        >
                            Generate Challenges
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeChallenges.map(challenge => {
                            const progress = calculateProgress(challenge);

                            return (
                                <div key={challenge.id} className="group relative bg-gray-50 dark:bg-slate-700/30 rounded-2xl p-4 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-3">
                                            <div className={`p-2 rounded-xl flex-shrink-0 ${challenge.difficulty === 'Easy' ? 'bg-green-100/50 text-green-600' :
                                                    challenge.difficulty === 'Medium' ? 'bg-blue-100/50 text-blue-600' :
                                                        'bg-purple-100/50 text-purple-600'
                                                }`}>
                                                <Trophy className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1 group-hover:text-indigo-500 transition-colors">
                                                    {challenge.title}
                                                </h4>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                                                    {challenge.description}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteChallenge(challenge.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${progress.isFailed ? 'bg-red-100 text-red-600' : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300'
                                                }`}>
                                                {progress.isFailed ? 'Failed' : `${challenge.difficulty} • Tracked`}
                                            </span>
                                            <span className="text-[11px] font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(progress.currentSpent)} <span className="text-gray-400 font-medium">/ {formatCurrency(challenge.targetAmount)}</span>
                                            </span>
                                        </div>

                                        <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${progress.isFailed ? 'bg-red-500' :
                                                        progress.percent > 80 ? 'bg-orange-500' : 'bg-indigo-500'
                                                    }`}
                                                style={{ width: `${progress.percent}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-1 text-[9px] font-black text-indigo-500 uppercase tracking-tighter">
                                                <Sparkles className="w-2.5 h-2.5" />
                                                Reward: {challenge.reward}
                                            </div>
                                            {!progress.isFailed && (
                                                <div className="text-[9px] font-bold text-gray-400">
                                                    Ends in 7 days
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-700/20 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-100 dark:border-slate-700">
                <div className="flex-shrink-0 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 flex items-center gap-2">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Level 1: Novice</span>
                </div>
                <div className="flex-shrink-0 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">0 Points</span>
                </div>
            </div>
        </div>
    );
};

export default SavingsChallenges;

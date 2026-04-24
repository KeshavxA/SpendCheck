import { useState } from 'react';
import { Trophy, Swords, Sparkles, Loader2, CheckCircle2, AlertCircle, X, Info, Flame, ChevronRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { generateSavingsChallenges } from '../services/aiService';
import { formatCurrency, getMonthlyTransactions } from '../utils/calculations';

const SavingsChallenges = () => {
    const { challenges, addChallenge, deleteChallenge, transactions, badges, addBadge, xp, addXP } = useFinance();
    const [loading, setLoading] = useState(false);

    // Level calculation logic
    const level = Math.floor(xp / 1000) + 1;
    const currentXP = xp % 1000;
    const xpPercent = (currentXP / 1000) * 100;

    const getLevelTitle = (lvl) => {
        if (lvl >= 10) return 'Financial Legend';
        if (lvl >= 7) return 'Money Maestro';
        if (lvl >= 4) return 'Budget Elite';
        if (lvl >= 2) return 'Finance Apprentice';
        return 'Budget Novice';
    };

    const handleGenerateChallenges = async () => {
        setLoading(true);
        try {
            const rawChallenges = await generateSavingsChallenges(transactions);

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

    const handleClaimReward = (challenge) => {
        // Award XP based on difficulty
        const xpAmount = challenge.difficulty === 'Easy' ? 100 : challenge.difficulty === 'Medium' ? 250 : 500;
        addXP(xpAmount);

        addBadge({
            name: challenge.reward,
            date: new Date().toISOString(),
            challengeTitle: challenge.title,
            difficulty: challenge.difficulty
        });
        deleteChallenge(challenge.id);
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
                            const canClaim = !progress.isFailed;

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
                                            {canClaim && !progress.isFailed ? (
                                                <button
                                                    onClick={() => handleClaimReward(challenge)}
                                                    className="text-[9px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded shadow-sm hover:bg-indigo-600 active:scale-95 transition-all animate-pulse"
                                                >
                                                    Claim {challenge.difficulty === 'Easy' ? '100' : challenge.difficulty === 'Medium' ? '250' : '500'} XP
                                                </button>
                                            ) : (
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

            <div className="p-4 bg-gray-50 dark:bg-slate-700/20 space-y-3 border-t border-gray-100 dark:border-slate-700">
                <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
                    {badges.length === 0 ? (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 italic">
                            <Trophy className="w-3 h-3 opacity-50" />
                            No badges earned yet. Complete challenges to unlock!
                        </div>
                    ) : (
                        badges.map((badge, idx) => (
                            <div key={idx} className="flex-shrink-0 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 flex items-center gap-2 group cursor-help relative hover:scale-105 transition-all">
                                <div className={`p-1 rounded-md ${badge.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                                    badge.difficulty === 'Medium' ? 'bg-blue-500/10 text-blue-500' :
                                        'bg-purple-500/10 text-purple-500'
                                    }`}>
                                    <Trophy className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{badge.name}</span>

                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 hidden group-hover:block z-50">
                                    <div className="bg-gray-900 text-white text-[8px] p-2 rounded-lg shadow-xl border border-white/10">
                                        <p className="font-black text-indigo-400 mb-0.5">{badge.name}</p>
                                        <p className="opacity-70">Earned for completing "{badge.challengeTitle}"</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-black text-xs">
                                {level}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Level {level}</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{getLevelTitle(level)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-indigo-500 mb-0.5">{xp} XP</p>
                            <p className="text-[9px] font-bold text-gray-400 capitalize">{1000 - currentXP} XP to next level</p>
                        </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                            style={{ width: `${xpPercent}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavingsChallenges;

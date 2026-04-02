import { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { predictAffordability } from '../services/aiService';

const AffordabilityPredictor = () => {
    const { transactions, budgets } = useFinance();
    const [item, setItem] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handlePredict = async (e) => {
        e.preventDefault();
        if (!item || !amount) return;

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const prediction = await predictAffordability(item, parseFloat(amount), transactions, budgets);
            setResult(prediction);
        } catch (err) {
            setError('Could not get a prediction. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-8 overflow-hidden relative">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-2 font-bold">
                    Can I Afford It? 🔮
                    <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">AI Beta</span>
                </h2>
            </div>

            <form onSubmit={handlePredict} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                            Planned Purchase
                        </label>
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => setItem(e.target.value)}
                            placeholder="e.g. New iPhone 16 Pro"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white text-sm transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                            Estimated Cost (₹)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="80,000"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white text-sm transition-all"
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading || !item || !amount}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:from-indigo-600 hover:to-purple-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            AI is Analyzing your finances...
                        </>
                    ) : (
                        <>
                            Check with AI Predictor
                        </>
                    )}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {result && (
                <div className={`p-6 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${result.canAfford
                    ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
                    : 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full flex-shrink-0 ${result.canAfford ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                            {result.canAfford ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                            ) : (
                                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <h3 className={`text-xl font-black ${result.canAfford ? 'text-green-900 dark:text-green-300' : 'text-orange-900 dark:text-orange-300'}`}>
                                {result.verdict}
                            </h3>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                "{result.analysis}"
                            </p>
                            <div className="flex items-start gap-2 pt-2 border-t border-black/5 dark:border-white/5 mt-3">
                                <span className="bg-indigo-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase mt-0.5">PLAN</span>
                                <p className="text-xs font-bold text-gray-900 dark:text-white leading-normal">
                                    {result.recommendation}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Background sparkle */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full"></div>
        </div>
    );
};

export default AffordabilityPredictor;

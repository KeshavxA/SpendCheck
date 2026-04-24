import { useCallback, useEffect, useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { generateAIInsights } from '../services/aiService';

const AIInsights = () => {
    const { transactions } = useFinance();
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchInsights = useCallback(async () => {
        if (transactions.length === 0) {
            setInsights([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const generatedInsights = await generateAIInsights(transactions);
            setInsights(generatedInsights);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching insights:', err);
            setError('Failed to generate insights. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [transactions]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInsights();
        }, 500);

        return () => clearTimeout(timer);
    }, [fetchInsights]);

    if (transactions.length === 0) {
        return (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-500 p-2 rounded-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
                </div>
                <p className="text-gray-600 text-center py-4">
                    Add some transactions to get personalized spending insights powered by AI! 🚀
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-500 p-2 rounded-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
                        {lastUpdated && (
                            <p className="text-xs text-gray-500">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={fetchInsights}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 
            transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <TrendingUp className="w-4 h-4" />
                            Refresh
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-medium">Error</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {loading && insights.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    <span className="ml-3 text-gray-600">Analyzing your spending patterns...</span>
                </div>
            ) : (
                <div className="space-y-3">
                    {insights.map((insight, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg p-4 shadow-sm border border-purple-100 
                hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 
                    flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed flex-1">
                                    {insight}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-xs text-gray-500 text-center">
                    💡 Insights are generated using AI and updated automatically when you add or modify transactions
                </p>
            </div>
        </div>
    );
};

export default AIInsights;

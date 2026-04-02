import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { calculateFinancialHealthScore, getHealthLabel } from '../utils/healthScore';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

const HealthScore = () => {
    const { transactions, budgets } = useFinance();
    const score = calculateFinancialHealthScore(transactions, budgets);
    const label = getHealthLabel(score);

    const data = [
        { value: score, color: label.bg.replace('bg-', '') },
        { value: 100 - score, color: 'transparent' }
    ];

    if (transactions.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Health</h2>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${label.bg} text-white`}>
                    {label.text}
                </div>
            </div>

            <div className="flex items-center gap-6">
   
                <div className="relative w-32 h-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={42}
                                outerRadius={55}
                                startAngle={180}
                                endAngle={-180}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                <Cell fill={label.bg.includes('green') ? '#22c55e' :
                                    label.bg.includes('blue') ? '#3b82f6' :
                                        label.bg.includes('yellow') ? '#eab308' :
                                            label.bg.includes('orange') ? '#f97316' : '#ef4444'} />
                                <Cell fill="#f1f5f9" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                            {score}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Score</span>
                    </div>
                </div>

                <div className="space-y-3 flex-1 overflow-hidden">
                    <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                            {label.desc}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            Your health score is calculated based on savings rate, budget adherence, and expense discipline.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Activity className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                            </div>
                            <p className={`text-xs font-bold ${label.color}`}>{label.text}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Heart className="w-3 h-3 text-red-500" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Action</span>
                            </div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                {score < 80 ? 'Save More' : 'Keep it Up'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

          
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
        </div>
    );
};

export default HealthScore;

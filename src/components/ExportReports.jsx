import { Download, FileText, FileSpreadsheet, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { calculateFinancialHealthScore } from '../utils/healthScore';
import { useState } from 'react';

const ExportReports = () => {
    const { transactions, budgets } = useFinance();
    const [exporting, setExporting] = useState(false);
    const [success, setSuccess] = useState(false);

    if (transactions.length === 0) return null;

    const handleExport = (type) => {
        setExporting(true);
        const score = calculateFinancialHealthScore(transactions, budgets);

        try {
            if (type === 'pdf') {
                exportToPDF(transactions, budgets, score);
            } else {
                exportToCSV(transactions);
            }
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reports & Export</h2>
                </div>
                {success && (
                    <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold animate-pulse">
                        <CheckCircle2 className="w-4 h-4" />
                        Report Ready!
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Generate professional financial reports for accounting, tax filing, or personal tracking.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={exporting}
                        className="group flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all text-left w-full"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                                <FileText className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-tight">Full PDF Report</p>
                                <p className="text-[11px] text-blue-500/70 dark:text-blue-400/70 font-medium">Monthly Summary + Analysis</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => handleExport('csv')}
                        disabled={exporting}
                        className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-left w-full"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                                <FileSpreadsheet className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Data Export (CSV)</p>
                                <p className="text-[11px] text-slate-500/70 dark:text-slate-400/70 font-medium">Original Transaction Data</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-50 dark:border-slate-700 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    Secure Local Generation
                </div>
                <span>v1.2 Report Engine</span>
            </div>

            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
        </div>
    );
};

export default ExportReports;

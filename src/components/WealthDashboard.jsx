import { useState } from 'react';
import { Wallet, Landmark, TrendingUp, TrendingDown, Plus, Trash2, Edit2, Briefcase, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/calculations';

const WealthDashboard = () => {
    const { assets, liabilities, addAsset, updateAsset, deleteAsset, addLiability, updateLiability, deleteLiability } = useFinance();
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState('asset');
    const [editingItem, setEditingItem] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: 'Cash'
    });

    const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    const handleSubmit = (e) => {
        e.preventDefault();
        const item = {
            id: editingItem?.id || Date.now().toString(),
            ...formData,
            amount: parseFloat(formData.amount)
        };

        if (editingItem) {
            formType === 'asset' ? updateAsset(item) : updateLiability(item);
        } else {
            formType === 'asset' ? addAsset(item) : addLiability(item);
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({ name: '', amount: '', category: formType === 'asset' ? 'Cash' : 'Loan' });
        setEditingItem(null);
        setShowForm(false);
    };

    const handleEdit = (item, type) => {
        setFormType(type);
        setEditingItem(item);
        setFormData({ name: item.name, amount: item.amount.toString(), category: item.category });
        setShowForm(true);
    };

    return (
        <div className="space-y-6">

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-indigo-950 dark:to-slate-900 rounded-3xl p-8 border border-white/5 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="w-32 h-32 text-indigo-400" />
                </div>

                <div className="relative z-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Total Net Worth</p>
                        <h2 className="text-4xl lg:text-5xl font-black text-white mb-2 leading-none">
                            {formatCurrency(netWorth)}
                        </h2>
                        <div className="flex items-center justify-center lg:justify-start gap-4">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Assets: {formatCurrency(totalAssets)}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Liabilities: {formatCurrency(totalLiabilities)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => { setFormType('asset'); setShowForm(true); }}
                            className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Plus className="w-4 h-4" /> Add Asset
                        </button>
                        <button
                            onClick={() => { setFormType('liability'); setShowForm(true); }}
                            className="px-6 py-2.5 bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 active:scale-95 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Liability
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <h3 className="font-bold text-gray-900 dark:text-white">Assets</h3>
                        </div>
                        <span className="text-xs font-black text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                            {assets.length} Items
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-slate-700">
                        {assets.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-xs italic">No assets added yet.</div>
                        ) : (
                            assets.map(asset => (
                                <div key={asset.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100/50 dark:bg-green-500/10 rounded-lg text-green-600">
                                            <Landmark className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{asset.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">{asset.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(asset.amount)}</p>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all">
                                            <button onClick={() => handleEdit(asset, 'asset')} className="p-1 text-gray-400 hover:text-indigo-500"><Edit2 className="w-3 h-3" /></button>
                                            <button onClick={() => deleteAsset(asset.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <h3 className="font-bold text-gray-900 dark:text-white">Liabilities</h3>
                        </div>
                        <span className="text-xs font-black text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
                            {liabilities.length} Items
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-slate-700">
                        {liabilities.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-xs italic">No liabilities added yet.</div>
                        ) : (
                            liabilities.map(liability => (
                                <div key={liability.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100/50 dark:bg-red-500/10 rounded-lg text-red-600">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{liability.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">{liability.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(liability.amount)}</p>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all">
                                            <button onClick={() => handleEdit(liability, 'liability')} className="p-1 text-gray-400 hover:text-indigo-500"><Edit2 className="w-3 h-3" /></button>
                                            <button onClick={() => deleteLiability(liability.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-20 h-20" />
                </div>
                <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">Wealth Wisdom</h3>
                        <p className="text-xs text-indigo-50 opacity-90 leading-relaxed font-medium">
                            {netWorth > 0
                                ? `Excellent work! Your Net Worth is positive at ${formatCurrency(netWorth)}. Focusing on assets like Investments or Real Estate could accelerate your growth.`
                                : "Your liabilities currenty outweigh your assets. Prioritize high-interest debt repayment to flip your net worth into the green!"}
                        </p>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden scale-in animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingItem ? 'Edit' : 'Add'} {formType === 'asset' ? 'Asset' : 'Liability'}
                            </h3>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={formType === 'asset' ? 'Savings Account, Gold, etc.' : 'Credit Card Debt, Home Loan, etc.'}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Value (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    >
                                        {formType === 'asset' ? (
                                            <>
                                                <option>Cash</option>
                                                <option>Investments</option>
                                                <option>Real Estate</option>
                                                <option>Gold/Metal</option>
                                                <option>Others</option>
                                            </>
                                        ) : (
                                            <>
                                                <option>Loan</option>
                                                <option>Credit Card</option>
                                                <option>Mortgage</option>
                                                <option>Personal Owe</option>
                                                <option>Others</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 active:scale-95 transition-all mt-4"
                            >
                                {editingItem ? 'Update' : 'Add'} Item
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WealthDashboard;

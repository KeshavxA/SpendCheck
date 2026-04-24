import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { parse, isValid, format } from 'date-fns';
import { AlertCircle, CheckCircle2, FileUp, Loader2, X } from 'lucide-react';
import { TRANSACTION_TYPES } from '../constants/categories';

const DATE_FORMATS = ['dd-MM-yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy'];

function normalizeHeader(h) {
  return String(h ?? '')
    .trim()
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z]/g, '');
}

function coerceType(rawType, rawAmount) {
  const t = String(rawType ?? '').trim().toLowerCase();
  if (t === TRANSACTION_TYPES.INCOME || t === 'income') return TRANSACTION_TYPES.INCOME;
  if (t === TRANSACTION_TYPES.EXPENSE || t === 'expense') return TRANSACTION_TYPES.EXPENSE;
  if (t === '+') return TRANSACTION_TYPES.INCOME;
  if (t === '-') return TRANSACTION_TYPES.EXPENSE;
  if (t === 'credit') return TRANSACTION_TYPES.INCOME;
  if (t === 'debit') return TRANSACTION_TYPES.EXPENSE;

  const amt = Number(rawAmount);
  if (!Number.isNaN(amt) && amt < 0) return TRANSACTION_TYPES.EXPENSE;
  return null;
}

function parseDateToIso(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;

  for (const f of DATE_FORMATS) {
    const d = parse(s, f, new Date());
    if (isValid(d)) return format(d, 'yyyy-MM-dd');
  }

  const d = new Date(s);
  if (isValid(d)) return format(d, 'yyyy-MM-dd');
  return null;
}

function parseAmount(raw) {
  if (raw == null) return null;
  const cleaned = String(raw)
    .trim()
    .replace(/,/g, '')
    .replace(/₹/g, '');
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return n;
}

export default function CsvImportModal({ open, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [rows, setRows] = useState([]);

  const { preview, validCount, invalidCount } = useMemo(() => {
    const mapped = rows.map((r) => ({
      ...r,
      _isValid: !r._error
    }));
    return {
      preview: mapped.slice(0, 10),
      validCount: mapped.filter((r) => r._isValid).length,
      invalidCount: mapped.filter((r) => !r._isValid).length
    };
  }, [rows]);

  const reset = () => {
    setFile(null);
    setParsing(false);
    setParseError(null);
    setRows([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setParseError(null);
    setRows([]);
  };

  const runParse = async () => {
    if (!file) return;
    setParsing(true);
    setParseError(null);
    setRows([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h,
      complete: (results) => {
        try {
          const data = Array.isArray(results.data) ? results.data : [];
          const headers = results.meta?.fields ?? [];
          const headerMap = new Map(headers.map((h) => [normalizeHeader(h), h]));

          const pick = (...candidates) => {
            for (const c of candidates) {
              const key = normalizeHeader(c);
              const found = headerMap.get(key);
              if (found) return found;
            }
            return null;
          };

          const dateKey = pick('date', 'transactiondate');
          const typeKey = pick('type', 'transactiontype');
          const categoryKey = pick('category');
          const descriptionKey = pick('description', 'note', 'details', 'narration');
          const amountKey = pick('amount', 'amountinr', 'amountinr');

          const mapped = data.map((row, idx) => {
            const rawDate = dateKey ? row[dateKey] : row.Date ?? row.date;
            const rawType = typeKey ? row[typeKey] : row.Type ?? row.type;
            const rawCategory = categoryKey ? row[categoryKey] : row.Category ?? row.category;
            const rawDescription = descriptionKey ? row[descriptionKey] : row.Description ?? row.description;
            const rawAmount = amountKey ? row[amountKey] : row.Amount ?? row.amount ?? row['Amount (INR)'];

            const isoDate = parseDateToIso(rawDate);
            const amount = parseAmount(rawAmount);
            const type = coerceType(rawType, amount);
            const category = String(rawCategory ?? '').trim();
            const description = String(rawDescription ?? '').trim();

            const errors = [];
            if (!isoDate) errors.push('Invalid date');
            if (!category) errors.push('Missing category');
            if (amount == null) errors.push('Invalid amount');

            let finalType = type;
            let finalAmount = amount;

            if (finalAmount != null && finalAmount < 0) {
              finalAmount = Math.abs(finalAmount);
              finalType = finalType ?? TRANSACTION_TYPES.EXPENSE;
            }

            if (!finalType) errors.push('Missing/invalid type');
            if (finalAmount != null && finalAmount <= 0) errors.push('Amount must be > 0');

            return {
              _row: idx + 2, // header row + 1-indexing
              date: isoDate ?? '',
              type: finalType ?? '',
              category,
              description: description === '-' ? '' : description,
              amount: finalAmount ?? '',
              _error: errors.length ? errors.join(', ') : ''
            };
          });

          setRows(mapped);
        } catch (e) {
          setParseError(e instanceof Error ? e.message : 'Failed to parse CSV');
        } finally {
          setParsing(false);
        }
      },
      error: (err) => {
        setParseError(err?.message || 'Failed to parse CSV');
        setParsing(false);
      }
    });
  };

  const handleImport = () => {
    const valid = rows.filter((r) => !r._error).map((r) => ({
      id: uuidv4(),
      date: r.date,
      type: r.type,
      category: r.category,
      description: r.description,
      amount: Number(r.amount),
      isRecurring: false,
    }));
    onImport(valid);
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <FileUp className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">Import CSV</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Local-only • No uploads</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Expected columns</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Date, Type (INCOME/EXPENSE), Category, Description (optional), Amount
                </p>
              </div>
              <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                Choose CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {file && (
              <div className="mt-3 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-300 truncate">
                  Selected: <span className="text-slate-900 dark:text-white">{file.name}</span>
                </p>
                <button
                  onClick={runParse}
                  disabled={parsing}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all text-xs font-black uppercase tracking-wider disabled:opacity-60"
                >
                  {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                  Parse
                </button>
              </div>
            )}
          </div>

          {parseError && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-300">Parse failed</p>
                <p className="text-xs text-red-600 dark:text-red-200 mt-1">{parseError}</p>
              </div>
            </div>
          )}

          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Preview (first 10 rows)
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" /> {validCount} valid
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-300">
                    <AlertCircle className="w-4 h-4" /> {invalidCount} invalid
                  </span>
                </div>
              </div>

              <div className="overflow-auto rounded-2xl border border-slate-100 dark:border-slate-700">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-300">
                    <tr>
                      <th className="text-left p-3 font-black uppercase tracking-wider">Row</th>
                      <th className="text-left p-3 font-black uppercase tracking-wider">Date</th>
                      <th className="text-left p-3 font-black uppercase tracking-wider">Type</th>
                      <th className="text-left p-3 font-black uppercase tracking-wider">Category</th>
                      <th className="text-left p-3 font-black uppercase tracking-wider">Amount</th>
                      <th className="text-left p-3 font-black uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {preview.map((r) => (
                      <tr key={r._row} className="bg-white dark:bg-slate-800">
                        <td className="p-3 text-slate-500 dark:text-slate-300 font-bold">{r._row}</td>
                        <td className="p-3 text-slate-900 dark:text-white">{r.date || '—'}</td>
                        <td className="p-3 text-slate-900 dark:text-white">{r.type || '—'}</td>
                        <td className="p-3 text-slate-900 dark:text-white">{r.category || '—'}</td>
                        <td className="p-3 text-slate-900 dark:text-white">{r.amount || '—'}</td>
                        <td className="p-3">
                          {r._error ? (
                            <span className="text-red-600 dark:text-red-300 font-bold">{r._error}</span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400 font-bold">OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all text-xs font-black uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={validCount === 0}
                  className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all text-xs font-black uppercase tracking-wider disabled:opacity-50"
                >
                  Import {validCount} transactions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


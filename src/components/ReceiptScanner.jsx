import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { scanReceipt } from '../services/aiService';

const ReceiptScanner = ({ onScanComplete }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image of a receipt.');
            return;
        }

        setScanning(true);
        setError(null);
        setSuccess(false);

        try {
            const data = await scanReceipt(file);
            console.log('Scanned Data:', data);

            setSuccess(true);
            onScanComplete(data);

          
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to scan receipt. Please try again.');
            console.error(err);
        } finally {
            setScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-blue-100 dark:border-blue-900 shadow-sm transition-all">
            <div className="flex flex-col items-center justify-center text-center gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full mb-1">
                    <Camera className="w-6 h-6 text-blue-500" />
                </div>

                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">AI Receipt Scanner</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                        Snap or upload a photo to automatically fill in transaction details.
                    </p>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />

                <div className="flex gap-2 w-full max-w-[240px]">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={scanning}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all
                            ${scanning
                                ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-md shadow-blue-200 dark:shadow-none'
                            }`}
                    >
                        {scanning ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Upload Receipt
                            </>
                        )}
                    </button>

                    {scanning && (
                        <button
                            disabled
                            className="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-2 rounded-lg"
                        >
                            <RefreshCw className="w-4 h-4 animate-spin-slow" />
                        </button>
                    )}
                </div>

                {success && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm animate-bounce mt-1">
                        <CheckCircle className="w-4 h-4" />
                        Details extracted!
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            <style jsx>{`
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ReceiptScanner;

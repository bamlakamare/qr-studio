'use client';

import React from 'react';
import { Home, AlertCircle, QrCode, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-4 font-sans">
            <div className="bg-white p-8 md:p-12 rounded-[30px] shadow-2xl flex flex-col items-center max-w-md w-full text-center border border-slate-100">

                {/* Thematic Illustration: Broken QR */}
                <div className="relative mb-8 group">
                    <div className="w-32 h-32 bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-emerald-200 transition-colors">
                        <QrCode className="w-16 h-16 text-slate-300 group-hover:text-emerald-300 transition-colors opacity-50 blur-[1px]" />
                    </div>
                    {/* Floating Error Icon */}
                    <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-lg border border-slate-100">
                        <div className="bg-red-50 p-2 rounded-xl">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                    Scan Failed
                </h1>
                <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                    We couldn't find the page you were looking for. It looks like this code leads to a dead end.
                </p>

                {/* Actions */}
                <div className="w-full space-y-3">
                    <a
                        href="/"
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-200 transform hover:-translate-y-1 active:translate-y-0"
                    >
                        <Home className="w-5 h-5" />
                        Return to Studio
                    </a>

                    <button
                        onClick={() => typeof window !== 'undefined' && window.history.back()}
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>

                {/* Technical Footer */}
                <div className="mt-10 pt-6 border-t border-slate-100 w-full flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    <span>QR Studio</span>
                    <span>404 Error</span>
                </div>
            </div>
        </div>
    );
}
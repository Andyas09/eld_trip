import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <h3 className="text-lg font-semibold text-slate-800">Generating Trip Plan</h3>
      <p className="text-sm text-slate-500 mt-1">Generating route, stops, and HOS logs...</p>
    </div>
  );
}
import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorState({ message, onClose }) {
  return (
    <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-4 shadow-sm">
      <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-rose-900 text-base">An Error Occurred</h3>
        <p className="text-sm text-rose-700 mt-1 leading-relaxed">{message || 'Failed to process trip plan. Please check your network connection or location names.'}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-3 text-xs font-medium text-rose-700 hover:text-rose-900 underline underline-offset-2"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
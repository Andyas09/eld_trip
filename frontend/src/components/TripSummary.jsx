import React from 'react';
import { Route, Clock, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

export default function TripSummary({ summary }) {
  if (!summary) return null;

  const isCompliant = summary.hos_status === 'Compliant';

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <h2 className="text-lg font-bold text-slate-800">Route & HOS Summary</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-lg text-blue-600">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Distance</p>
            <p className="text-lg font-bold text-slate-800">{summary.total_miles} mi</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-lg text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Trip Duration</p>
            <p className="text-lg font-bold text-slate-800">{summary.total_duration_hours} hrs</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-lg text-blue-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Estimated Days</p>
            <p className="text-lg font-bold text-slate-800">{summary.estimated_days} Days</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${isCompliant ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            {isCompliant ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">HOS Compliance</p>
            <p className={`text-base font-bold ${isCompliant ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isCompliant ? 'Compliant' : 'Warning'}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Initial Cycle (70-Hour):</span>
          <span className="font-semibold text-slate-700">{70 - summary.current_cycle_used} hrs left</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Remaining Cycle at Destination:</span>
          <span className="font-semibold text-slate-700">{summary.remaining_cycle} hrs</span>
        </div>
      </div>
    </div>
  );
}
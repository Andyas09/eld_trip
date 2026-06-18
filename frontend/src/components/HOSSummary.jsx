import React from 'react';
import { AlertCircle, ShieldAlert, Award, FileText } from 'lucide-react';

export default function HOSSummary({ warnings, summary }) {
  const isCompliant = summary && summary.hos_status === 'Compliant';

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Award className="w-5 h-5 text-blue-600" /> HOS Compliance Summary
      </h2>

      {warnings && warnings.length > 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
            <ShieldAlert className="w-4 h-4" /> Driver Warnings:
          </div>
          <ul className="list-disc pl-5 text-xs text-amber-800 space-y-1">
            {warnings.map((warn, index) => (
              <li key={index}>{warn}</li>
            ))}
          </ul>
          <p className="text-xs text-amber-700 mt-2 font-medium">
            💡 A 34-hour Off-Duty Reset is recommended before starting the trip if the remaining cycle hours are insufficient.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
          <div className="p-1 bg-emerald-100 rounded text-emerald-600 mt-0.5">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-950">All Regulations Complied</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              The trip route complies with all FMCSA Hours of Service (HOS) regulations: 11-Hour Driving, 14-Hour Duty Window, and 30-Minute Break.
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-50 p-4 rounded-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-600" /> Regulasi HOS FMCSA (Property-Carrying)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="bg-white p-2.5 rounded-lg border border-slate-100">
            <p className="font-bold text-slate-800">11-Hour Driving</p>
            <p className="mt-0.5">Drive maximum of 11 hours after 10 consecutive hours Off Duty.</p>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-100">
            <p className="font-bold text-slate-800">14-Hour Window</p>
            <p className="mt-0.5">Maximum on-duty window of 14 hours since starting duty.</p>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-100">
            <p className="font-bold text-slate-800">30-Min Break</p>
            <p className="mt-0.5">Take a 30-minute break after 8 cumulative hours of driving.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
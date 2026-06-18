import React from 'react';
import LogGrid from './LogGrid';

export default function DailyLogSheet({ log }) {
  if (!log) return null;

  const dateObj = new Date(log.date);
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString().slice(-2); 

  return (
    <div className="bg-white p-8 border border-slate-400 shadow-lg font-sans text-slate-900 space-y-6 max-w-5xl mx-auto rounded-lg">
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-black">Drivers Daily Log</h2>
          <span className="text-xs text-slate-500 font-bold uppercase">(24 hours)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="w-10 border-b border-black text-center font-bold text-sm">{month}</span>
            <span className="text-[9px] uppercase font-bold text-slate-500">(month)</span>
          </div>
          <span className="font-bold">/</span>
          <div className="flex flex-col items-center">
            <span className="w-10 border-b border-black text-center font-bold text-sm">{day}</span>
            <span className="text-[9px] uppercase font-bold text-slate-500">(day)</span>
          </div>
          <span className="font-bold">/</span>
          <div className="flex flex-col items-center">
            <span className="w-12 border-b border-black text-center font-bold text-sm">20{year}</span>
            <span className="text-[9px] uppercase font-bold text-slate-500">(year)</span>
          </div>
        </div>

        <div className="text-[10px] text-right text-slate-500 font-semibold max-w-[200px]">
          Original - File at home terminal.<br />
          Duplicate - Driver retains in possession for 8 days.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold uppercase text-xs shrink-0">From:</span>
          <span className="border-b border-dashed border-slate-400 flex-1 pb-0.5 text-black font-bold">{log.from}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold uppercase text-xs shrink-0">To:</span>
          <span className="border-b border-dashed border-slate-400 flex-1 pb-0.5 text-black font-bold">{log.to}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        <div className="md:col-span-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-slate-900 p-2 text-center bg-slate-50 rounded">
              <span className="block text-[8px] font-bold uppercase text-slate-500 leading-tight">Total Miles Driving Today</span>
              <span className="text-base font-extrabold text-black">{log.total_miles}</span>
            </div>
            <div className="border border-slate-900 p-2 text-center bg-slate-50 rounded">
              <span className="block text-[8px] font-bold uppercase text-slate-500 leading-tight">Total Mileage Today</span>
              <span className="text-base font-extrabold text-black">{log.total_miles}</span>
            </div>
          </div>
          <div className="border border-slate-900 p-2 bg-slate-50 rounded">
            <span className="block text-[8px] font-bold uppercase text-slate-500 mb-1 leading-tight">Truck/Tractor and Trailer Numbers (show each unit)</span>
            <span className="text-xs font-extrabold text-black">TRK-9022 / TRL-7711</span>
          </div>
        </div>

        <div className="md:col-span-7 space-y-4 text-xs font-semibold">
          <div className="flex items-end gap-2">
            <span className="text-slate-500 uppercase font-bold text-[10px] shrink-0">Name of Carrier:</span>
            <span className="border-b border-slate-300 flex-1 pb-0.5 font-bold text-black">ELD Trip Planner</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-slate-500 uppercase font-bold text-[10px] shrink-0">Main Office Address:</span>
            <span className="border-b border-slate-300 flex-1 pb-0.5 font-bold text-black">100 Enterprise Way, Chicago, IL</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-slate-500 uppercase font-bold text-[10px] shrink-0">Home Terminal Address:</span>
            <span className="border-b border-slate-300 flex-1 pb-0.5 font-bold text-black">Chicago Terminal Hub #4</span>
          </div>
        </div>

      </div>

      <div>
        <LogGrid activities={log.activities} totals={log.totals} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 border-t-2 border-slate-900 pt-4">
        
        <div className="md:col-span-4 border-r border-slate-200 pr-4 space-y-4 text-xs font-semibold">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-bold text-slate-500">Shipping Documents:</span>
            <div className="h-6 border-b border-slate-300 flex items-end font-bold text-black">BOL-2026-991A</div>
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-bold text-slate-500">DVL or Manifest No. or:</span>
            <div className="h-6 border-b border-slate-300 flex items-end font-bold text-black">MNF-7762-TRIP</div>
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-bold text-slate-500">Shipper & Commodity:</span>
            <div className="h-6 border-b border-slate-300 flex items-end font-bold text-black">General Logistics / Freight</div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-2">
          <h3 className="text-sm font-extrabold text-black uppercase tracking-wider">Remarks</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">
            Enter name of place you reported and where released from work and when and where each change of duty occurred.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded p-4 h-36 overflow-y-auto space-y-1.5 mt-2">
            {log.remarks && log.remarks.length > 0 ? (
              log.remarks.map((rem, idx) => (
                <div key={idx} className="flex gap-2 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 flex-shrink-0">📍</span>
                  <span className="leading-relaxed font-mono">{rem}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic font-mono">No remarks logged for today.</p>
            )}
          </div>
        </div>

      </div>

      <div className="border-t-2 border-slate-900 pt-4 text-[9px] font-semibold text-slate-600">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <span className="block font-bold text-slate-800 uppercase mb-1">Recap: Complete at end of day</span>
            <p className="leading-tight">On duty hours today, Total lines 3 & 4: <span className="font-bold text-black">{(log.totals.driving + log.totals.on_duty_not_driving).toFixed(2)} hours</span></p>
          </div>
          <div>
            <span className="block font-bold text-slate-800 uppercase mb-1">70 Hour / 8 Day Drivers</span>
            <p className="leading-tight">A. Total hours on duty last 7 days including today.</p>
          </div>
          <div>
            <span className="block font-bold text-slate-800 uppercase mb-1">B. Total hours available tomorrow</span>
            <p className="leading-tight">70 hours minus A* (Subject to recap rules).</p>
          </div>
          <div>
            <span className="block font-bold text-slate-800 uppercase mb-1">C. Total hours on duty last 8 days</span>
            <p className="leading-tight">Including today's duties.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
import React from 'react';
import { Compass, Circle } from 'lucide-react';

export default function RouteInstructions({ instructions }) {
  if (!instructions || instructions.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Compass className="w-5 h-5 text-blue-600" /> Trip Route Instructions
      </h2>
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
        {instructions.map((inst, index) => (
          <div key={index} className="flex gap-3 items-start text-sm">
            <div className="mt-1.5">
              <Circle className="w-2 h-2 text-blue-500 fill-blue-500" />
            </div>
            <p className="text-slate-600 leading-relaxed">{inst}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
import React from 'react';

export default function LogGrid({ activities, totals }) {
  const width = 800; 
  const height = 120; 
  const rowHeight = 30;

  const yMap = {
    off_duty: 15,
    sleeper_berth: 45,
    driving: 75,
    on_duty_not_driving: 105
  };

  let pathD = "";
  if (activities && activities.length > 0) {
    const sorted = [...activities].sort((a, b) => a.start_min - b.start_min);
    
    sorted.forEach((act, idx) => {
      const x1 = (act.start_min / 1440.0) * width;
      const x2 = (act.end_min / 1440.0) * width;
      const y = yMap[act.status] || 15;

      if (idx === 0) {
        pathD += `M ${x1} ${y} L ${x2} ${y}`;
      } else {
        const prevAct = sorted[idx - 1];
        const prevY = yMap[prevAct.status] || 15;
        
        if (prevY !== y) {
          pathD += ` L ${x1} ${y}`;
        }
        pathD += ` L ${x2} ${y}`;
      }
    });
  }

  const hourTicks = [];
  for (let i = 0; i <= 24; i++) {
    hourTicks.push((i / 24.0) * width);
  }

  const subTicks = [];
  for (let min = 0; min <= 1440; min += 15) {
    const x = (min / 1440.0) * width;
    const isHour = min % 60 === 0;
    const isHalf = min % 30 === 0;
    subTicks.push({ x, isHour, isHalf });
  }

  return (
    <div className="flex flex-col select-none">
      
      <div className="flex bg-black text-white text-[9px] font-bold py-1 px-2 uppercase tracking-wider items-center">
        <div className="w-[120px] shrink-0">Duty Status</div>
        <div className="flex-1 relative h-4">
          {hourTicks.map((x, i) => {
            let label = i.toString();
            if (i === 0 || i === 24) label = "Midnight";
            else if (i === 12) label = "Noon";

            return (
              <span
                key={i}
                className="absolute text-center transform -translate-x-1/2"
                style={{ left: `${(i / 24.0) * 100}%` }}
              >
                {label}
              </span>
            );
          })}
        </div>
        <div className="w-[80px] shrink-0 text-center">Total Hours</div>
      </div>

      <div className="flex items-stretch border-x border-b border-slate-900 bg-white">
        
        <div className="w-[120px] shrink-0 flex flex-col justify-between text-[10px] font-bold text-slate-700 bg-slate-50 border-r border-slate-900 py-1 pl-2">
          <div style={{ height: `${rowHeight}px`, lineHeight: `${rowHeight}px` }}>1. OFF DUTY</div>
          <div style={{ height: `${rowHeight}px`, lineHeight: `${rowHeight}px` }}>2. SLEEPER BERTH</div>
          <div style={{ height: `${rowHeight}px`, lineHeight: `${rowHeight}px` }}>3. DRIVING</div>
          <div style={{ height: `${rowHeight}px`, lineHeight: `${rowHeight}px` }}>4. ON DUTY (ND)</div>
        </div>

        <div className="flex-1 relative overflow-hidden" style={{ height: `${height}px` }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
            
            <line x1="0" y1="30" x2={width} y2="30" stroke="#000" strokeWidth="1" />
            <line x1="0" y1="60" x2={width} y2="60" stroke="#000" strokeWidth="1" />
            <line x1="0" y1="90" x2={width} y2="90" stroke="#000" strokeWidth="1" />

            {[0, 30, 60, 90].map((rowY) => (
              <g key={rowY}>
                {subTicks.map((tick, idx) => {
                  let tickHeight = 4;
                  if (tick.isHour) tickHeight = 12;
                  else if (tick.isHalf) tickHeight = 8;

                  return (
                    <g key={idx}>
                      
                      <line
                        x1={tick.x}
                        y1={rowY}
                        x2={tick.x}
                        y2={rowY + tickHeight}
                        stroke={tick.isHour ? "#475569" : "#94a3b8"}
                        strokeWidth={tick.isHour ? "1" : "0.5"}
                      />
                      
                      <line
                        x1={tick.x}
                        y1={rowY + 30}
                        x2={tick.x}
                        y2={rowY + 30 - tickHeight}
                        stroke={tick.isHour ? "#475569" : "#94a3b8"}
                        strokeWidth={tick.isHour ? "1" : "0.5"}
                      />
                    </g>
                  );
                })}
              </g>
            ))}

            {hourTicks.map((x, i) => (
              <line
                key={i}
                x1={x}
                y1="0"
                x2={x}
                y2={height}
                stroke="#000"
                strokeWidth={i % 12 === 0 ? "1.5" : "0.5"}
                opacity={0.3}
              />
            ))}

            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#000000" 
                strokeWidth="3"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            )}
          </svg>
        </div>

        <div className="w-[80px] shrink-0 flex flex-col justify-between items-center text-xs font-extrabold text-slate-800 bg-slate-50 border-l border-slate-900 py-1">
          <div style={{ height: `${rowHeight}px`, lineHeight: `${rowHeight}px` }} className="w-full text-center border-b border-slate-100">
            {totals.off_duty}
          </div>
          <div style={{ height: `${rowHeight}px`, lineHeight: `${rowHeight}px` }} className="w-full text-center border-b border-slate-100">
            {totals.sleeper_berth}
          </div>
          <div style={{ height: `${rowHeight}px`, lineHeight: `${rowHeight}px` }} className="w-full text-center border-b border-slate-100">
            {totals.driving}
          </div>
          <div style={{ height: `${rowHeight}px`, lineHeight: `${rowHeight}px` }} className="w-full text-center">
            {totals.on_duty_not_driving}
          </div>
        </div>

      </div>

    </div>
  );
}
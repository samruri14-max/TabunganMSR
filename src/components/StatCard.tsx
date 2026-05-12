import React from 'react';

interface CardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

export default function StatCard({ label, value, icon: Icon, color, trend }: CardProps) {
  return (
    <div className="bg-white rounded-3xl p-4 lg:p-6 shadow-sm border border-neutral-100 flex items-center transition-all hover:shadow-md hover:border-emerald-100 group">
      <div className={`p-3 lg:p-4 rounded-2xl mr-4 lg:mr-5 ${color} text-white group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 lg:w-7 lg:h-7" />
      </div>
      <div className="overflow-hidden">
        <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-0.5 lg:mb-1 truncate">{label}</p>
        <h3 className="text-lg lg:text-2xl font-bold text-neutral-800 truncate">{value}</h3>
        {trend && (
          <p className="text-[9px] lg:text-[11px] font-medium text-neutral-500 mt-0.5 lg:mt-1 truncate">
            <span className="text-emerald-500 mr-1 italic">{trend}</span> vs bulan lalu
          </p>
        )}
      </div>
    </div>
  );
}

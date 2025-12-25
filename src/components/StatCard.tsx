import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-700',
    accent: 'blue-600',
    glow: 'shadow-blue-200'
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    gradient: 'from-emerald-500 to-emerald-700',
    accent: 'emerald-600',
    glow: 'shadow-emerald-200'
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    gradient: 'from-emerald-500 to-emerald-700',
    accent: 'emerald-600',
    glow: 'shadow-emerald-200'
  },
  orange: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-600',
    accent: 'amber-600',
    glow: 'shadow-amber-200'
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-600',
    accent: 'amber-600',
    glow: 'shadow-amber-200'
  },
  red: {
    bg: 'bg-rose-50',
    icon: 'text-rose-600',
    gradient: 'from-rose-500 to-rose-700',
    accent: 'rose-600',
    glow: 'shadow-rose-200'
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'text-rose-600',
    gradient: 'from-rose-500 to-rose-700',
    accent: 'rose-600',
    glow: 'shadow-rose-200'
  },
  purple: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    gradient: 'from-indigo-500 to-purple-700',
    accent: 'indigo-600',
    glow: 'shadow-indigo-200'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    gradient: 'from-indigo-500 to-purple-700',
    accent: 'indigo-600',
    glow: 'shadow-indigo-200'
  }
};

export function StatCard({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  const styles = colorMap[color] || colorMap.blue;

  return (
    <div className="relative group overflow-hidden bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-gradient-to-br ${styles.gradient} opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-150 transition-all duration-700 rounded-full`}></div>

      <div className="flex items-start justify-between relative z-10">
        <div className={`p-4 rounded-2xl ${styles.bg} ${styles.icon} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          <Icon className="w-7 h-7" />
        </div>
        {trend && (
          <div className="text-right">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 relative z-10">
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
        <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-[0.1em]">{title}</p>
        {trend && (
          <p className="text-[11px] font-bold text-gray-400 mt-2">vs last cycle</p>
        )}
      </div>
    </div>
  );
}

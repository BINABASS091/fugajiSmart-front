import React from 'react';
import { Progress } from './ui/progress';
import { useSubscription } from '../contexts/SubscriptionContext';
import { AlertTriangle, CheckCircle, Crown, Lock } from 'lucide-react';

interface UsageCounterProps {
  feature: 'maxBirds' | 'maxPredictions' | 'maxBatches';
  currentUsage: number;
  label: string;
  className?: string;
}

const UsageCounter: React.FC<UsageCounterProps> = ({
  feature,
  currentUsage,
  label,
  className = '',
}) => {
  const { planLimits, getUpgradeMessage } = useSubscription();

  const limit = (planLimits[feature] as number) || 0;
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((currentUsage / limit) * 100, 100);
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage >= 100;

  const getStatusIcon = () => {
    if (isUnlimited) return <Crown className="w-4 h-4 text-emerald-500" />;
    if (isAtLimit) return <Lock className="w-4 h-4 text-rose-500" />;
    if (isNearLimit) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <CheckCircle className="w-4 h-4 text-blue-500" />;
  };

  const getProgressColor = () => {
    if (isAtLimit) return 'bg-rose-500';
    if (isNearLimit) return 'bg-amber-500';
    return 'bg-blue-600';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isUnlimited ? 'bg-emerald-50' : isAtLimit ? 'bg-rose-50' : 'bg-blue-50'}`}>
            {getStatusIcon()}
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-black tracking-tight ${isAtLimit ? 'text-rose-600' : 'text-gray-900'}`}>
            {currentUsage.toLocaleString()}
            {!isUnlimited && <span className="text-gray-400 font-bold ml-1">/ {limit.toLocaleString()}</span>}
          </span>
        </div>
      </div>

      {!isUnlimited && (
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          {isAtLimit && (
            <div className="px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl animate-shake">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-loose">
                Capacity Locked. {getUpgradeMessage(label)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsageCounter;

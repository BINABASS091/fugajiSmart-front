import React from 'react';
import { Card } from './ui/card';
import { Crown, Zap, ChevronRight, ShieldCheck, Star } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import UsageCounter from './UsageCounter';
import { Link } from 'react-router-dom';

interface SubscriptionSummaryProps {
  totalBirds: number;
  totalBatches: number;
  monthlyPredictions: number;
}

const SubscriptionSummary: React.FC<SubscriptionSummaryProps> = ({
  totalBirds,
  totalBatches,
  monthlyPredictions,
}) => {
  const { subscription } = useSubscription();

  const currentPlan = subscription?.plan_type || 'FREE';

  const getStyles = (plan: string) => {
    switch (plan) {
      case 'FREE': return {
        text: 'text-gray-600',
        bg: 'bg-gray-100',
        gradient: 'from-gray-100 to-gray-200',
        border: 'border-gray-200',
        accent: 'gray-500'
      };
      case 'BASIC': return {
        text: 'text-blue-600',
        bg: 'bg-blue-50',
        gradient: 'from-blue-600 to-indigo-700',
        border: 'border-blue-100',
        accent: 'blue-500'
      };
      case 'PREMIUM': return {
        text: 'text-indigo-600',
        bg: 'bg-indigo-50',
        gradient: 'from-indigo-600 to-purple-800',
        border: 'border-indigo-100',
        accent: 'indigo-500'
      };
      case 'ENTERPRISE': return {
        text: 'text-amber-600',
        bg: 'bg-amber-100',
        gradient: 'from-amber-500 to-orange-700',
        border: 'border-amber-200',
        accent: 'amber-500'
      };
      default: return {
        text: 'text-gray-600',
        bg: 'bg-gray-100',
        gradient: 'from-gray-100 to-gray-200',
        border: 'border-gray-200',
        accent: 'gray-500'
      };
    }
  };

  const styles = getStyles(currentPlan);

  return (
    <Card className="relative overflow-hidden bg-white rounded-[40px] border border-gray-100 p-8 shadow-xl shadow-gray-200/40 group">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${styles.bg} ${styles.text} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">FugajiSmart Status</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles.bg} ${styles.text}`}>
                {currentPlan} Tier
              </span>
              {subscription?.status === 'active' && (
                <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </div>
              )}
            </div>
          </div>
        </div>

        <Link
          to="/farmer/subscription"
          className="p-3 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-2xl transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="space-y-6 relative z-10">
        <UsageCounter
          feature="maxBirds"
          currentUsage={totalBirds}
          label="Operational Birds"
        />

        <UsageCounter
          feature="maxBatches"
          currentUsage={totalBatches}
          label="Active Batch Logic"
        />

        <UsageCounter
          feature="maxPredictions"
          currentUsage={monthlyPredictions}
          label="AI Predictions"
        />
      </div>

      {currentPlan === 'FREE' ? (
        <div className="mt-8 p-8 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[32px] text-white relative overflow-hidden group/btn shadow-xl shadow-blue-200">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-white/10 rounded-full group-hover/btn:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Elevate Capacity</span>
          </div>
          <p className="text-sm font-bold text-blue-50 leading-snug mb-6 relative z-10">
            Unlock advanced biometric analysis and unlimited fleet tracking.
          </p>
          <Link
            to="/farmer/subscription"
            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-50 transition-all active:scale-95"
          >
            Explore Premium
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
            <Star className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-relaxed">
            You are currently utilizing full tier benefits.
          </p>
        </div>
      )}
    </Card>
  );
};

export default SubscriptionSummary;

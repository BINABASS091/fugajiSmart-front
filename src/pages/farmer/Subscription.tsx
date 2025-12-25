import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useToast } from '../../components/ui/toast';
import {
  Calendar,
  Crown,
  Star,
  Zap,
  Check,
  X,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionData {
  id: string;
  farmer_id: string;
  plan_type: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  start_date: string;
  end_date: string | null;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
}

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  name: string;
  price: number;
  duration: string;
  description: string;
  features: PlanFeature[];
  icon: React.ComponentType<any>;
  color: string;
  popular?: boolean;
}

const Subscription: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { subscription, refreshSubscription } = useSubscription();
  const { toast } = useToast();
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const plans: Plan[] = [
    {
      id: 'FREE',
      name: 'Community',
      price: 0,
      duration: 'Forever',
      description: 'Foundational toolset for manual operations',
      icon: Star,
      color: 'text-gray-400',
      features: [
        { name: '10 Unit Tracking Capacity', included: true },
        { name: 'Linear Health Monitoring', included: true },
        { name: '5 Predictions / Cycle', included: true },
        { name: 'Standard Support Path', included: true },
        { name: 'Advanced AI Analytics', included: false },
        { name: 'Multi-Batch Logic', included: false },
        { name: 'Ledger Integration', included: false },
      ]
    },
    {
      id: 'BASIC',
      name: 'Operational',
      price: 15,
      duration: 'per month',
      description: 'Enhanced throughput for growing units',
      icon: Zap,
      color: 'text-blue-500',
      features: [
        { name: '100 Unit Tracking Capacity', included: true },
        { name: 'Refined Health Monitoring', included: true },
        { name: '50 Predictions / Cycle', included: true },
        { name: 'Expedited Support Path', included: true },
        { name: 'Baseline Analytics', included: true },
        { name: 'Multi-Batch Logic', included: true },
        { name: 'Inventory Integration', included: false },
      ]
    },
    {
      id: 'PREMIUM',
      name: 'Advanced',
      price: 35,
      duration: 'per month',
      description: 'Precision control for professional hubs',
      icon: Crown,
      color: 'text-amber-500',
      popular: true,
      features: [
        { name: '500 Unit Tracking Capacity', included: true },
        { name: 'Real-time Health Monitoring', included: true },
        { name: 'Infinite AI Predictions', included: true },
        { name: 'Executive Support Path', included: true },
        { name: 'Strategic Analytics', included: true },
        { name: 'Inventory & Stock Logic', included: true },
        { name: 'IoT Core Integration', included: true },
      ]
    },
    {
      id: 'ENTERPRISE',
      name: 'Sovereign',
      price: 99,
      duration: 'per month',
      description: 'Industrial grade infrastructure for empires',
      icon: Cpu,
      color: 'text-indigo-600',
      features: [
        { name: 'Infinite Tracking Capacity', included: true },
        { name: 'Sensor Data Aggregation', included: true },
        { name: 'Custom AI Modeling', included: true },
        { name: '24/7 Red-Line Support', included: true },
        { name: 'Industrial Analytics Suite', included: true },
        { name: 'Full API Access Node', included: true },
        { name: 'Dedicated Data Analyst', included: true },
      ]
    },
  ];

  const fetchSubscription = useCallback(async () => {
    try {
      if (!user) return;
      setLoading(true);
      const subscriptions = await dataService.getSubscriptions(user.id);
      const active = subscriptions
        .filter(s => s.status === 'active')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      setCurrentSubscription(active as SubscriptionData || null);
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleUpgrade = async (planId: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE') => {
    if (!user) return;
    try {
      setLoading(true);
      const endDate = planId === 'FREE' ? null : new Date();
      if (endDate) endDate.setDate(endDate.getDate() + 30);

      await dataService.createSubscription({
        farmer_id: user.id,
        plan_type: planId,
        start_date: new Date().toISOString(),
        end_date: endDate ? endDate.toISOString() : null,
        amount: plans.find(p => p.id === planId)?.price || 0,
        status: 'active',
      });

      await refreshSubscription();
      await fetchSubscription();
      toast({ title: 'Access level upgraded successfully.' });
    } catch (err) {
      console.error('Error upgrading subscription:', err);
      toast({ title: 'License upgrade sequence failed.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Validating Access Credentials...</p>
      </div>
    );
  }

  const currentPlan = currentSubscription?.plan_type || 'FREE';

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Dynamic Header */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
          <Sparkles className="w-3.5 h-3.5" />
          Access Management Console
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
          Choose Your <span className="text-indigo-600">Access Tier</span>
        </h1>
        <p className="text-gray-500 font-bold text-lg leading-relaxed">
          Select the operational capacity that aligns with your strategic objectives.
          Each tier provides specific logic gates and tracking infrastructure.
        </p>
      </div>

      {currentSubscription && (
        <Card className="p-10 bg-gray-900 rounded-[40px] shadow-2xl shadow-gray-200 border-none relative overflow-hidden group max-w-4xl mx-auto">
          <div className="absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 bg-indigo-500/10 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Fingerprint className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current active tier</h2>
              </div>
              <h3 className="text-4xl font-black text-white uppercase tracking-tight">
                {plans.find(p => p.id === currentPlan)?.name} <span className="text-indigo-500 text-2xl">Operational</span>
              </h3>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Exp: {currentSubscription.end_date ? format(new Date(currentSubscription.end_date), 'dd MMM yyyy') : 'Indefinite'}</span>
                <span className="flex items-center gap-2 text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> Active Status Verified</span>
              </div>
            </div>
            <div className="px-10 py-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Billing Interval</p>
              <p className="text-2xl font-black text-white uppercase tracking-widest">Monthly</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={`p-10 relative flex flex-col rounded-[3rem] border-none shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group ${plan.popular ? 'bg-indigo-600 text-white ring-8 ring-indigo-50 shadow-indigo-200/50' : 'bg-white text-gray-900'
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-amber-400 text-gray-900 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                    Highest Utilization
                  </span>
                </div>
              )}

              <div className="mb-10">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 ${plan.popular ? 'bg-white text-indigo-600' : 'bg-gray-50 text-gray-900'
                  }`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight">${plan.price}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${plan.popular ? 'opacity-60' : 'text-gray-400'}`}>/{plan.duration}</span>
                </div>
                <p className={`text-[10px] font-bold mt-4 uppercase tracking-widest leading-loose ${plan.popular ? 'opacity-80' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
              </div>

              <div className={`space-y-4 mb-10 flex-1 border-t pt-8 ${plan.popular ? 'border-white/10' : 'border-gray-50'}`}>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${feature.included
                        ? (plan.popular ? 'bg-indigo-400' : 'bg-emerald-500')
                        : (plan.popular ? 'bg-white/10' : 'bg-gray-100')
                      }`}>
                      {feature.included ? (
                        <Check className={`w-3 h-3 ${plan.popular ? 'text-indigo-900' : 'text-white'}`} />
                      ) : (
                        <X className={`w-3 h-3 ${plan.popular ? 'text-white/20' : 'text-gray-300'}`} />
                      )}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${feature.included
                        ? (plan.popular ? 'text-white' : 'text-gray-900')
                        : (plan.popular ? 'text-white/30' : 'text-gray-300')
                      }`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrentPlan || loading}
                className={`w-full py-8 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 border-none ${isCurrentPlan
                    ? (plan.popular ? 'bg-white/10 text-white cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                    : (plan.popular ? 'bg-white text-indigo-600 hover:bg-gray-100 shadow-indigo-900/20' : 'bg-gray-900 text-white hover:bg-black shadow-gray-200')
                  }`}
              >
                {isCurrentPlan ? 'Current Access' : plan.id === 'FREE' ? 'Decommission' : 'Confirm Access'}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center pt-8">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Secure Payment Processing Terminal • PCI-DSS Certified
        </p>
      </div>
    </div>
  );
};

export default Subscription;

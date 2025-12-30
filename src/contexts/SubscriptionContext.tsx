import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dataService } from '../services/dataService';
import { useAuth } from './AuthContext';

interface Subscription {
  id: string;
  farmer: string;
  plan: string;
  status: 'TRIAL' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAYMENT_PENDING';
  start_date: string;
  end_date: string;
  amount: number;
  is_active: boolean;
  auto_renew: boolean;
}

interface PlanLimits {
  maxBirds: number;
  maxPredictions: number;
  maxBatches: number;
  maxInventoryItems: number;
  hasFinancialTracking: boolean;
  hasAdvancedAnalytics: boolean;
  hasInventoryManagement: boolean;
  hasMultiFarmManagement: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  planLimits: PlanLimits;
  loading: boolean;
  error: string | null;
  checkLimit: (feature: keyof PlanLimits, currentUsage?: number) => boolean;
  refreshSubscription: () => Promise<void>;
  canUpgrade: () => boolean;
  getUpgradeMessage: (feature: string) => string;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxBirds: 10,
    maxPredictions: 5,
    maxBatches: 1,
    maxInventoryItems: 0,
    hasFinancialTracking: false,
    hasAdvancedAnalytics: false,
    hasInventoryManagement: false,
    hasMultiFarmManagement: false,
    hasApiAccess: false,
    hasPrioritySupport: false,
  },
  BASIC: {
    maxBirds: 100,
    maxPredictions: 50,
    maxBatches: 5,
    maxInventoryItems: 50,
    hasFinancialTracking: false,
    hasAdvancedAnalytics: false,
    hasInventoryManagement: true,
    hasMultiFarmManagement: false,
    hasApiAccess: false,
    hasPrioritySupport: false,
  },
  PREMIUM: {
    maxBirds: 500,
    maxPredictions: -1, // unlimited
    maxBatches: 20,
    maxInventoryItems: 200,
    hasFinancialTracking: true,
    hasAdvancedAnalytics: true,
    hasInventoryManagement: true,
    hasMultiFarmManagement: false,
    hasApiAccess: false,
    hasPrioritySupport: true,
  },
  ENTERPRISE: {
    maxBirds: -1, // unlimited
    maxPredictions: -1, // unlimited
    maxBatches: -1, // unlimited
    maxInventoryItems: -1, // unlimited
    hasFinancialTracking: true,
    hasAdvancedAnalytics: true,
    hasInventoryManagement: true,
    hasMultiFarmManagement: true,
    hasApiAccess: true,
    hasPrioritySupport: true,
  },
};

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPlan = () => {
    if (!subscription?.plan) return 'FREE';
    
    // Map plan UUIDs to plan names
    const planMap: Record<string, string> = {
      'e26d445c-830c-4cbd-a373-041591571a65': 'FREE',
      '88cf2e12-facf-4264-a3a3-1f7bdbdd5527': 'BASIC',
      '3f44713d-e12d-45a7-94d4-ec713c7b4ac6': 'PREMIUM',
      '57c80757-0014-4208-a642-96bfa724ff89': 'ENTERPRISE'
    };
    
    return planMap[subscription.plan] || 'FREE';
  };

  const planLimits = PLAN_LIMITS[getCurrentPlan()];

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const subscriptions = await dataService.getSubscriptions(user.id);
      console.log('Fetched subscriptions:', subscriptions);
      
      const activeSubscription = subscriptions
        .filter((s: any) => s.status === 'ACTIVE')
        .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];

      console.log('Active subscription:', activeSubscription);

      // Check if subscription is expired
      if (activeSubscription && activeSubscription.end_date) {
        const endDate = new Date(activeSubscription.end_date);
        const now = new Date();
        if (endDate < now) {
          // Mark subscription as expired
          setSubscription(null);
        } else {
          setSubscription(activeSubscription);
        }
      } else {
        setSubscription(activeSubscription || null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const checkLimit = (feature: keyof PlanLimits, currentUsage?: number): boolean => {
    const limit = planLimits[feature];
    
    // For boolean features, return the value directly
    if (typeof limit === 'boolean') {
      return limit;
    }
    
    // For numeric limits, check against current usage
    if (typeof limit === 'number' && currentUsage !== undefined) {
      // -1 means unlimited
      if (limit === -1) return true;
      return currentUsage < limit;
    }
    
    // Default to false if we can't determine
    return false;
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  const canUpgrade = (): boolean => {
    const currentPlan = getCurrentPlan();
    return currentPlan !== 'ENTERPRISE';
  };

  const getUpgradeMessage = (feature: string): string => {
    const currentPlan = getCurrentPlan();
    
    switch (currentPlan) {
      case 'FREE':
        return `Upgrade to Basic plan to unlock ${feature}`;
      case 'BASIC':
        return `Upgrade to Premium plan to access ${feature}`;
      case 'PREMIUM':
        return `Upgrade to Enterprise plan for unlimited ${feature}`;
      default:
        return `Upgrade your plan to access ${feature}`;
    }
  };

  const value: SubscriptionContextType = {
    subscription,
    planLimits,
    loading,
    error,
    checkLimit,
    refreshSubscription,
    canUpgrade,
    getUpgradeMessage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

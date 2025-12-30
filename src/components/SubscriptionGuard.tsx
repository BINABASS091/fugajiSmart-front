import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Crown, Lock, ArrowUpRight } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGuardProps {
  feature: string;
  planRequired: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

const PLAN_HIERARCHY: Record<string, number> = {
  'FREE': 0,
  'BASIC': 1,
  'PREMIUM': 2,
  'ENTERPRISE': 3,
};

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  feature,
  planRequired,
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  
  // Get current plan from the context's plan limits logic
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
  
  const currentPlan = getCurrentPlan();
  const hasAccess = PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[planRequired];

  const handleUpgrade = () => {
    navigate('/farmer/subscription');
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-dashed border-2 border-blue-200">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Unlock {feature}
          </h3>
          <p className="text-gray-600 max-w-sm">
            This feature requires a {planRequired} plan or higher. 
            Upgrade your subscription to access advanced functionality.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Crown className="w-4 h-4" />
            <span>Current: {currentPlan} Plan</span>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>Required: {planRequired} Plan</span>
          </div>
        </div>

        <Button
          onClick={handleUpgrade}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade Plan
        </Button>
      </div>
    </Card>
  );
};

export default SubscriptionGuard;

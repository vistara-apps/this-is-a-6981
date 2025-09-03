import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { isConnected, publicKey } = useWallet();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [nextBillingDate, setNextBillingDate] = useState(null);
  const [usage, setUsage] = useState({
    proposals: 0,
    votes: 0,
    deployments: 0
  });
  
  // Define subscription plans
  const plans = {
    free: {
      id: 'free',
      name: 'Free',
      price: {
        monthly: 0,
        yearly: 0
      },
      features: [
        'Create up to 3 proposals',
        'Basic voting functionality',
        'Public deployment',
        'Community support'
      ],
      limits: {
        proposals: 3,
        votes: 50,
        deployments: 1
      }
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: {
        monthly: 29,
        yearly: 290
      },
      features: [
        'Create up to 20 proposals',
        'Advanced voting options',
        'Verifiable deployment',
        'Email support',
        'Custom branding'
      ],
      limits: {
        proposals: 20,
        votes: 500,
        deployments: 5
      }
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      price: {
        monthly: 99,
        yearly: 990
      },
      features: [
        'Unlimited proposals',
        'Advanced analytics',
        'Multiple deployments',
        'Priority support',
        'Custom integrations',
        'Dedicated account manager'
      ],
      limits: {
        proposals: Infinity,
        votes: Infinity,
        deployments: Infinity
      }
    }
  };

  // Initialize subscription data when wallet is connected
  useEffect(() => {
    if (isConnected && publicKey) {
      // In a real implementation, we would fetch the user's subscription data from a backend
      // For now, we'll just use the free plan as default
      setCurrentPlan('free');
      setSubscriptionStatus('active');
      setBillingCycle('monthly');
      
      // Set next billing date to 30 days from now
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 30);
      setNextBillingDate(nextDate);
      
      // Reset usage
      setUsage({
        proposals: 0,
        votes: 0,
        deployments: 0
      });
    }
  }, [isConnected, publicKey]);

  // Update subscription plan
  const updatePlan = async (planId, cycle = 'monthly') => {
    if (!isConnected) {
      return { success: false, error: 'Please connect your wallet first' };
    }
    
    if (!plans[planId]) {
      return { success: false, error: 'Invalid plan' };
    }
    
    try {
      // In a real implementation, we would call a backend API to update the subscription
      // For now, we'll just update the state
      setCurrentPlan(planId);
      setBillingCycle(cycle);
      
      // Set next billing date to 30 days from now for monthly, 365 days for yearly
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + (cycle === 'monthly' ? 30 : 365));
      setNextBillingDate(nextDate);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return { success: false, error: error.message };
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!isConnected) {
      return { success: false, error: 'Please connect your wallet first' };
    }
    
    try {
      // In a real implementation, we would call a backend API to cancel the subscription
      // For now, we'll just update the state
      setSubscriptionStatus('canceled');
      
      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: error.message };
    }
  };

  // Update usage statistics
  const updateUsage = (type) => {
    if (!type || !usage.hasOwnProperty(type)) return;
    
    setUsage(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  // Check if the user has reached the limit for a specific feature
  const checkLimit = (type) => {
    if (!type || !usage.hasOwnProperty(type)) return true;
    
    const currentPlanData = plans[currentPlan];
    if (!currentPlanData) return false;
    
    return usage[type] < currentPlanData.limits[type];
  };

  // Format price for display
  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${price}/${billingCycle === 'monthly' ? 'mo' : 'yr'}`;
  };

  // Get remaining usage for a specific feature
  const getRemainingUsage = (type) => {
    if (!type || !usage.hasOwnProperty(type)) return 0;
    
    const currentPlanData = plans[currentPlan];
    if (!currentPlanData) return 0;
    
    const limit = currentPlanData.limits[type];
    if (limit === Infinity) return 'Unlimited';
    
    return limit - usage[type];
  };

  return (
    <SubscriptionContext.Provider value={{
      currentPlan,
      plans,
      subscriptionStatus,
      billingCycle,
      nextBillingDate,
      usage,
      updatePlan,
      cancelSubscription,
      updateUsage,
      checkLimit,
      formatPrice,
      getRemainingUsage
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};


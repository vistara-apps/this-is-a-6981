import React, { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { Check, X, CreditCard } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';
import PaymentForm from './PaymentForm';

const SubscriptionPlans = () => {
  const { 
    plans, 
    currentPlan, 
    billingCycle, 
    updatePlan, 
    formatPrice, 
    usage, 
    getRemainingUsage 
  } = useSubscription();
  
  const [cycle, setCycle] = useState(billingCycle);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    setIsPaymentModalOpen(true);
  };
  
  const handlePaymentSuccess = async () => {
    setLoading(true);
    
    try {
      const result = await updatePlan(selectedPlan, cycle);
      
      if (result.success) {
        setIsPaymentModalOpen(false);
      } else {
        console.error('Error updating plan:', result.error);
      }
    } catch (error) {
      console.error('Error updating plan:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-text-primary">Subscription Plans</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Choose the plan that best fits your needs. All plans include access to the core SolVote features.
        </p>
        
        <div className="inline-flex items-center bg-surface/50 p-1 rounded-lg mt-6">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              cycle === 'monthly' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              cycle === 'yearly' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setCycle('yearly')}
          >
            Yearly <span className="text-xs opacity-75">(Save 20%)</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.values(plans).map((plan) => (
          <div 
            key={plan.id} 
            className={`rounded-xl overflow-hidden border ${
              currentPlan === plan.id 
                ? 'border-primary shadow-lg shadow-primary/20' 
                : 'border-surface/50'
            }`}
          >
            <div className="bg-surface/50 p-6">
              <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold text-text-primary">
                  {formatPrice(plan.price[cycle])}
                </span>
                {plan.price[cycle] > 0 && (
                  <span className="text-text-secondary ml-1">
                    /{cycle === 'monthly' ? 'month' : 'year'}
                  </span>
                )}
              </div>
              <p className="mt-2 text-text-secondary text-sm">
                {plan.id === 'free' 
                  ? 'Perfect for getting started' 
                  : plan.id === 'pro' 
                    ? 'Great for active communities' 
                    : 'For organizations with advanced needs'}
              </p>
              
              <Button
                variant={currentPlan === plan.id ? 'secondary' : 'primary'}
                fullWidth
                className="mt-4"
                onClick={() => handleSelectPlan(plan.id)}
                disabled={currentPlan === plan.id}
              >
                {currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
              </Button>
            </div>
            
            <div className="p-6 bg-bg">
              <h4 className="font-medium text-text-primary mb-4">Features</h4>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      
      {currentPlan !== 'free' && (
        <div className="mt-8 p-6 bg-surface/30 rounded-lg border border-surface/50">
          <h2 className="text-xl font-bold text-text-primary mb-4">Current Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-surface/50 rounded-lg">
              <h3 className="text-text-secondary font-medium">Proposals</h3>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-2xl font-bold text-text-primary">{usage.proposals}</div>
                <div className="text-text-secondary text-sm">
                  of {getRemainingUsage('proposals') === 'Unlimited' 
                    ? 'Unlimited' 
                    : usage.proposals + getRemainingUsage('proposals')}
                </div>
              </div>
              <div className="mt-2 w-full bg-surface/70 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ 
                    width: `${getRemainingUsage('proposals') === 'Unlimited' 
                      ? '10' 
                      : (usage.proposals / (usage.proposals + getRemainingUsage('proposals'))) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 bg-surface/50 rounded-lg">
              <h3 className="text-text-secondary font-medium">Votes</h3>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-2xl font-bold text-text-primary">{usage.votes}</div>
                <div className="text-text-secondary text-sm">
                  of {getRemainingUsage('votes') === 'Unlimited' 
                    ? 'Unlimited' 
                    : usage.votes + getRemainingUsage('votes')}
                </div>
              </div>
              <div className="mt-2 w-full bg-surface/70 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ 
                    width: `${getRemainingUsage('votes') === 'Unlimited' 
                      ? '10' 
                      : (usage.votes / (usage.votes + getRemainingUsage('votes'))) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 bg-surface/50 rounded-lg">
              <h3 className="text-text-secondary font-medium">Deployments</h3>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-2xl font-bold text-text-primary">{usage.deployments}</div>
                <div className="text-text-secondary text-sm">
                  of {getRemainingUsage('deployments') === 'Unlimited' 
                    ? 'Unlimited' 
                    : usage.deployments + getRemainingUsage('deployments')}
                </div>
              </div>
              <div className="mt-2 w-full bg-surface/70 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ 
                    width: `${getRemainingUsage('deployments') === 'Unlimited' 
                      ? '10' 
                      : (usage.deployments / (usage.deployments + getRemainingUsage('deployments'))) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Payment Information"
      >
        <PaymentForm 
          planId={selectedPlan}
          cycle={cycle}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setIsPaymentModalOpen(false)}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default SubscriptionPlans;


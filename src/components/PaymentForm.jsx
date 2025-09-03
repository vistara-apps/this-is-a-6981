import React, { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { CreditCard, Calendar, Lock } from 'lucide-react';
import Button from './Button';

const PaymentForm = ({ planId, cycle, onSuccess, onCancel, loading }) => {
  const { plans, formatPrice } = useSubscription();
  const plan = plans[planId];
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Invalid card number';
    }
    
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Name on card is required';
    }
    
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid format (MM/YY)';
    }
    
    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Invalid CVV';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real implementation, we would process the payment here
      onSuccess();
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-surface/30 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-text-primary">{plan.name} Plan</h3>
            <p className="text-text-secondary text-sm">{cycle === 'monthly' ? 'Monthly' : 'Annual'} billing</p>
          </div>
          <div className="text-xl font-bold text-text-primary">
            {formatPrice(plan.price[cycle])}
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                setFormData(prev => ({ ...prev, cardNumber: formatted }));
              }}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-4 py-2 pl-10 bg-surface/50 border ${
                errors.cardNumber ? 'border-red-500' : 'border-surface/80'
              } rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50`}
              maxLength={19}
            />
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Name on Card
          </label>
          <input
            type="text"
            name="cardName"
            value={formData.cardName}
            onChange={handleChange}
            placeholder="John Doe"
            className={`w-full px-4 py-2 bg-surface/50 border ${
              errors.cardName ? 'border-red-500' : 'border-surface/80'
            } rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50`}
          />
          {errors.cardName && (
            <p className="mt-1 text-xs text-red-500">{errors.cardName}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Expiry Date
            </label>
            <div className="relative">
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="MM/YY"
                className={`w-full px-4 py-2 pl-10 bg-surface/50 border ${
                  errors.expiryDate ? 'border-red-500' : 'border-surface/80'
                } rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50`}
                maxLength={5}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            </div>
            {errors.expiryDate && (
              <p className="mt-1 text-xs text-red-500">{errors.expiryDate}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              CVV
            </label>
            <div className="relative">
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                className={`w-full px-4 py-2 pl-10 bg-surface/50 border ${
                  errors.cvv ? 'border-red-500' : 'border-surface/80'
                } rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50`}
                maxLength={4}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            </div>
            {errors.cvv && (
              <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-start mt-4">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="mt-1"
          />
          <label htmlFor="agreeToTerms" className="ml-2 text-sm text-text-secondary">
            I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="mt-1 text-xs text-red-500">{errors.agreeToTerms}</p>
        )}
        
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {plan.price[cycle] > 0 ? 'Pay Now' : 'Confirm'}
          </Button>
        </div>
      </form>
      
      <div className="text-center text-xs text-text-secondary mt-4 flex items-center justify-center">
        <Lock className="w-3 h-3 mr-1" />
        Payments are secure and encrypted
      </div>
    </div>
  );
};

export default PaymentForm;


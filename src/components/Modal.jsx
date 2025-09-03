import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  variant = 'default',
  maxWidth = 'md'
}) => {
  const modalRef = useRef(null);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Close modal when pressing Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // Determine max width class
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full'
  }[maxWidth] || 'max-w-md';
  
  // Determine variant classes
  const variantClasses = {
    default: 'bg-bg border border-surface/50',
    confirmation: 'bg-bg border border-primary/30',
    large: 'bg-bg border border-surface/50'
  }[variant] || 'bg-bg border border-surface/50';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        ref={modalRef}
        className={`w-full ${maxWidthClass} rounded-xl shadow-xl overflow-hidden animate-slide-up ${variantClasses}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface/50">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 hover:bg-surface/50 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        
        {/* Footer (optional) */}
        {footer && (
          <div className="p-4 border-t border-surface/50 bg-surface/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;


import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  className = '',
  onClick,
  type = 'button',
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-purple-600 border border-primary hover:translate-y-[-2px] hover:shadow-lg text-white focus:ring-primary/50',
    secondary: 'bg-surface border border-surface/80 hover:bg-surface/80 hover:translate-y-[-1px] text-text-primary focus:ring-surface/50',
    destructive: 'bg-red-600 border border-red-700 hover:bg-red-700 hover:translate-y-[-1px] text-white focus:ring-red-600/50',
    ghost: 'bg-transparent hover:bg-surface/50 text-text-primary',
    link: 'bg-transparent underline-offset-4 hover:underline text-primary p-0 h-auto',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary/10 focus:ring-primary/50',
  };
  
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5 h-6',
    sm: 'text-xs px-2 py-1 h-8',
    md: 'text-sm px-4 py-2 h-10',
    lg: 'text-base px-6 py-3 h-12',
    xl: 'text-lg px-8 py-4 h-14',
  };
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${disabled || loading ? 'opacity-70 cursor-not-allowed' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;
  
  // Determine icon sizes based on button size
  const getIconSize = () => {
    switch (size) {
      case 'xs': return 'h-3 w-3';
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-4 w-4';
      case 'lg': return 'h-5 w-5';
      case 'xl': return 'h-6 w-6';
      default: return 'h-4 w-4';
    }
  };
  
  const iconSize = getIconSize();
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${children ? 'mr-2' : ''} ${iconSize} animate-spin`} />
      ) : leftIcon && (
        <span className={`${children ? 'mr-2' : ''} ${iconSize}`}>
          {leftIcon}
        </span>
      )}
      
      {children}
      
      {rightIcon && !loading && (
        <span className={`${children ? 'ml-2' : ''} ${iconSize}`}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;

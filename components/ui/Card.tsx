import React from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outline';
  children: React.ReactNode;
}

export const Card = React.forwardRef<View, CardProps>(
  ({ variant = 'default', children, className = '', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-hair-bg-dark',
      elevated: 'bg-hair-bg-dark shadow-lg shadow-black/50',
      outline: 'bg-transparent border border-hair-gold/30',
    };

    return (
      <View
        ref={ref}
        className={`rounded-2xl p-4 ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ children, className = '', ...props }: ViewProps) => (
  <View className={`mb-3 ${className}`} {...props}>
    {children}
  </View>
);

export const CardContent = ({ children, className = '', ...props }: ViewProps) => (
  <View className={className} {...props}>
    {children}
  </View>
);

export const CardFooter = ({ children, className = '', ...props }: ViewProps) => (
  <View className={`mt-3 ${className}`} {...props}>
    {children}
  </View>
);

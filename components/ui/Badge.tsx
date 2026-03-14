import React from 'react';
import { View, Text } from 'react-native';
import type { ViewProps } from 'react-native';

export interface BadgeProps extends ViewProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: BadgeProps) => {
  const variantStyles = {
    default: 'bg-hair-gold/20 border-hair-gold/30',
    success: 'bg-success/20 border-success/30',
    warning: 'bg-warning/20 border-warning/30',
    error: 'bg-error/20 border-error/30',
    info: 'bg-info/20 border-info/30',
  };

  const textColorStyles = {
    default: 'text-hair-gold',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View
      className={`
        inline-flex flex-row items-center justify-center rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      <Text
        className={`font-medium ${textColorStyles[variant]} ${textSizeStyles[size]}`}
      >
        {children}
      </Text>
    </View>
  );
};

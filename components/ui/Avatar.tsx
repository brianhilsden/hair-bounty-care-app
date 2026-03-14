import React from 'react';
import { View, Text, Image } from 'react-native';
import type { ViewProps } from 'react-native';

export interface AvatarProps extends ViewProps {
  uri?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-12 h-12', text: 'text-base' },
  lg: { container: 'w-16 h-16', text: 'text-xl' },
  xl: { container: 'w-24 h-24', text: 'text-3xl' },
};

const sizePx = { sm: 32, md: 48, lg: 64, xl: 96 };

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar = ({ uri, name, size = 'md', className = '', ...props }: AvatarProps) => {
  const { container, text } = sizeStyles[size];
  const px = sizePx[size];

  return (
    <View
      className={`${container} rounded-full bg-hair-bg-light border border-hair-gold/30 items-center justify-center overflow-hidden ${className}`}
      {...props}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: px, height: px }}
          resizeMode="cover"
        />
      ) : (
        <Text className={`${text} text-hair-gold font-bold`}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
};

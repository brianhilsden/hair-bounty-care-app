import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  emoji,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <View className="items-center py-10 px-6">
    <Text className="text-6xl mb-4">{emoji}</Text>
    <Text className="text-white text-xl font-bold text-center mb-2">{title}</Text>
    <Text className="text-white/60 text-sm text-center leading-5 mb-6">{description}</Text>
    {actionLabel && onAction && (
      <Button variant="primary" size="md" onPress={onAction}>
        {actionLabel}
      </Button>
    )}
  </View>
);

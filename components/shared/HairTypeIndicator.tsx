import React from 'react';
import { View, Text } from 'react-native';

interface HairAttribute {
  label: string;
  value: string;
  emoji: string;
}

interface HairTypeIndicatorProps {
  curlPattern?: string | null;
  density?: string | null;
  porosity?: string | null;
  strandThickness?: string | null;
  compact?: boolean;
}

function formatCurlPattern(value?: string | null): string {
  if (!value) return '—';
  return value.replace('TYPE_', 'Type ').replace('_', '');
}

function formatEnum(value?: string | null): string {
  if (!value) return '—';
  return value.charAt(0) + value.slice(1).toLowerCase();
}

const ATTRIBUTE_EMOJIS: Record<string, string> = {
  curlPattern: '🌀',
  density: '🌿',
  porosity: '💧',
  strandThickness: '〰️',
};

export const HairTypeIndicator = ({
  curlPattern,
  density,
  porosity,
  strandThickness,
  compact = false,
}: HairTypeIndicatorProps) => {
  const attributes: HairAttribute[] = [
    { label: 'Curl', value: formatCurlPattern(curlPattern), emoji: ATTRIBUTE_EMOJIS.curlPattern },
    { label: 'Density', value: formatEnum(density), emoji: ATTRIBUTE_EMOJIS.density },
    { label: 'Porosity', value: formatEnum(porosity), emoji: ATTRIBUTE_EMOJIS.porosity },
    { label: 'Strand', value: formatEnum(strandThickness), emoji: ATTRIBUTE_EMOJIS.strandThickness },
  ];

  if (compact) {
    return (
      <View className="flex-row flex-wrap gap-2">
        {attributes.map((attr) => (
          <View
            key={attr.label}
            className="flex-row items-center bg-hair-gold/10 border border-hair-gold/20 rounded-full px-3 py-1"
          >
            <Text className="text-sm mr-1">{attr.emoji}</Text>
            <Text className="text-hair-gold text-xs font-semibold">{attr.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-row gap-3">
      {attributes.map((attr) => (
        <View key={attr.label} className="flex-1 items-center bg-hair-bg-dark rounded-xl p-3 border border-hair-gold/10">
          <Text className="text-2xl mb-1">{attr.emoji}</Text>
          <Text className="text-hair-gold text-xs font-bold mb-0.5">{attr.value}</Text>
          <Text className="text-white/50 text-xs">{attr.label}</Text>
        </View>
      ))}
    </View>
  );
};

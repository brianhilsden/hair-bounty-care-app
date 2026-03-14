import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { AGE_GROUPS } from '../../constants/hairTypes';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useState } from 'react';

export default function AgeGroupScreen() {
  const router = useRouter();
  const { ageGroup, setAgeGroup, isEditMode } = useOnboardingStore();
  const [selected, setSelected] = useState(ageGroup);

  const handleContinue = () => {
    if (selected) {
      setAgeGroup(selected);
      router.push('/(onboarding)/gender');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cancel button in edit mode */}
        {isEditMode && (
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/profile')}
            className="self-start mb-4 flex-row items-center"
          >
            <Text className="text-hair-gold text-base font-semibold">← Cancel</Text>
          </TouchableOpacity>
        )}

        {/* Progress */}
        <View className="mb-8">
          <Text className="text-white/60 text-sm mb-2">Step 1 of 5</Text>
          <View className="h-2 bg-hair-bg-light rounded-full overflow-hidden">
            <View className="h-full bg-hair-gold w-1/5" />
          </View>
        </View>

        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-white mb-3">
            What's your age group?
          </Text>
          <Text className="text-white/70 text-lg">
            This helps us provide age-appropriate hair care recommendations
          </Text>
        </View>

        {/* Age Group Cards */}
        <View className="gap-4 mb-8">
          {AGE_GROUPS.map((group) => (
            <TouchableOpacity
              key={group.value}
              onPress={() => setSelected(group.value)}
              className={`
                p-6 rounded-2xl border-2 flex-row items-center
                ${selected === group.value
                  ? 'border-hair-gold bg-hair-gold/10'
                  : 'border-hair-gold/20 bg-hair-bg-dark'}
              `}
            >
              <View className="w-16 h-16 rounded-full bg-hair-gold/20 items-center justify-center mr-4">
                <Text className="text-4xl">{group.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-1">
                  {group.label}
                </Text>
                <Text className="text-white/60 text-base">
                  {group.subtitle}
                </Text>
              </View>
              {selected === group.value && (
                <View className="w-6 h-6 rounded-full bg-hair-gold items-center justify-center">
                  <Text className="text-white font-bold">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleContinue}
          disabled={!selected}
        >
          Continue
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

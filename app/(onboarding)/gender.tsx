import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { GENDERS } from '../../constants/hairTypes';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useState } from 'react';

export default function GenderScreen() {
  const router = useRouter();
  const { gender, setGender } = useOnboardingStore();
  const [selected, setSelected] = useState(gender);

  const handleContinue = () => {
    if (selected) {
      setGender(selected);
      router.push('/(onboarding)/hair-photo');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View className="mb-8">
          <Text className="text-white/60 text-sm mb-2">Step 2 of 5</Text>
          <View className="h-2 bg-hair-bg-light rounded-full overflow-hidden">
            <View className="h-full bg-hair-gold w-2/5" />
          </View>
        </View>

        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-white mb-3">
            What's your gender?
          </Text>
          <Text className="text-white/70 text-lg">
            This helps personalize your experience
          </Text>
        </View>

        {/* Gender Cards */}
        <View className="gap-4 mb-8">
          {GENDERS.map((genderOption) => (
            <TouchableOpacity
              key={genderOption.value}
              onPress={() => setSelected(genderOption.value)}
              className={`
                p-6 rounded-2xl border-2 flex-row items-center justify-between
                ${selected === genderOption.value
                  ? 'border-hair-gold bg-hair-gold/10'
                  : 'border-hair-gold/20 bg-hair-bg-dark'}
              `}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-14 h-14 rounded-full bg-hair-gold/20 items-center justify-center mr-4">
                  <Text className="text-3xl">{genderOption.emoji}</Text>
                </View>
                <Text className="text-white text-xl font-semibold">
                  {genderOption.label}
                </Text>
              </View>
              {selected === genderOption.value && (
                <View className="w-6 h-6 rounded-full bg-hair-gold items-center justify-center">
                  <Text className="text-white font-bold">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <View className="gap-3">
          <Button
            variant="primary"
            size="lg"
            onPress={handleContinue}
            disabled={!selected}
          >
            Continue
          </Button>
          <Button
            variant="ghost"
            size="md"
            onPress={() => router.back()}
          >
            Back
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

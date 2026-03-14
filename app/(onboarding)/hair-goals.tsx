import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { HAIR_GOALS } from "../../constants/hairTypes";
import { useOnboardingStore } from "../../store/onboardingStore";
import { useAuthStore } from "../../store/authStore";
import { profileApi } from "../../lib/api/profile";

export default function HairGoalsScreen() {
  const router = useRouter();
  const onboardingData = useOnboardingStore();
  const { user } = useAuthStore();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    onboardingData.goals,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleGoal = (value: string) => {
    setSelectedGoals((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value],
    );
  };

  const handleComplete = async () => {
    if (selectedGoals.length === 0) {
      Alert.alert(
        "Select Goals",
        "Please select at least one hair goal to continue",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload hair photo if one was taken
      let hairPhotoUrl: string | undefined;
      if (onboardingData.hairPhotoUri) {
        const uploadResult = await profileApi.uploadHairPhoto(
          onboardingData.hairPhotoUri,
        );
        // Ensure successful upload and extract URL from data
        if (uploadResult.success && uploadResult.data) {
          hairPhotoUrl = uploadResult.data.url;
          console.log("Hair photo uploaded successfully:", hairPhotoUrl);
        } else {
          console.error(
            "Hair photo upload failed or returned no data:",
            uploadResult,
          );
        }
      }

      const profileData = {
        ageGroup: onboardingData.ageGroup || undefined,
        gender: onboardingData.gender || undefined,
        hairPhotoUrl,
        curlPattern: onboardingData.curlPattern || undefined,
        density: onboardingData.density || undefined,
        porosity: onboardingData.porosity || undefined,
        strandThickness: onboardingData.strandThickness || undefined,
        scalpType: onboardingData.scalpType || undefined,
        goals: selectedGoals,
      };

      // 2. Create or Update hair profile
      if (user?.isOnboarded) {
        await profileApi.updateProfile(profileData);
      } else {
        await profileApi.createProfile(profileData);
      }

      // 3. Reset onboarding store
      onboardingData.reset();

      // 4. Navigate — back to profile if editing, otherwise home
      router.replace(onboardingData.isEditMode ? "/(tabs)/profile" : "/(tabs)/home");
    } catch (error: any) {
      Alert.alert(
        user?.isOnboarded ? "Profile Update Failed" : "Profile Creation Failed",
        error.response?.data?.message ||
          "Failed to save profile. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
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
          <Text className="text-white/60 text-sm mb-2">Step 5 of 5</Text>
          <View className="h-2 bg-hair-bg-light rounded-full overflow-hidden">
            <View className="h-full bg-hair-gold w-full" />
          </View>
        </View>

        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-white mb-3">
            What are your hair goals?
          </Text>
          <Text className="text-white/70 text-lg">
            Select all that apply. We'll create a personalized plan for you.
          </Text>
        </View>

        {/* Goals Grid */}
        <View className="gap-3 mb-8">
          {HAIR_GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.value);

            return (
              <TouchableOpacity
                key={goal.value}
                onPress={() => toggleGoal(goal.value)}
                className={`
                  p-5 rounded-xl border-2
                  ${
                    isSelected
                      ? "border-hair-gold bg-hair-gold/10"
                      : "border-hair-gold/20 bg-hair-bg-dark"
                  }
                `}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center">
                    {goal.emoji && (
                      <Text className="text-2xl mr-3">{goal.emoji}</Text>
                    )}
                    <View className="flex-1">
                      <Text className="text-white text-lg font-semibold mb-1">
                        {goal.label}
                      </Text>
                      <Text className="text-white/60 text-sm">
                        {goal.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-hair-gold items-center justify-center ml-3">
                      <Text className="text-white font-bold text-sm">✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Count */}
        {selectedGoals.length > 0 && (
          <View className="mb-6 p-4 bg-hair-gold/10 rounded-xl border border-hair-gold/30">
            <Text className="text-white/80 text-center text-sm">
              {selectedGoals.length}{" "}
              {selectedGoals.length === 1 ? "goal" : "goals"} selected
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View className="gap-3">
          <Button
            variant="primary"
            size="lg"
            onPress={handleComplete}
            disabled={selectedGoals.length === 0 || isSubmitting}
          >
            {isSubmitting
              ? user?.isOnboarded
                ? "Updating Profile..."
                : "Creating Your Profile..."
              : user?.isOnboarded
                ? "Update Profile"
                : "Complete Onboarding"}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onPress={handleBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

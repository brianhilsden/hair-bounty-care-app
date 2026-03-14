import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import {
  CURL_PATTERNS,
  HAIR_DENSITY,
  POROSITY,
  STRAND_THICKNESS,
  SCALP_TYPES,
} from "../../constants/hairTypes";
import { useOnboardingStore } from "../../store/onboardingStore";

export default function HairQuizScreen() {
  const router = useRouter();
  const { setHairQuiz } = useOnboardingStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    curlPattern: "",
    density: "",
    porosity: "",
    strandThickness: "",
    scalpType: "",
  });

  const questions = [
    {
      title: "What's your curl pattern?",
      subtitle: "Choose the option that best matches your natural hair",
      options: CURL_PATTERNS,
      key: "curlPattern",
    },
    {
      title: "What's your hair density?",
      subtitle: "How thick is your hair overall?",
      options: HAIR_DENSITY,
      key: "density",
    },
    {
      title: "What's your hair porosity?",
      subtitle: "How well does your hair absorb moisture?",
      options: POROSITY,
      key: "porosity",
    },
    {
      title: "What's your strand thickness?",
      subtitle: "How thick is each individual strand?",
      options: STRAND_THICKNESS,
      key: "strandThickness",
    },
    {
      title: "What's your scalp type?",
      subtitle: "How would you describe your scalp?",
      options: SCALP_TYPES,
      key: "scalpType",
    },
  ];

  const currentQuestion = questions[step];
  const currentAnswer = answers[currentQuestion.key as keyof typeof answers];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }));
  };

  const handleContinue = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setHairQuiz(answers);
      router.push("/(onboarding)/hair-goals");
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const progress = ((step + 1) / questions.length) * 0.2 + 0.6; // 60-80%

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View className="mb-8">
          <Text className="text-white/60 text-sm mb-2">
            Step 4 of 5 • Question {step + 1}/{questions.length}
          </Text>
          <View className="h-2 bg-hair-bg-light rounded-full overflow-hidden">
            <View
              className="h-full bg-hair-gold"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
        </View>

        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-white mb-2">
            {currentQuestion.title}
          </Text>
          <Text className="text-white/70 text-base">
            {currentQuestion.subtitle}
          </Text>
        </View>

        {/* Options */}
        <View className="gap-3 mb-8">
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleSelect(option.value)}
              className={`
                p-5 rounded-xl border-2
                ${
                  currentAnswer === option.value
                    ? "border-hair-gold bg-hair-gold/10"
                    : "border-hair-gold/20 bg-hair-bg-dark"
                }
              `}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                  {"emoji" in option && option.emoji && (
                    <Text className="text-2xl mr-3">
                      {(option as any).emoji}
                    </Text>
                  )}
                  <View className="flex-1">
                    <Text className="text-white text-lg font-semibold mb-1">
                      {option.label}
                    </Text>
                    <Text className="text-white/60 text-sm">
                      {option.description}
                    </Text>
                  </View>
                </View>
                {currentAnswer === option.value && (
                  <View className="w-6 h-6 rounded-full bg-hair-gold items-center justify-center ml-3">
                    <Text className="text-white font-bold text-sm">✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <View className="gap-3">
          <Button
            variant="primary"
            size="lg"
            onPress={handleContinue}
            disabled={!currentAnswer}
          >
            {step < questions.length - 1 ? "Next Question" : "Continue"}
          </Button>
          <Button variant="ghost" size="md" onPress={handleBack}>
            Back
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useRef, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import {
  CURL_PATTERNS,
  HAIR_DENSITY,
  POROSITY,
  STRAND_THICKNESS,
  SCALP_TYPES,
} from "../../constants/hairTypes";
import { useOnboardingStore } from "../../store/onboardingStore";

const NOT_SURE_VALUE = "__not_sure__";

const NOT_SURE_OPTION = {
  value: NOT_SURE_VALUE,
  label: "I'm not sure",
  description: "Skip this — we'll use general recommendations",
  emoji: "🤷",
};

const CURL_CATEGORIES = [
  {
    key: "Straight",
    label: "Straight",
    emoji: "〰️",
    description: "No wave or curl, falls flat naturally",
    subtypes: CURL_PATTERNS.filter((p) => p.category === "Straight"),
  },
  {
    key: "Wavy",
    label: "Wavy",
    emoji: "🌊",
    description: "Loose S-shaped waves, not fully curly",
    subtypes: CURL_PATTERNS.filter((p) => p.category === "Wavy"),
  },
  {
    key: "Curly",
    label: "Curly",
    emoji: "🌀",
    description: "Defined spirals and ringlets",
    subtypes: CURL_PATTERNS.filter((p) => p.category === "Curly"),
  },
  {
    key: "Coily",
    label: "Coily",
    emoji: "🍥",
    description: "Tight coils, Z-patterns, high shrinkage",
    subtypes: CURL_PATTERNS.filter((p) => p.category === "Coily"),
  },
];

const SCREEN_WIDTH = Dimensions.get("window").width;

function useSlideAnimation() {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animate = useCallback((direction: "forward" | "back", onMidpoint: () => void) => {
    const outX = direction === "forward" ? -SCREEN_WIDTH : SCREEN_WIDTH;
    const inX = direction === "forward" ? SCREEN_WIDTH : -SCREEN_WIDTH;

    Animated.parallel([
      Animated.timing(translateX, { toValue: outX, duration: 180, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      translateX.setValue(inX);
      onMidpoint();
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [translateX, opacity]);

  return { translateX, opacity, animate };
}

export default function HairQuizScreen() {
  const router = useRouter();
  const { setHairQuiz } = useOnboardingStore();
  const [step, setStep] = useState(0);
  // null = unanswered, NOT_SURE_VALUE = skipped, anything else = real answer
  const [answers, setAnswers] = useState<Record<string, string | null>>({
    curlPattern: null,
    density: null,
    porosity: null,
    strandThickness: null,
    scalpType: null,
  });
  // Two-step curl pattern selection
  const [selectedCurlCategory, setSelectedCurlCategory] = useState<string | null>(null);
  const { translateX, opacity, animate } = useSlideAnimation();
  const progressAnim = useRef(new Animated.Value(0.6 * 100)).current;

  const questions = [
    {
      title: "What's your curl pattern?",
      subtitle: "Choose the category that best matches your natural hair",
      hint: "Not sure? Pick the closest match or skip — you can update this later.",
      key: "curlPattern",
      isCurlPattern: true,
      options: [] as any[],
    },
    {
      title: "What's your hair density?",
      subtitle: "How thick is your hair overall?",
      hint: "Look in the mirror with your hair down in natural light.",
      options: HAIR_DENSITY,
      key: "density",
      isCurlPattern: false,
    },
    {
      title: "What's your hair porosity?",
      subtitle: "How well does your hair absorb moisture?",
      hint: "Drop a strand in water — sinks fast = high porosity, floats = low porosity.",
      options: POROSITY,
      key: "porosity",
      isCurlPattern: false,
    },
    {
      title: "What's your strand thickness?",
      subtitle: "How thick is each individual strand?",
      hint: "Hold a strand between two fingers — fine strands are barely felt, thick strands feel wiry.",
      options: STRAND_THICKNESS,
      key: "strandThickness",
      isCurlPattern: false,
    },
    {
      title: "What's your scalp type?",
      subtitle: "How would you describe your scalp?",
      hint: "Think about how your scalp feels 2 days after washing.",
      options: SCALP_TYPES,
      key: "scalpType",
      isCurlPattern: false,
    },
  ];

  const currentQuestion = questions[step];
  const currentAnswer = answers[currentQuestion.key];
  const hasAnswered = currentAnswer !== null;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
  };

  const animateProgress = useCallback((nextStep: number) => {
    const nextProgress = ((nextStep + 1) / questions.length) * 0.2 + 0.6;
    Animated.timing(progressAnim, {
      toValue: nextProgress * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, questions.length]);

  const handleCurlCategorySelect = (categoryKey: string) => {
    animate("forward", () => {
      setSelectedCurlCategory(categoryKey);
      setAnswers((prev) => ({ ...prev, curlPattern: null }));
    });
  };

  const handleContinue = () => {
    if (step < questions.length - 1) {
      const nextStep = step + 1;
      animate("forward", () => {
        setStep(nextStep);
        if (step === 0) setSelectedCurlCategory(null);
      });
      animateProgress(nextStep);
    } else {
      const quizData: Record<string, string> = {};
      Object.entries(answers).forEach(([key, val]) => {
        if (val && val !== NOT_SURE_VALUE) quizData[key] = val;
      });
      setHairQuiz(quizData);
      router.push("/(onboarding)/hair-goals");
    }
  };

  const handleBack = () => {
    if (currentQuestion.isCurlPattern && selectedCurlCategory) {
      animate("back", () => {
        setSelectedCurlCategory(null);
        setAnswers((prev) => ({ ...prev, curlPattern: null }));
      });
    } else if (step > 0) {
      const prevStep = step - 1;
      animate("back", () => setStep(prevStep));
      animateProgress(prevStep);
    } else {
      router.back();
    }
  };

  const progress = ((step + 1) / questions.length) * 0.2 + 0.6;

  const activeCategory = selectedCurlCategory
    ? CURL_CATEGORIES.find((c) => c.key === selectedCurlCategory)
    : null;

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      {/* Progress bar — outside animated view so it doesn't slide */}
      <View className="px-6 pt-5 mb-2">
        <Text className="text-white/60 text-sm mb-2">
          Step 4 of 5 • Question {step + 1}/{questions.length}
        </Text>
        <View className="h-2 bg-hair-bg-light rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-hair-gold rounded-full"
            style={{ width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ transform: [{ translateX }], opacity }}
          className="px-6 pt-6"
        >

        {/* Curl Pattern — Two-step */}
        {currentQuestion.isCurlPattern ? (
          <>
            <View className="mb-6">
              <Text className="text-3xl font-bold text-white mb-2">
                {activeCategory
                  ? `${activeCategory.emoji} ${activeCategory.label} hair`
                  : currentQuestion.title}
              </Text>
              <Text className="text-white/70 text-base mb-3">
                {activeCategory
                  ? "Now pick your specific sub-type"
                  : currentQuestion.subtitle}
              </Text>
              <View className="bg-hair-bg-dark rounded-xl px-4 py-3 border border-hair-gold/20">
                <Text className="text-white/50 text-sm">
                  💡 {currentQuestion.hint}
                </Text>
              </View>
            </View>

            {!selectedCurlCategory ? (
              /* Step 1 — Category selection */
              <View className="gap-4 mb-6">
                {CURL_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => handleCurlCategorySelect(cat.key)}
                    className="p-5 rounded-xl border-2 border-hair-gold/20 bg-hair-bg-dark flex-row items-center"
                  >
                    <View className="w-16 h-16 rounded-full bg-hair-gold/20 items-center justify-center mr-4">
                      <Text className="text-4xl">{cat.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-xl font-bold mb-1">
                        {cat.label}
                      </Text>
                      <Text className="text-white/60 text-sm">
                        {cat.description}
                      </Text>
                    </View>
                    <Text className="text-hair-gold text-lg">›</Text>
                  </TouchableOpacity>
                ))}
                {/* Not sure option at category level */}
                <TouchableOpacity
                  onPress={() => {
                    setAnswers((prev) => ({ ...prev, curlPattern: NOT_SURE_VALUE }));
                    setSelectedCurlCategory("__skip__");
                  }}
                  className={`p-5 rounded-xl border-2 ${currentAnswer === NOT_SURE_VALUE ? "border-white/40 bg-white/10" : "border-hair-gold/20 bg-hair-bg-dark"}`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">🤷</Text>
                    <View className="flex-1">
                      <Text className="text-white/60 text-lg font-semibold mb-1">
                        I'm not sure
                      </Text>
                      <Text className="text-white/40 text-sm">
                        Skip this — we'll use general recommendations
                      </Text>
                    </View>
                    {currentAnswer === NOT_SURE_VALUE && (
                      <View className="w-6 h-6 rounded-full bg-white/40 items-center justify-center ml-3">
                        <Text className="text-white font-bold text-sm">✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ) : selectedCurlCategory === "__skip__" ? (
              /* Skipped state */
              <View className="mb-6 p-5 rounded-xl border-2 border-white/40 bg-white/10">
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">🤷</Text>
                  <View className="flex-1">
                    <Text className="text-white/60 text-lg font-semibold">
                      I'm not sure
                    </Text>
                    <TouchableOpacity onPress={() => { setSelectedCurlCategory(null); setAnswers((prev) => ({ ...prev, curlPattern: null })); }}>
                      <Text className="text-hair-gold text-sm mt-1">← Change answer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              /* Step 2 — Subtype selection */
              <View className="gap-3 mb-6">
                {activeCategory?.subtypes.map((sub) => {
                  const isSelected = currentAnswer === sub.value;
                  return (
                    <TouchableOpacity
                      key={sub.value}
                      onPress={() => handleSelect(sub.value)}
                      className={`p-5 rounded-xl border-2 ${isSelected ? "border-hair-gold bg-hair-gold/10" : "border-hair-gold/20 bg-hair-bg-dark"}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-white text-lg font-semibold mb-1">
                            {sub.label}
                          </Text>
                          <Text className="text-white/60 text-sm">
                            {sub.description}
                          </Text>
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
            )}
          </>
        ) : (
          /* All other questions — standard list */
          <>
            <View className="mb-6">
              <Text className="text-3xl font-bold text-white mb-2">
                {currentQuestion.title}
              </Text>
              <Text className="text-white/70 text-base mb-3">
                {currentQuestion.subtitle}
              </Text>
              <View className="bg-hair-bg-dark rounded-xl px-4 py-3 border border-hair-gold/20">
                <Text className="text-white/50 text-sm">
                  💡 {currentQuestion.hint}
                </Text>
              </View>
            </View>

            <View className="gap-3 mb-6">
              {[...currentQuestion.options, NOT_SURE_OPTION].map((option) => {
                const isSelected = currentAnswer === option.value;
                const isNotSure = option.value === NOT_SURE_VALUE;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    className={`p-5 rounded-xl border-2 ${
                      isSelected
                        ? isNotSure
                          ? "border-white/40 bg-white/10"
                          : "border-hair-gold bg-hair-gold/10"
                        : "border-hair-gold/20 bg-hair-bg-dark"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center">
                        {"emoji" in option && option.emoji && (
                          <Text className="text-2xl mr-3">{(option as any).emoji}</Text>
                        )}
                        <View className="flex-1">
                          <Text className={`text-lg font-semibold mb-1 ${isNotSure ? "text-white/60" : "text-white"}`}>
                            {option.label}
                          </Text>
                          <Text className="text-white/50 text-sm">
                            {option.description}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <View className={`w-6 h-6 rounded-full items-center justify-center ml-3 ${isNotSure ? "bg-white/40" : "bg-hair-gold"}`}>
                          <Text className="text-white font-bold text-sm">✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Buttons */}
        <View className="gap-3">
          <Button
            variant="primary"
            size="lg"
            onPress={handleContinue}
            disabled={!hasAnswered}
          >
            {step < questions.length - 1 ? "Next Question" : "Continue"}
          </Button>
          <Button variant="ghost" size="md" onPress={handleBack}>
            Back
          </Button>
        </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

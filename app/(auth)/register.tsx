import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  registerSchema,
  type RegisterInput,
} from "../../lib/validations/auth.schema";
import { authApi } from "../../lib/api/auth";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../lib/api";

export default function Register() {
  const router = useRouter();
  const { setUser, setSubscription, setTokens } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      referredBy: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (response) => {
      const { user, subscription, tokens } = response.data!;

      // Store tokens
      await setTokens(tokens.accessToken, tokens.refreshToken);

      // Set user and subscription in store
      setUser(user);
      if (subscription) {
        setSubscription(subscription);
      }

      // Show success message
      // Show success message
      if (Platform.OS === "web") {
        if (
          window.confirm(
            "Welcome to Hair Bounty Care! 🎉\n\nYour 7-day free trial has started. Check your email to verify your account.",
          )
        ) {
          router.replace("/(onboarding)/age-group");
        } else {
          // If they cancel, still redirect? Or stay? staying allows them to see they are logged in maybe?
          // Safest is to just redirect if they click OK.
          router.replace("/(onboarding)/age-group");
        }
      } else {
        Alert.alert(
          "Welcome to Hair Bounty Care! 🎉",
          "Your 7-day free trial has started. Check your email to verify your account.",
          [
            {
              text: "Get Started",
              onPress: () => router.replace("/(onboarding)/age-group"),
            },
          ],
        );
      }
    },
    onError: (error) => {
      Alert.alert("Registration Failed", getErrorMessage(error));
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1 px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-white mb-2">
            Create Account
          </Text>
          <Text className="text-white/70 text-lg">
            Start your hair care journey today
          </Text>
        </View>

        {/* Form */}
        <View className="mb-4">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="First Name"
                placeholder="John"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                error={errors.firstName?.message}
              />
            )}
          />
        </View>

        <View className="mb-4">
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Last Name"
                placeholder="Doe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                error={errors.lastName?.message}
              />
            )}
          />
        </View>

        <View className="mb-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="your@email.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email?.message}
              />
            )}
          />
        </View>

        <View className="mb-4">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Create a strong password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isPassword
                autoCapitalize="none"
                error={errors.password?.message}
                helperText="Must be 8+ characters with uppercase, lowercase, and numbers"
              />
            )}
          />
        </View>

        <View className="mb-6">
          <Controller
            control={control}
            name="referredBy"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Referral Code (Optional)"
                placeholder="Enter code if you have one"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="characters"
                error={errors.referredBy?.message}
              />
            )}
          />
        </View>

        {/* Submit Button */}
        <View className="mb-6">
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            isLoading={registerMutation.isPending}
          >
            Start Free Trial
          </Button>
        </View>

        {/* Terms */}
        <Text className="text-white/50 text-sm text-center mb-6">
          By continuing, you agree to our{" "}
          <Text className="text-hair-gold">Terms of Service</Text> and{" "}
          <Text className="text-hair-gold">Privacy Policy</Text>
        </Text>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-white/20" />
          <Text className="text-white/50 px-4">OR</Text>
          <View className="flex-1 h-px bg-white/20" />
        </View>

        {/* Login Link */}
        <View className="flex-row items-center justify-center">
          <Text className="text-white/70 text-base">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="text-hair-gold font-semibold text-base">
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

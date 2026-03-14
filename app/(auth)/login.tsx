import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { loginSchema, type LoginInput } from '../../lib/validations/auth.schema';
import { authApi } from '../../lib/api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../lib/api';

export default function Login() {
  const router = useRouter();
  const { setUser, setSubscription, setTokens } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (response) => {
      const { user, subscription, tokens } = response.data!;

      // Store tokens
      await setTokens(tokens.accessToken, tokens.refreshToken);

      // Set user and subscription in store
      setUser(user);
      if (subscription) {
        setSubscription(subscription);
      }

      // Navigate to home
      router.replace('/(tabs)/home');
    },
    onError: (error) => {
      Alert.alert('Login Failed', getErrorMessage(error));
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
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
            Welcome Back!
          </Text>
          <Text className="text-white/70 text-lg">
            Login to continue your hair care journey
          </Text>
        </View>

        {/* Form */}
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

        <View className="mb-2">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isPassword
                autoCapitalize="none"
                autoComplete="password"
                error={errors.password?.message}
              />
            )}
          />
        </View>

        <View className="mb-6">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            className="self-end"
          >
            <Text className="text-hair-gold text-sm font-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <View className="mb-6">
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            isLoading={loginMutation.isPending}
          >
            Login
          </Button>
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-white/20" />
          <Text className="text-white/50 px-4">OR</Text>
          <View className="flex-1 h-px bg-white/20" />
        </View>

        {/* Sign Up Link */}
        <View className="flex-row items-center justify-center">
          <Text className="text-white/70 text-base">
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-hair-gold font-semibold text-base">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

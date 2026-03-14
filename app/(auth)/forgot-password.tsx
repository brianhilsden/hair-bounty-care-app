import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../../lib/validations/auth.schema';
import { authApi } from '../../lib/api/auth';
import { getErrorMessage } from '../../lib/api';

export default function ForgotPassword() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (response) => {
      Alert.alert(
        'Check Your Email',
        response.message || 'If the email exists, a password reset link has been sent.',
        [{ text: 'Back to Login', onPress: () => router.back() }]
      );
    },
    onError: (error) => {
      Alert.alert('Error', getErrorMessage(error));
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1 px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <View className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            className="self-start"
          >
            ← Back
          </Button>
        </View>

        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-white mb-2">
            Forgot Password?
          </Text>
          <Text className="text-white/70 text-lg">
            No worries! Enter your email and we'll send you reset instructions.
          </Text>
        </View>

        {/* Form */}
        <View className="mb-6">
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

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          isLoading={forgotPasswordMutation.isPending}
        >
          Send Reset Link
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

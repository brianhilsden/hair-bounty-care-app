import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1 px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Brand Section */}
        <View className="items-center mb-12">
          <Badge variant="default" size="md" className="mb-6">
            Grow. Glow. Flourish.
          </Badge>

          <Text className="text-5xl font-bold text-white text-center mb-3">
            Hair{' '}
            <Text className="text-hair-gold">Bounty</Text>
            {' '}Care
          </Text>

          <Text className="text-white/70 text-lg text-center">
            Your Personal Hair Care Companion
          </Text>
        </View>

        {/* Feature Highlights */}
        <View className="mb-12">
          <FeatureItem
            emoji="🎯"
            title="Personalized Guidance"
            description="Get tailored hair care recommendations based on your unique hair type and goals"
          />

          <View className="h-6" />

          <FeatureItem
            emoji="📸"
            title="Track Your Journey"
            description="Document your progress with photos and watch your hair transformation"
          />

          <View className="h-6" />

          <FeatureItem
            emoji="👥"
            title="Join the Community"
            description="Connect with thousands sharing their hair care experiences"
          />

          <View className="h-6" />

          <FeatureItem
            emoji="🌿"
            title="Sustainable Choices"
            description="Discover eco-friendly products and practices for healthy hair and planet"
          />
        </View>

        {/* CTA Buttons */}
        <View className="mb-4">
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push('/(auth)/register')}
          >
            Get Started Free
          </Button>
        </View>

        <View className="mb-8">
          <Button
            variant="outline"
            size="lg"
            onPress={() => router.push('/(auth)/login')}
          >
            I Already Have an Account
          </Button>
        </View>

        {/* Trial Info */}
        <View className="items-center">
          <Text className="text-white/50 text-sm text-center">
            🎁 Start with a <Text className="text-hair-gold font-semibold">7-day free trial</Text>
            {'\n'}
            No credit card required
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Feature Item Component
interface FeatureItemProps {
  emoji: string;
  title: string;
  description: string;
}

function FeatureItem({ emoji, title, description }: FeatureItemProps) {
  return (
    <View className="flex-row items-start">
      <View className="w-12 h-12 rounded-full bg-hair-gold/20 items-center justify-center mr-4">
        <Text className="text-2xl">{emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-white text-lg font-semibold mb-1">
          {title}
        </Text>
        <Text className="text-white/70 text-base">
          {description}
        </Text>
      </View>
    </View>
  );
}

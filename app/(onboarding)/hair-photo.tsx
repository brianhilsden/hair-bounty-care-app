import { View, Text, ScrollView, Alert, Image as RNImage } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useOnboardingStore } from '../../store/onboardingStore';

export default function HairPhotoScreen() {
  const router = useRouter();
  const { hairPhotoUri, setHairPhoto } = useOnboardingStore();
  const [imageUri, setImageUri] = useState<string | null>(hairPhotoUri);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to take photos of your hair'
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (imageUri) {
      setHairPhoto(imageUri);
      router.push('/(onboarding)/hair-quiz');
    }
  };

  const handleSkip = () => {
    router.push('/(onboarding)/hair-quiz');
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
          <Text className="text-white/60 text-sm mb-2">Step 3 of 5</Text>
          <View className="h-2 bg-hair-bg-light rounded-full overflow-hidden">
            <View className="h-full bg-hair-gold w-3/5" />
          </View>
        </View>

        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-white mb-3">
            Take a hair photo
          </Text>
          <Text className="text-white/70 text-lg">
            This helps us understand your current hair condition
          </Text>
        </View>

        {/* Photo Preview or Placeholder */}
        <View className="mb-6">
          {imageUri ? (
            <View className="rounded-2xl overflow-hidden border-2 border-hair-gold">
              <RNImage
                source={{ uri: imageUri }}
                className="w-full h-80"
                resizeMode="cover"
              />
            </View>
          ) : (
            <Card variant="outline" className="h-80 items-center justify-center">
              <CardContent>
                <View className="items-center">
                  <View className="w-24 h-24 rounded-full bg-hair-gold/20 items-center justify-center mb-4">
                    <Text className="text-5xl">📸</Text>
                  </View>
                  <Text className="text-white text-lg font-semibold mb-2">
                    No photo yet
                  </Text>
                  <Text className="text-white/60 text-center">
                    Take a clear photo showing your hairline
                  </Text>
                </View>
              </CardContent>
            </Card>
          )}
        </View>

        {/* Tips Card */}
        <Card variant="default" className="mb-6">
          <CardContent>
            <Text className="text-hair-gold font-bold text-base mb-3">
              📌 Photo Tips:
            </Text>
            <View className="gap-2">
              <Text className="text-white/80 text-sm">• Good lighting is important</Text>
              <Text className="text-white/80 text-sm">• Show your hairline clearly</Text>
              <Text className="text-white/80 text-sm">• Face the camera directly</Text>
              <Text className="text-white/80 text-sm">• Remove any hats or accessories</Text>
            </View>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <View className="gap-3 mb-4">
          {imageUri ? (
            <>
              <Button variant="secondary" size="lg" onPress={pickImage}>
                Change Photo
              </Button>
              <Button variant="primary" size="lg" onPress={handleContinue}>
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" size="lg" onPress={takePhoto}>
                📷 Take Photo
              </Button>
              <Button variant="secondary" size="lg" onPress={pickImage}>
                🖼️ Choose from Gallery
              </Button>
            </>
          )}
          <Button variant="ghost" size="md" onPress={handleSkip}>
            Skip for now
          </Button>
        </View>

        {/* Back Button */}
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          ← Back
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

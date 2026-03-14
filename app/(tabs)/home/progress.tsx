import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { progressApi, ProgressPhoto } from "../../../lib/api/progress";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ProgressScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(
    null,
  );

  // Fetch progress photos
  const { data: photosData, isLoading: photosLoading } = useQuery({
    queryKey: ["progress", "photos"],
    queryFn: () => progressApi.getProgressPhotos({ limit: 100 }),
  });

  // Fetch growth stats
  const { data: statsData } = useQuery({
    queryKey: ["progress", "stats"],
    queryFn: progressApi.getGrowthStats,
  });

  // Fetch before/after comparison
  const { data: comparisonData } = useQuery({
    queryKey: ["progress", "comparison"],
    queryFn: progressApi.getBeforeAfterComparison,
  });

  // Fetch milestones
  const { data: milestonesData } = useQuery({
    queryKey: ["progress", "milestones"],
    queryFn: progressApi.getProgressMilestones,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({
      uri,
      length,
      notes,
    }: {
      uri: string;
      length?: number;
      notes?: string;
    }) => {
      const uploadResult = await progressApi.uploadProgressPhoto(uri);
      return progressApi.createProgressPhoto({
        photoUrl: uploadResult.data!.url,
        currentLength: length,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      Alert.alert("Success", "Progress photo uploaded successfully!");
    },
    onError: (error: any) => {
      Alert.alert(
        "Upload Failed",
        error.response?.data?.message || "Failed to upload photo",
      );
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["progress", "photos"] }),
      queryClient.invalidateQueries({ queryKey: ["progress", "stats"] }),
      queryClient.invalidateQueries({ queryKey: ["progress", "comparison"] }),
      queryClient.invalidateQueries({ queryKey: ["progress", "milestones"] }),
    ]);
    setRefreshing(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // For now, upload without length (can add a form later)
      uploadMutation.mutate({ uri: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to take progress photos",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadMutation.mutate({ uri: result.assets[0].uri });
    }
  };

  const photos = photosData?.data || [];
  const stats = statsData?.data;
  const comparison = comparisonData?.data;
  const milestones = milestonesData?.data || [];

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D2994A"
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-white mb-1">
            Progress Tracker 📸
          </Text>
          <Text className="text-white/70 text-base">
            Document your hair journey
          </Text>
        </View>

        {/* Growth Stats Card */}
        {stats && stats.totalPhotos > 0 && (
          <View className="px-6 mb-6">
            <Card
              variant="elevated"
              className="bg-gradient-to-br from-hair-gold/20 to-hair-gold/5"
            >
              <CardContent>
                <Text className="text-white text-lg font-bold mb-4">
                  Your Growth Stats
                </Text>
                <View className="gap-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white/70 text-base">
                      Total Growth
                    </Text>
                    <Text className="text-hair-gold text-2xl font-bold">
                      +{stats.totalGrowth} cm
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white/70 text-base">
                      Average/Month
                    </Text>
                    <Text className="text-white text-lg font-bold">
                      {stats.averageGrowthPerMonth.toFixed(1)} cm
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white/70 text-base">
                      Journey Duration
                    </Text>
                    <Text className="text-white text-lg font-bold">
                      {stats.journeyDays} days
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Before/After Comparison */}
        {comparison && (
          <View className="px-6 mb-6">
            <Text className="text-white text-xl font-bold mb-3">
              Before & After
            </Text>
            <Card variant="default">
              <CardContent>
                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1">
                    <Text className="text-white/60 text-sm mb-2 text-center">
                      Before
                    </Text>
                    <Image
                      source={{ uri: comparison.before.photoUrl }}
                      className="w-full h-48 rounded-xl"
                      resizeMode="cover"
                    />
                    <Text className="text-white/60 text-xs text-center mt-2">
                      {new Date(comparison.before.takenAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white/60 text-sm mb-2 text-center">
                      After
                    </Text>
                    <Image
                      source={{ uri: comparison.after.photoUrl }}
                      className="w-full h-48 rounded-xl"
                      resizeMode="cover"
                    />
                    <Text className="text-white/60 text-xs text-center mt-2">
                      {new Date(comparison.after.takenAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                {comparison.lengthChange !== null && (
                  <View className="bg-hair-gold/10 p-3 rounded-xl border border-hair-gold/30">
                    <Text className="text-hair-gold text-center text-base font-semibold">
                      +{comparison.lengthChange} cm growth in{" "}
                      {comparison.daysBetween} days
                    </Text>
                  </View>
                )}
              </CardContent>
            </Card>
          </View>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-white text-xl font-bold mb-3">
              Milestones 🏆
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {milestones.map((milestone, index) => (
                <View
                  key={index}
                  className="bg-hair-bg-dark px-4 py-3 rounded-xl border border-hair-gold/30"
                >
                  <Text className="text-2xl text-center mb-1">
                    {milestone.icon}
                  </Text>
                  <Text className="text-white text-sm font-semibold text-center">
                    {milestone.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upload Buttons */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              onPress={takePhoto}
              disabled={uploadMutation.isPending}
              className="flex-1"
            >
              📷 Take Photo
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onPress={pickImage}
              disabled={uploadMutation.isPending}
              className="flex-1"
            >
              🖼️ Choose Photo
            </Button>
          </View>
        </View>

        {/* Photo Timeline */}
        <View className="px-6 mb-6">
          <Text className="text-white text-xl font-bold mb-3">Timeline</Text>
          {photosLoading ? (
            <Card variant="default">
              <CardContent>
                <Text className="text-white/60 text-center">
                  Loading photos...
                </Text>
              </CardContent>
            </Card>
          ) : photos.length === 0 ? (
            <Card variant="outline">
              <CardContent>
                <View className="items-center py-6">
                  <Text className="text-5xl mb-3">📸</Text>
                  <Text className="text-white text-lg font-semibold mb-2">
                    Start Your Journey
                  </Text>
                  <Text className="text-white/60 text-sm text-center">
                    Take your first progress photo to track your hair growth
                  </Text>
                </View>
              </CardContent>
            </Card>
          ) : (
            <View className="gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} variant="default">
                  <CardContent>
                    <Image
                      source={{ uri: photo.photoUrl }}
                      className="w-full h-64 rounded-xl mb-3"
                      resizeMode="cover"
                    />
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-white text-base font-semibold">
                          {new Date(photo.takenAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                        {photo.currentLength && (
                          <Text className="text-white/60 text-sm">
                            Length: {photo.currentLength} cm
                          </Text>
                        )}
                      </View>
                      {photo.notes && (
                        <Badge variant="default" size="sm">
                          Has Notes
                        </Badge>
                      )}
                    </View>
                    {photo.notes && (
                      <Text className="text-white/70 text-sm mt-2">
                        {photo.notes}
                      </Text>
                    )}
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Motivational Message */}
        {photos.length > 0 && (
          <View className="px-6">
            <Card variant="default">
              <CardContent>
                <Text className="text-hair-gold text-center text-base font-semibold">
                  "Progress, not perfection. Every photo tells your story! 📸✨"
                </Text>
              </CardContent>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

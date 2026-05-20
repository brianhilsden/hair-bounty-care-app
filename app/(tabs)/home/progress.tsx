import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { BottomSheet } from "../../../components/ui/BottomSheet";
import { Skeleton } from "../../../components/ui/Skeleton";
import { progressApi, ProgressPhoto } from "../../../lib/api/progress";
import { useToast } from "../../../components/ui/Toast";
import { PhotoViewer } from "../../../components/progress/PhotoViewer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ProgressScreen() {
  const queryClient = useQueryClient();
  const { show: showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

  // Pending upload state — held until user confirms notes/length
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState("");
  const [uploadLength, setUploadLength] = useState("");
  const [uploadSheet, setUploadSheet] = useState(false);

  // Fetch progress photos
  const { data: photosData, isLoading: photosLoading } = useQuery({
    queryKey: ["progress", "photos"],
    queryFn: () => progressApi.getProgressPhotos({ limit: 100 }),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch growth stats
  const { data: statsData } = useQuery({
    queryKey: ["progress", "stats"],
    queryFn: progressApi.getGrowthStats,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch before/after comparison
  const { data: comparisonData } = useQuery({
    queryKey: ["progress", "comparison"],
    queryFn: progressApi.getBeforeAfterComparison,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch milestones
  const { data: milestonesData } = useQuery({
    queryKey: ["progress", "milestones"],
    queryFn: progressApi.getProgressMilestones,
    staleTime: 30 * 60 * 1000,
  });

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
      showToast("Progress photo saved! 📸", "success");
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || "Failed to upload photo",
        "error"
      );
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["progress", "photos"] }),
        queryClient.refetchQueries({ queryKey: ["progress", "stats"] }),
        queryClient.refetchQueries({ queryKey: ["progress", "comparison"] }),
        queryClient.refetchQueries({ queryKey: ["progress", "milestones"] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const openUploadSheet = (uri: string) => {
    setPendingUri(uri);
    setUploadNote("");
    setUploadLength("");
    setUploadSheet(true);
  };

  const handleConfirmUpload = () => {
    if (!pendingUri) return;
    setUploadSheet(false);
    const parsedLength = uploadLength.trim()
      ? parseFloat(uploadLength.trim())
      : undefined;
    uploadMutation.mutate({
      uri: pendingUri,
      notes: uploadNote.trim() || undefined,
      length: parsedLength && !isNaN(parsedLength) ? parsedLength : undefined,
    });
    setPendingUri(null);
    setUploadNote("");
    setUploadLength("");
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Photo library access is needed to choose a photo");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      openUploadSheet(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera permission is needed to take progress photos");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      openUploadSheet(result.assets[0].uri);
    }
  };

  const photos = photosData?.data || [];
  const stats = statsData?.data;
  const comparison = comparisonData?.data;
  const milestones = milestonesData?.data || [];

  return (
    <>
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

          {/* Upload Buttons */}
          <View className="px-6 mb-6">
            <View className="flex-row gap-3">
              <Button
                variant="primary"
                size="md"
                onPress={takePhoto}
                disabled={uploadMutation.isPending}
                className="flex-1"
              >
                {uploadMutation.isPending ? "Uploading..." : "📷 Take Photo"}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onPress={pickImage}
                disabled={uploadMutation.isPending}
                className="flex-1"
              >
                🖼️ Choose Photo
              </Button>
            </View>
          </View>

          {/* Growth Stats — empty prompt */}
          {stats && stats.totalPhotos === 0 && (
            <View className="px-6 mb-6">
              <View style={{ backgroundColor: 'rgba(210,153,74,0.08)', borderWidth: 1, borderColor: 'rgba(210,153,74,0.2)', borderRadius: 20, padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 36, marginBottom: 10 }}>📊</Text>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 6, textAlign: 'center' }}>
                  Your growth stats will appear here
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
                  Upload your first progress photo above to start tracking hair length, growth rate, and your journey timeline
                </Text>
              </View>
            </View>
          )}

          {/* Growth Stats Card */}
          {stats && stats.totalPhotos > 0 && (
            <View className="px-6 mb-6">
              <Card variant="elevated" className="bg-gradient-to-br from-hair-gold/20 to-hair-gold/5">
                <CardContent>
                  <Text className="text-white text-lg font-bold mb-4">
                    Your Growth Stats
                  </Text>
                  <View className="gap-3">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-white/70 text-base">Total Growth</Text>
                      <Text className="text-hair-gold text-2xl font-bold">
                        +{stats.totalGrowth} cm
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-white/70 text-base">Average/Month</Text>
                      <Text className="text-white text-lg font-bold">
                        {stats.averageGrowthPerMonth.toFixed(1)} cm
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-white/70 text-base">Journey Duration</Text>
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
                      <Text className="text-white/60 text-sm mb-2 text-center">Before</Text>
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
                      <Text className="text-white/60 text-sm mb-2 text-center">After</Text>
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
                        +{comparison.lengthChange} cm growth in {comparison.daysBetween} days
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
                    <Text className="text-2xl text-center mb-1">{milestone.icon}</Text>
                    <Text className="text-white text-sm font-semibold text-center">
                      {milestone.title}
                    </Text>
                    {milestone.date && (
                      <Text className="text-white/40 text-xs text-center mt-0.5">
                        {new Date(milestone.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Photo Timeline */}
          <View className="px-6 mb-6">
            <Text className="text-white text-xl font-bold mb-3">Timeline</Text>
            {photosLoading ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[0, 1, 2, 3].map((i) => {
                  const cellSize = (SCREEN_WIDTH - 48 - 8) / 2;
                  return <Skeleton key={i} height={cellSize} width={cellSize} rounded="lg" />;
                })}
              </View>
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
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {photos.map((photo) => {
                  const cellSize = (SCREEN_WIDTH - 48 - 8) / 2; // 2 cols, px-6 padding each side, 8 gap
                  return (
                    <TouchableOpacity
                      key={photo.id}
                      activeOpacity={0.85}
                      onPress={() => setSelectedPhoto(photo)}
                      style={{ width: cellSize, borderRadius: 16, overflow: 'hidden', backgroundColor: '#2A1F1A' }}
                    >
                      <Image
                        source={{ uri: photo.photoUrl }}
                        style={{ width: cellSize, height: cellSize }}
                        resizeMode="cover"
                      />
                      {/* Gradient overlay at bottom */}
                      <View style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        padding: 8,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                      }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
                          {new Date(photo.takenAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 4, marginTop: 2 }}>
                          {photo.currentLength && (
                            <Text style={{ color: '#D2994A', fontSize: 10 }}>📏 {photo.currentLength}cm</Text>
                          )}
                          {photo.notes && (
                            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>📝</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
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

      {/* Fullscreen photo viewer */}
      <PhotoViewer
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />

      {/* Upload details bottom sheet */}
      <BottomSheet
        visible={uploadSheet}
        onClose={() => {
          setUploadSheet(false);
          setPendingUri(null);
        }}
        title="📸 Save Progress Photo"
        snapHeight={420}
      >
        <View className="flex-1">
          {/* Photo preview */}
          {pendingUri && (
            <Image
              source={{ uri: pendingUri }}
              style={{ width: "100%", height: 120, borderRadius: 12, marginBottom: 16 }}
              resizeMode="cover"
            />
          )}

          {/* Hair length input */}
          <Text className="text-white/60 text-sm mb-1">
            Current hair length (cm) — optional
          </Text>
          <TextInput
            value={uploadLength}
            onChangeText={setUploadLength}
            placeholder="e.g. 12.5"
            placeholderTextColor="rgba(255,255,255,0.25)"
            keyboardType="decimal-pad"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderColor: "rgba(210,153,74,0.2)",
              borderRadius: 12,
              padding: 12,
              color: "#fff",
              fontSize: 14,
              marginBottom: 12,
            }}
          />

          {/* Notes input */}
          <Text className="text-white/60 text-sm mb-1">
            Notes — optional
          </Text>
          <TextInput
            value={uploadNote}
            onChangeText={setUploadNote}
            placeholder="e.g. Used deep conditioner, hair feels great..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            multiline
            numberOfLines={3}
            maxLength={200}
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderColor: "rgba(210,153,74,0.2)",
              borderRadius: 12,
              padding: 12,
              color: "#fff",
              fontSize: 14,
              textAlignVertical: "top",
              minHeight: 72,
              marginBottom: 16,
            }}
          />

          <View className="gap-3">
            <Button variant="primary" size="lg" onPress={handleConfirmUpload}>
              Save Photo ✓
            </Button>
            <TouchableOpacity
              onPress={() => {
                setUploadSheet(false);
                setPendingUri(null);
              }}
              className="items-center py-2"
            >
              <Text className="text-white/40 text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

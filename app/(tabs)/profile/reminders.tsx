import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useToast } from "../../../components/ui/Toast";
import {
  scheduleDailyReminder,
  cancelAllReminders,
  requestPermissionsAsync,
} from "../../notifications";
import { LinearGradient } from "expo-linear-gradient";

export default function RemindersScreen() {
  const router = useRouter();
  const { show: showToast } = useToast();

  const [washDayEnabled, setWashDayEnabled] = useState(false);
  const [hydrationEnabled, setHydrationEnabled] = useState(false);
  const [trimEnabled, setTrimEnabled] = useState(false);

  const handleToggleWashDay = async (val: boolean) => {
    setWashDayEnabled(val);
    if (val) {
      const hasPerm = await requestPermissionsAsync();
      if (!hasPerm) {
        showToast("Notification permission denied", "error");
        setWashDayEnabled(false);
        return;
      }
      // Schedule for 9 AM
      await scheduleDailyReminder(
        "Wash Day Reminder 🧼",
        "It's time to show your crown some love today!",
        9,
        0,
      );
      showToast("Wash day reminder set for 9:00 AM", "success");
    } else {
      // In a real app we would cancel specific notifications by ID.
      // For this demo, we'll cancel all if they are all turned off.
      if (!hydrationEnabled && !trimEnabled) {
        await cancelAllReminders();
      }
    }
  };

  const handleToggleHydration = async (val: boolean) => {
    setHydrationEnabled(val);
    if (val) {
      const hasPerm = await requestPermissionsAsync();
      if (!hasPerm) {
        showToast("Notification permission denied", "error");
        setHydrationEnabled(false);
        return;
      }
      // Schedule for 8 PM
      await scheduleDailyReminder(
        "Hydration Time 💧",
        "Remember to moisturize and seal your hair tonight.",
        20,
        0,
      );
      showToast("Hydration reminder set for 8:00 PM", "success");
    } else {
      if (!washDayEnabled && !trimEnabled) {
        await cancelAllReminders();
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <View className="px-6 py-4 flex-row items-center bg-hair-bg-dark border-b border-hair-gold/10">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Text className="text-hair-gold text-lg font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Smart Reminders</Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["rgba(210, 153, 74, 0.1)", "rgba(30,30,30,0)"]}
          className="rounded-3xl p-6 border border-hair-gold/20 mb-8"
        >
          <View className="w-16 h-16 bg-hair-gold/20 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl">🔔</Text>
          </View>
          <Text className="text-white text-xl font-bold mb-2">
            Stay Consistent
          </Text>
          <Text className="text-white/60 text-sm leading-relaxed">
            Healthy hair requires consistency. Set up local reminders so you
            never miss a step in your routine.
          </Text>
        </LinearGradient>

        <View className="gap-4">
          {/* Wash Day Reminder */}
          <View className="bg-hair-bg-dark rounded-2xl p-5 border border-hair-gold/10 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mr-4">
                <Text className="text-2xl">🧼</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1">
                  Wash Day
                </Text>
                <Text className="text-white/50 text-xs">Daily at 9:00 AM</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#3e3e3e", true: "#D2994A" }}
              thumbColor={washDayEnabled ? "#ffffff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleToggleWashDay}
              value={washDayEnabled}
            />
          </View>

          {/* Hydration Reminder */}
          <View className="bg-hair-bg-dark rounded-2xl p-5 border border-hair-gold/10 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-12 h-12 bg-teal-500/20 rounded-xl items-center justify-center mr-4">
                <Text className="text-2xl">💧</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1">
                  Evening Hydration
                </Text>
                <Text className="text-white/50 text-xs">Daily at 8:00 PM</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#3e3e3e", true: "#D2994A" }}
              thumbColor={hydrationEnabled ? "#ffffff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleToggleHydration}
              value={hydrationEnabled}
            />
          </View>

          {/* Trim Reminder */}
          <View className="bg-hair-bg-dark rounded-2xl p-5 border border-hair-gold/10 flex-row items-center justify-between opacity-50">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-12 h-12 bg-purple-500/20 rounded-xl items-center justify-center mr-4">
                <Text className="text-2xl">✂️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1">
                  Trims & Dusting
                </Text>
                <Text className="text-white/50 text-xs">Every 8 Weeks</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#3e3e3e", true: "#D2994A" }}
              thumbColor={trimEnabled ? "#ffffff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => {}}
              value={trimEnabled}
              disabled
            />
          </View>
          <Text className="text-center text-white/30 text-xs mt-2 italic">
            Trim reminders coming soon.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../../../components/ui/Toast";
import {
  scheduleDailyReminder,
  cancelReminderById,
  requestPermissionsAsync,
} from "../../notifications";
import { LinearGradient } from "expo-linear-gradient";

// Conditionally import DateTimePicker (not available on web)
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch {}
}

const STORAGE_KEY = "hbc_reminders";

interface ReminderState {
  routineEnabled: boolean;
  routineId: string;
  routineHour: number;
  routineMinute: number;
  washDayEnabled: boolean;
  washDayId: string;
  hydrationEnabled: boolean;
  hydrationId: string;
}

const DEFAULT_STATE: ReminderState = {
  routineEnabled: false,
  routineId: "",
  routineHour: 8,
  routineMinute: 0,
  washDayEnabled: false,
  washDayId: "",
  hydrationEnabled: false,
  hydrationId: "",
};

async function loadState(): Promise<ReminderState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_STATE;
}

async function saveState(state: ReminderState) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m} ${period}`;
}

export default function RemindersScreen() {
  const router = useRouter();
  const { show: showToast } = useToast();
  const [state, setState] = useState<ReminderState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadState().then((s) => {
      setState(s);
      setReady(true);
    });
  }, []);

  const updateState = (patch: Partial<ReminderState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  };

  const handleToggleRoutine = async (val: boolean) => {
    if (val) {
      const hasPerm = await requestPermissionsAsync();
      if (!hasPerm) {
        showToast("Notification permission denied", "error");
        return;
      }
      const id = await scheduleDailyReminder(
        "Hair Care Routine 👑",
        "Good morning! Your hair routine is waiting. Show your crown some love.",
        state.routineHour,
        state.routineMinute
      );
      updateState({ routineEnabled: true, routineId: id });
      showToast(`Routine reminder set for ${formatTime(state.routineHour, state.routineMinute)}`, "success");
    } else {
      await cancelReminderById(state.routineId);
      updateState({ routineEnabled: false, routineId: "" });
    }
  };

  const handleTimeChange = async (_: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios'); // keep open on iOS until dismissed
    if (!selectedDate) return;

    const newHour = selectedDate.getHours();
    const newMinute = selectedDate.getMinutes();

    if (state.routineEnabled) {
      await cancelReminderById(state.routineId);
      const id = await scheduleDailyReminder(
        "Hair Care Routine 👑",
        "Good morning! Your hair routine is waiting. Show your crown some love.",
        newHour,
        newMinute
      );
      updateState({ routineHour: newHour, routineMinute: newMinute, routineId: id });
      showToast(`Reminder updated to ${formatTime(newHour, newMinute)}`, "success");
    } else {
      updateState({ routineHour: newHour, routineMinute: newMinute });
    }
  };

  // Fallback: simple +/- hour buttons when DateTimePicker is not available
  const handleHourChange = async (delta: number) => {
    const newHour = (state.routineHour + delta + 24) % 24;
    if (state.routineEnabled) {
      await cancelReminderById(state.routineId);
      const id = await scheduleDailyReminder(
        "Hair Care Routine 👑",
        "Good morning! Your hair routine is waiting. Show your crown some love.",
        newHour,
        state.routineMinute
      );
      updateState({ routineHour: newHour, routineId: id });
      showToast(`Reminder updated to ${formatTime(newHour, state.routineMinute)}`, "success");
    } else {
      updateState({ routineHour: newHour });
    }
  };

  const handleMinuteChange = async (delta: number) => {
    const newMinute = (state.routineMinute + delta + 60) % 60;
    if (state.routineEnabled) {
      await cancelReminderById(state.routineId);
      const id = await scheduleDailyReminder(
        "Hair Care Routine 👑",
        "Good morning! Your hair routine is waiting. Show your crown some love.",
        state.routineHour,
        newMinute
      );
      updateState({ routineMinute: newMinute, routineId: id });
      showToast(`Reminder updated to ${formatTime(state.routineHour, newMinute)}`, "success");
    } else {
      updateState({ routineMinute: newMinute });
    }
  };

  const handleToggleWashDay = async (val: boolean) => {
    if (val) {
      const hasPerm = await requestPermissionsAsync();
      if (!hasPerm) {
        showToast("Notification permission denied", "error");
        return;
      }
      const id = await scheduleDailyReminder(
        "Wash Day Reminder 🧼",
        "It's time to show your crown some love today!",
        9,
        0
      );
      updateState({ washDayEnabled: true, washDayId: id });
      showToast("Wash day reminder set for 9:00 AM", "success");
    } else {
      await cancelReminderById(state.washDayId);
      updateState({ washDayEnabled: false, washDayId: "" });
    }
  };

  const handleToggleHydration = async (val: boolean) => {
    if (val) {
      const hasPerm = await requestPermissionsAsync();
      if (!hasPerm) {
        showToast("Notification permission denied", "error");
        return;
      }
      const id = await scheduleDailyReminder(
        "Hydration Time 💧",
        "Remember to moisturize and seal your hair tonight.",
        20,
        0
      );
      updateState({ hydrationEnabled: true, hydrationId: id });
      showToast("Hydration reminder set for 8:00 PM", "success");
    } else {
      await cancelReminderById(state.hydrationId);
      updateState({ hydrationEnabled: false, hydrationId: "" });
    }
  };

  // Build time Date object for native picker
  const pickerTime = new Date();
  pickerTime.setHours(state.routineHour, state.routineMinute, 0, 0);

  if (!ready) return null;

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <View className="px-6 py-4 flex-row items-center bg-hair-bg-dark border-b border-hair-gold/10">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Text className="text-hair-gold text-lg font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Smart Reminders</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["rgba(210, 153, 74, 0.1)", "rgba(30,30,30,0)"]}
          className="rounded-3xl p-6 border border-hair-gold/20 mb-8"
        >
          <View className="w-16 h-16 bg-hair-gold/20 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl">🔔</Text>
          </View>
          <Text className="text-white text-xl font-bold mb-2">Stay Consistent</Text>
          <Text className="text-white/60 text-sm leading-relaxed">
            Healthy hair requires consistency. Set up local reminders so you never miss a step in your routine.
          </Text>
        </LinearGradient>

        <View className="gap-4">
          {/* Daily Routine Reminder */}
          <View className="bg-hair-bg-dark rounded-2xl border border-hair-gold/10 overflow-hidden">
            <View className="p-5 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-12 h-12 bg-hair-gold/20 rounded-xl items-center justify-center mr-4">
                  <Text className="text-2xl">👑</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-base mb-1">Daily Routine</Text>
                  <Text className="text-white/50 text-xs">
                    Daily at {formatTime(state.routineHour, state.routineMinute)}
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#3e3e3e", true: "#D2994A" }}
                thumbColor={state.routineEnabled ? "#ffffff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={handleToggleRoutine}
                value={state.routineEnabled}
              />
            </View>

            {/* Time picker row */}
            {DateTimePicker ? (
              <TouchableOpacity
                onPress={() => Platform.OS !== 'web' && setShowTimePicker(true)}
                className="px-5 pb-4 flex-row items-center"
              >
                <Text className="text-hair-gold/70 text-xs mr-2">⏰</Text>
                <Text className="text-hair-gold text-xs font-semibold">
                  Change reminder time: {formatTime(state.routineHour, state.routineMinute)}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="px-5 pb-4 flex-row items-center">
                <Text className="text-hair-gold/70 text-xs mr-3">⏰</Text>
                <Text className="text-white/60 text-xs mr-4">Reminder time:</Text>
                <TouchableOpacity
                  onPress={() => handleHourChange(-1)}
                  className="w-7 h-7 bg-hair-gold/20 rounded-lg items-center justify-center"
                >
                  <Text className="text-hair-gold font-bold text-sm">−</Text>
                </TouchableOpacity>
                <Text className="text-white font-bold text-sm mx-2">
                  {state.routineHour.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  onPress={() => handleHourChange(1)}
                  className="w-7 h-7 bg-hair-gold/20 rounded-lg items-center justify-center"
                >
                  <Text className="text-hair-gold font-bold text-sm">+</Text>
                </TouchableOpacity>
                <Text className="text-white/60 mx-1">:</Text>
                <TouchableOpacity
                  onPress={() => handleMinuteChange(-15)}
                  className="w-7 h-7 bg-hair-gold/20 rounded-lg items-center justify-center"
                >
                  <Text className="text-hair-gold font-bold text-sm">−</Text>
                </TouchableOpacity>
                <Text className="text-white font-bold text-sm mx-2">
                  {state.routineMinute.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  onPress={() => handleMinuteChange(15)}
                  className="w-7 h-7 bg-hair-gold/20 rounded-lg items-center justify-center"
                >
                  <Text className="text-hair-gold font-bold text-sm">+</Text>
                </TouchableOpacity>
                <Text className="text-white/50 text-xs ml-2">
                  {state.routineHour >= 12 ? 'PM' : 'AM'}
                </Text>
              </View>
            )}
          </View>

          {/* Native DateTimePicker modal (only renders when DateTimePicker is available) */}
          {showTimePicker && DateTimePicker && (
            <DateTimePicker
              value={pickerTime}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          {/* Wash Day Reminder */}
          <View className="bg-hair-bg-dark rounded-2xl p-5 border border-hair-gold/10 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mr-4">
                <Text className="text-2xl">🧼</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1">Wash Day</Text>
                <Text className="text-white/50 text-xs">Daily at 9:00 AM</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#3e3e3e", true: "#D2994A" }}
              thumbColor={state.washDayEnabled ? "#ffffff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleToggleWashDay}
              value={state.washDayEnabled}
            />
          </View>

          {/* Hydration Reminder */}
          <View className="bg-hair-bg-dark rounded-2xl p-5 border border-hair-gold/10 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-12 h-12 bg-teal-500/20 rounded-xl items-center justify-center mr-4">
                <Text className="text-2xl">💧</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1">Evening Hydration</Text>
                <Text className="text-white/50 text-xs">Daily at 8:00 PM</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#3e3e3e", true: "#D2994A" }}
              thumbColor={state.hydrationEnabled ? "#ffffff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleToggleHydration}
              value={state.hydrationEnabled}
            />
          </View>

          {/* Trim Reminder — coming soon */}
          <View className="bg-hair-bg-dark rounded-2xl p-5 border border-hair-gold/10 flex-row items-center justify-between opacity-50">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-12 h-12 bg-purple-500/20 rounded-xl items-center justify-center mr-4">
                <Text className="text-2xl">✂️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1">Trims & Dusting</Text>
                <Text className="text-white/50 text-xs">Every 8 Weeks</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#3e3e3e", true: "#D2994A" }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => {}}
              value={false}
              disabled
            />
          </View>
          <Text className="text-center text-white/30 text-xs mt-2 mb-8 italic">
            Trim reminders coming soon.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

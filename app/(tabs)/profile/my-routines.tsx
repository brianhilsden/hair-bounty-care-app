import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routineApi, RoutineTemplate } from '../../../lib/api/routine';
import { SkeletonCard } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';

// Group templates by category
function groupByCategory(templates: RoutineTemplate[]): Record<string, RoutineTemplate[]> {
  return templates.reduce<Record<string, RoutineTemplate[]>>((acc, t) => {
    const cat = t.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});
}

const FREQUENCY_COLORS: Record<string, string> = {
  daily: 'text-green-400 bg-green-400/10 border border-green-400/20',
  weekly: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  monthly: 'text-purple-400 bg-purple-400/10 border border-purple-400/20',
};

export default function MyRoutinesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show: showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['my-routines'],
    queryFn: routineApi.getMyRoutineTemplates,
  });

  const selectedIds = new Set((data?.data?.selected ?? []).map((t) => t.id));
  const available = data?.data?.available ?? [];
  const grouped = groupByCategory(available);

  const addMutation = useMutation({
    mutationFn: (templateId: string) => routineApi.addRoutineTemplate(templateId),

    onMutate: async (templateId: string) => {
      await queryClient.cancelQueries({ queryKey: ['my-routines'] });
      const previous = queryClient.getQueryData(['my-routines']);

      queryClient.setQueryData<typeof data>(['my-routines'], (old) => {
        if (!old?.data) return old;
        const template = old.data.available.find((t) => t.id === templateId);
        if (!template) return old;
        return {
          ...old,
          data: {
            ...old.data,
            selected: [...old.data.selected, template],
          },
        };
      });

      return { previous };
    },

    onError: (_err, _templateId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['my-routines'], context.previous);
      }
      showToast('Could not add routine. Please try again.', 'error');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['my-routines'] });
      queryClient.invalidateQueries({ queryKey: ['routine', 'today'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (templateId: string) => routineApi.removeRoutineTemplate(templateId),

    onMutate: async (templateId: string) => {
      await queryClient.cancelQueries({ queryKey: ['my-routines'] });
      const previous = queryClient.getQueryData(['my-routines']);

      queryClient.setQueryData<typeof data>(['my-routines'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            selected: old.data.selected.filter((t) => t.id !== templateId),
          },
        };
      });

      return { previous };
    },

    onError: (_err, _templateId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['my-routines'], context.previous);
      }
      showToast('Could not remove routine. Please try again.', 'error');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['my-routines'] });
      queryClient.invalidateQueries({ queryKey: ['routine', 'today'] });
    },
  });

  const handleToggle = (template: RoutineTemplate) => {
    if (selectedIds.has(template.id)) {
      removeMutation.mutate(template.id);
    } else {
      addMutation.mutate(template.id);
    }
  };

  const isPending = addMutation.isPending || removeMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-4 border-b border-hair-gold/20">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3"
        >
          <Text className="text-white text-lg">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-white">My Routines</Text>
          <Text className="text-white/50 text-sm mt-0.5">
            {selectedIds.size > 0
              ? `${selectedIds.size} routine${selectedIds.size !== 1 ? 's' : ''} selected`
              : 'Choose routines for your daily checklist'}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48, paddingHorizontal: 24, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View className="bg-hair-gold/10 rounded-2xl px-4 py-3 border border-hair-gold/20 mb-6">
          <Text className="text-hair-gold text-sm font-semibold mb-1">
            Customize your checklist
          </Text>
          <Text className="text-white/60 text-xs leading-relaxed">
            Select which routines appear in your daily home screen checklist. If none are selected, Hair Bounty will recommend routines based on your hair profile.
          </Text>
        </View>

        {isLoading ? (
          <View className="gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : available.length === 0 ? (
          <View className="items-center justify-center h-48">
            <Text className="text-4xl mb-3">🌿</Text>
            <Text className="text-white font-semibold text-base">No routines available</Text>
            <Text className="text-white/50 text-sm text-center mt-1">
              Check back soon — we're adding more routines!
            </Text>
          </View>
        ) : (
          <View className="gap-8">
            {Object.entries(grouped).map(([category, templates]) => (
              <View key={category}>
                {/* Category header */}
                <View className="flex-row items-center mb-3">
                  <Text className="text-white/50 text-xs uppercase tracking-widest font-semibold capitalize">
                    {category}
                  </Text>
                  <View className="flex-1 h-px bg-hair-gold/10 ml-3" />
                </View>

                <View className="gap-3">
                  {templates.map((template) => {
                    const isSelected = selectedIds.has(template.id);
                    return (
                      <TouchableOpacity
                        key={template.id}
                        onPress={() => handleToggle(template)}
                        activeOpacity={0.7}
                        className={`flex-row items-center rounded-2xl px-4 py-4 border ${
                          isSelected
                            ? 'bg-hair-gold/10 border-hair-gold/40'
                            : 'bg-hair-bg-dark border-white/10'
                        }`}
                      >
                        {/* Icon */}
                        <View
                          className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                            isSelected ? 'bg-hair-gold/20' : 'bg-white/5'
                          }`}
                        >
                          <Text className="text-2xl">{template.icon}</Text>
                        </View>

                        {/* Info */}
                        <View className="flex-1">
                          <Text
                            className={`text-sm font-semibold ${
                              isSelected ? 'text-hair-gold' : 'text-white'
                            }`}
                          >
                            {template.name}
                          </Text>
                          <Text className="text-white/50 text-xs mt-0.5 leading-relaxed" numberOfLines={2}>
                            {template.description}
                          </Text>
                          {/* Meta badges */}
                          <View className="flex-row gap-2 mt-2">
                            <View
                              className={`px-2 py-0.5 rounded-full ${
                                FREQUENCY_COLORS[template.frequency] ?? ''
                              }`}
                            >
                              <Text
                                className={`text-[10px] font-semibold capitalize ${
                                  template.frequency === 'daily'
                                    ? 'text-green-400'
                                    : template.frequency === 'weekly'
                                    ? 'text-blue-400'
                                    : 'text-purple-400'
                                }`}
                              >
                                {template.frequency}
                              </Text>
                            </View>
                            <View className="flex-row items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                              <Text className="text-white/40 text-[10px]">
                                ⏱ {template.estimatedMinutes}m
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Toggle button */}
                        <View className="ml-3">
                          {isPending && (
                            addMutation.variables === template.id ||
                            removeMutation.variables === template.id
                          ) ? (
                            <ActivityIndicator size="small" color="#D2994A" />
                          ) : isSelected ? (
                            <View className="w-8 h-8 rounded-full bg-hair-gold items-center justify-center">
                              <Text className="text-[#2a1f1a] font-bold text-base">✓</Text>
                            </View>
                          ) : (
                            <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center border border-white/20">
                              <Text className="text-white/60 text-base">+</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

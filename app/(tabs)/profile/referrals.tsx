import {
  View, Text, ScrollView, TouchableOpacity, Share,
  RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { referralsApi, ReferralEntry } from '../../../lib/api/referrals';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/shared/EmptyState';

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function ReferralRow({ entry }: { entry: ReferralEntry }) {
  return (
    <View className="flex-row items-center py-3 border-b border-hair-gold/10">
      <View className="w-9 h-9 rounded-full bg-hair-gold/20 items-center justify-center mr-3">
        <Text className="text-hair-gold text-base font-bold">
          {entry.referredUser.firstName[0]}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-white text-sm font-semibold">
          {entry.referredUser.firstName} {entry.referredUser.lastName}
        </Text>
        <Text className="text-white/40 text-xs">Joined {timeAgo(entry.referredUser.createdAt)}</Text>
      </View>
      <View className={`px-3 py-1 rounded-full ${entry.discountGiven ? 'bg-success/20' : 'bg-hair-bg-light'}`}>
        <Text className={`text-xs font-semibold ${entry.discountGiven ? 'text-success' : 'text-white/50'}`}>
          {entry.discountGiven ? '✓ Rewarded' : 'Pending'}
        </Text>
      </View>
    </View>
  );
}

export default function ReferralsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: referralsApi.getStats,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['referrals'] });
    setRefreshing(false);
  };

  const stats = statsData?.data;
  const code = stats?.code ?? '';
  const referrals: ReferralEntry[] = stats?.referrals ?? [];

  const handleCopy = async () => {
    if (!code) return;
    // Use Share as a clipboard fallback (expo-clipboard not installed)
    try {
      await Share.share({ message: code, title: 'My Referral Code' });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Your Code', code);
    }
  };

  const handleShare = async () => {
    if (!code) return;
    try {
      await Share.share({
        message: `Join me on Hair Bounty Care and get a discount! Use my code: ${code}\n\nDownload the app: https://hairbountycare.com`,
        title: 'Join Hair Bounty Care',
      });
    } catch {
      // user cancelled share
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D2994A" />
        }
      >
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center border-b border-hair-gold/10 bg-hair-bg-dark">
          <TouchableOpacity onPress={() => router.push('/profile')} className="mr-3 p-1">
            <Text className="text-hair-gold text-base">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">Refer & Earn</Text>
            <Text className="text-white/40 text-xs">Share the love, get rewarded</Text>
          </View>
        </View>

        {isLoading ? (
          <View className="px-6 mt-6 gap-4">
            <Skeleton height={160} rounded="lg" />
            <Skeleton height={100} rounded="lg" />
            <Skeleton height={200} rounded="lg" />
          </View>
        ) : (
          <>
            {/* Hero */}
            <View className="mx-6 mt-6 bg-hair-bg-dark rounded-3xl border border-hair-gold/30 overflow-hidden">
              <View className="bg-hair-gold/10 px-6 pt-6 pb-4 items-center">
                <Text className="text-6xl mb-3">🎁</Text>
                <Text className="text-white text-2xl font-bold text-center mb-1">
                  Invite Friends, Get Discounts
                </Text>
                <Text className="text-white/60 text-sm text-center leading-5">
                  For every friend who joins using your code,
                  you both get a discount on your next order!
                </Text>
              </View>

              {/* Code box */}
              <View className="px-6 py-5">
                <Text className="text-white/50 text-xs font-semibold mb-2 text-center tracking-widest uppercase">
                  Your Referral Code
                </Text>
                <TouchableOpacity
                  onPress={handleCopy}
                  activeOpacity={0.8}
                  className="bg-hair-bg rounded-2xl border-2 border-hair-gold/40 py-4 px-6 items-center mb-3"
                >
                  <Text className="text-hair-gold text-3xl font-bold tracking-widest mb-1">
                    {code || '———'}
                  </Text>
                  <Text className="text-white/40 text-xs">
                    {copied ? '✓ Copied!' : 'Tap to copy'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleShare}
                  className="bg-hair-gold rounded-2xl py-3.5 items-center flex-row justify-center gap-2"
                >
                  <Text className="text-2xl">📤</Text>
                  <Text className="text-white text-base font-bold">Share with Friends</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats */}
            <View className="mx-6 mt-5 flex-row gap-3">
              <View className="flex-1 bg-hair-bg-dark rounded-2xl p-4 items-center border border-hair-gold/10">
                <Text className="text-hair-gold text-3xl font-bold">
                  {stats?.totalReferrals ?? 0}
                </Text>
                <Text className="text-white/50 text-xs mt-1">Total Referrals</Text>
              </View>
              <View className="flex-1 bg-hair-bg-dark rounded-2xl p-4 items-center border border-hair-gold/10">
                <Text className="text-white text-3xl font-bold">
                  {stats?.activeReferrals ?? 0}
                </Text>
                <Text className="text-white/50 text-xs mt-1">Active Users</Text>
              </View>
              <View className="flex-1 bg-hair-bg-dark rounded-2xl p-4 items-center border border-success/20">
                <Text className="text-success text-3xl font-bold">
                  {stats?.discountsEarned ?? 0}
                </Text>
                <Text className="text-white/50 text-xs mt-1">Discounts Earned</Text>
              </View>
            </View>

            {/* How it works */}
            <View className="mx-6 mt-5">
              <Text className="text-white text-lg font-bold mb-4">How It Works</Text>
              <View className="gap-3">
                {[
                  { step: '1', emoji: '📤', title: 'Share your code', desc: 'Send your unique referral code to friends and family' },
                  { step: '2', emoji: '📲', title: 'They sign up',    desc: 'Your friend creates an account using your code' },
                  { step: '3', emoji: '🎉', title: 'You both win',    desc: 'You both receive a discount on your next purchase' },
                ].map(item => (
                  <View key={item.step} className="flex-row items-center bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/10">
                    <View className="w-10 h-10 rounded-full bg-hair-gold items-center justify-center mr-4 shrink-0">
                      <Text className="text-white font-bold text-base">{item.step}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-sm mb-0.5">
                        {item.emoji} {item.title}
                      </Text>
                      <Text className="text-white/50 text-xs leading-4">{item.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Referrals list */}
            <View className="mx-6 mt-6">
              <Text className="text-white text-lg font-bold mb-2">
                Your Referrals {referrals.length > 0 && `(${referrals.length})`}
              </Text>

              {referrals.length === 0 ? (
                <EmptyState
                  emoji="👋"
                  title="No referrals yet"
                  description="Share your code and start earning discounts!"
                  actionLabel="Share Code"
                  onAction={handleShare}
                />
              ) : (
                <View className="bg-hair-bg-dark rounded-2xl border border-hair-gold/10 px-4">
                  {referrals.map(entry => (
                    <ReferralRow key={entry.id} entry={entry} />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

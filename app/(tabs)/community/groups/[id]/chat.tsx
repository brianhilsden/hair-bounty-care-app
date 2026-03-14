import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../../../../store/authStore';
import { chatApi, ChatMessage } from '../../../../../lib/api/chat';
import { communityApi } from '../../../../../lib/api/community';
import { Avatar } from '../../../../../components/ui/Avatar';
import { EmptyState } from '../../../../../components/shared/EmptyState';

function timeLabel(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function shouldShowTimestamp(messages: ChatMessage[], index: number): boolean {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].createdAt).getTime();
  const curr = new Date(messages[index].createdAt).getTime();
  return curr - prev > 5 * 60 * 1000; // 5 min gap
}

function ChatBubble({ message, isMe, showAvatar }: {
  message: ChatMessage;
  isMe: boolean;
  showAvatar: boolean;
}) {
  return (
    <View className={`flex-row items-end mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for others */}
      {!isMe && (
        <View className="mr-2 mb-1" style={{ width: 28 }}>
          {showAvatar && (
            <Avatar
              uri={message.user.avatarUrl}
              name={`${message.user.firstName} ${message.user.lastName}`}
              size="sm"
              style={{ width: 28, height: 28 }}
            />
          )}
        </View>
      )}

      <View className={`max-w-xs ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Name above bubble for others (only on first in group) */}
        {!isMe && showAvatar && (
          <Text className="text-white/50 text-xs mb-1 ml-1">
            {message.user.firstName}
          </Text>
        )}
        <View
          className={`px-4 py-2.5 rounded-2xl ${
            isMe
              ? 'bg-hair-gold rounded-br-sm'
              : 'bg-hair-bg-dark border border-hair-gold/10 rounded-bl-sm'
          }`}
        >
          <Text className={`text-sm leading-5 ${isMe ? 'text-white' : 'text-white/90'}`}>
            {message.content}
          </Text>
        </View>
      </View>

      {/* Spacer for me side */}
      {isMe && <View style={{ width: 8 }} />}
    </View>
  );
}

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const [text, setText] = useState('');

  const { data: groupData } = useQuery({
    queryKey: ['community', 'group', id],
    queryFn: () => communityApi.getGroup(id),
    enabled: !!id,
  });

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['chat', id],
    queryFn: () => chatApi.getMessages(id, { limit: 100 }),
    enabled: !!id,
    refetchInterval: 8000, // Poll every 8s until Socket.io is wired
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', id] });
      setText('');
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  const messages = messagesData?.data ?? [];
  const group = groupData?.data;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center border-b border-hair-gold/10 bg-hair-bg-dark">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Text className="text-hair-gold text-base">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white font-bold text-base" numberOfLines={1}>
              {group?.name ?? 'Group Chat'}
            </Text>
            <Text className="text-white/40 text-xs">
              {group?.memberCount ? `${group.memberCount} members` : 'Loading...'}
            </Text>
          </View>
          {/* Polling indicator */}
          <View className="w-2 h-2 rounded-full bg-success opacity-70" />
        </View>

        {/* Messages */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#D2994A" size="large" />
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <EmptyState
              emoji="💬"
              title="No messages yet"
              description="Be the first to say something!"
            />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, index) => {
              const isMe = msg.user.id === user?.id;
              const showAvatar = !isMe && (
                index === 0 || messages[index - 1].user.id !== msg.user.id
              );
              const showTimestamp = shouldShowTimestamp(messages, index);

              return (
                <View key={msg.id}>
                  {showTimestamp && (
                    <View className="items-center my-3">
                      <Text className="text-white/30 text-xs bg-hair-bg-dark px-3 py-1 rounded-full">
                        {timeLabel(msg.createdAt)}
                      </Text>
                    </View>
                  )}
                  <ChatBubble message={msg} isMe={isMe} showAvatar={showAvatar} />
                </View>
              );
            })}
            {sendMutation.isPending && (
              <View className="flex-row justify-end mb-1 mr-2">
                <View className="bg-hair-gold/50 px-4 py-2.5 rounded-2xl rounded-br-sm">
                  <ActivityIndicator size="small" color="white" />
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Input bar */}
        <View className="px-4 py-3 border-t border-hair-gold/10 bg-hair-bg-dark flex-row items-end gap-3">
          <Avatar
            uri={user?.avatarUrl}
            name={`${user?.firstName} ${user?.lastName}`}
            size="sm"
          />
          <View className="flex-1 bg-hair-bg rounded-2xl px-4 py-2.5 border border-hair-gold/20 min-h-10 max-h-28 justify-center">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Say something..."
              placeholderTextColor="#7a6a5a"
              multiline
              className="text-white text-sm"
              style={{ maxHeight: 96 }}
              returnKeyType="send"
              onSubmitEditing={Platform.OS === 'ios' ? handleSend : undefined}
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sendMutation.isPending}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              text.trim() ? 'bg-hair-gold' : 'bg-hair-bg-light'
            }`}
          >
            <Text className="text-white text-lg">↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

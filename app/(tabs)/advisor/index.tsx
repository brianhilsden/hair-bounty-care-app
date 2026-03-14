import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Markdown from "react-native-markdown-display";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/authStore";
import { aiApi, ChatMessage, AiConversationSummary, AiConversationDetail } from "../../../lib/api/ai";
import { getErrorMessage } from "../../../lib/api";

const { width, height } = Dimensions.get("window");

const SUGGESTED_PROMPTS = [
  { emoji: "💧", text: "My hair is always dry. What should I do?" },
  { emoji: "✂️", text: "How often should I trim my ends?" },
  { emoji: "🛁", text: "Build me a wash day routine" },
  { emoji: "🌿", text: "What ingredients should I avoid?" },
  { emoji: "📏", text: "How can I retain more length?" },
  { emoji: "🌀", text: "Best protective styles for my hair type?" },
];

const markdownStyles = {
  body: { color: "#FFFFFF", fontSize: 15, lineHeight: 22 },
  paragraph: { marginBottom: 4 },
  strong: { color: "#D2994A", fontWeight: "700" as const },
  em: { color: "#D2994A" },
  bullet_list: { marginLeft: 4 },
  list_item: { color: "#FFFFFF", fontSize: 15, lineHeight: 22 },
  code_inline: {
    backgroundColor: "rgba(210,153,74,0.15)",
    color: "#D2994A",
    borderRadius: 4,
    paddingHorizontal: 4,
  },
};

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 12, paddingHorizontal: 16 }}>
        <LinearGradient
          colors={["#D2994A", "#B8823A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            maxWidth: width * 0.75,
            borderRadius: 20,
            borderBottomRightRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 15, lineHeight: 22, fontWeight: "500" }}>
            {message.content}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: "row", justifyContent: "flex-start", marginBottom: 12, paddingHorizontal: 16 }}>
      <View style={{
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: "#D2994A", alignItems: "center", justifyContent: "center",
        marginRight: 8, marginTop: 2, flexShrink: 0,
      }}>
        <Text style={{ fontSize: 16 }}>✨</Text>
      </View>
      <View style={{
        maxWidth: width * 0.72,
        backgroundColor: "rgba(210,153,74,0.15)",
        borderRadius: 20, borderBottomLeftRadius: 4,
        borderWidth: 1, borderColor: "rgba(210,153,74,0.25)",
        paddingHorizontal: 16, paddingVertical: 12,
      }}>
        <Markdown style={markdownStyles}>{message.content}</Markdown>
      </View>
    </View>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    const a1 = bounce(dot1, 0); a1.start();
    const a2 = bounce(dot2, 150); a2.start();
    const a3 = bounce(dot3, 300); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={{ flexDirection: "row", justifyContent: "flex-start", marginBottom: 12, paddingHorizontal: 16 }}>
      <View style={{
        width: 32, height: 32, borderRadius: 16, backgroundColor: "#D2994A",
        alignItems: "center", justifyContent: "center", marginRight: 8, flexShrink: 0,
      }}>
        <Text style={{ fontSize: 16 }}>✨</Text>
      </View>
      <View style={{
        backgroundColor: "rgba(210,153,74,0.15)", borderRadius: 20, borderBottomLeftRadius: 4,
        borderWidth: 1, borderColor: "rgba(210,153,74,0.25)",
        paddingHorizontal: 20, paddingVertical: 16,
        flexDirection: "row", alignItems: "center", gap: 6,
      }}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={{
            width: 7, height: 7, borderRadius: 4, backgroundColor: "#D2994A",
            transform: [{ translateY: dot }],
          }} />
        ))}
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ firstName, onPrompt }: { firstName: string; onPrompt: (t: string) => void }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ alignItems: "center", paddingTop: 40, paddingBottom: 32, paddingHorizontal: 24 }}>
        <LinearGradient
          colors={["rgba(210,153,74,0.3)", "rgba(210,153,74,0.05)"]}
          style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 20 }}
        >
          <Text style={{ fontSize: 48 }}>✨</Text>
        </LinearGradient>
        <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
          Hey {firstName}! I'm Henzo
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, textAlign: "center", lineHeight: 22, maxWidth: 280 }}>
          Your personal AI hair advisor. Ask me anything about your hair care journey.
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }} style={{ marginBottom: 32 }}>
        {[
          { icon: "💆", label: "Routines" }, { icon: "🧴", label: "Products" },
          { icon: "🌀", label: "Styles" }, { icon: "🌿", label: "Ingredients" },
          { icon: "📏", label: "Growth" }, { icon: "🩺", label: "Diagnosis" },
        ].map((cap) => (
          <View key={cap.label} style={{
            backgroundColor: "rgba(210,153,74,0.1)", borderRadius: 14,
            borderWidth: 1, borderColor: "rgba(210,153,74,0.2)",
            paddingHorizontal: 14, paddingVertical: 10, alignItems: "center", minWidth: 80,
          }}>
            <Text style={{ fontSize: 22, marginBottom: 4 }}>{cap.icon}</Text>
            <Text style={{ color: "#D2994A", fontSize: 12, fontWeight: "600" }}>{cap.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
          Try asking...
        </Text>
        <View style={{ gap: 10 }}>
          {SUGGESTED_PROMPTS.map((p) => (
            <TouchableOpacity key={p.text} activeOpacity={0.75} onPress={() => onPrompt(p.text)}>
              <View style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16,
                borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
                paddingHorizontal: 16, paddingVertical: 14, gap: 12,
              }}>
                <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, flex: 1, lineHeight: 20 }}>{p.text}</Text>
                <Text style={{ color: "rgba(210,153,74,0.6)", fontSize: 16 }}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Recents Drawer ───────────────────────────────────────────────────────────

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface RecentsDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (conv: AiConversationSummary) => void;
  onDelete: (id: string) => void;
  conversations: AiConversationSummary[];
  isLoading: boolean;
  activeId?: string;
}

function RecentsDrawer({ visible, onClose, onSelect, onDelete, conversations, isLoading, activeId }: RecentsDrawerProps) {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: width, useNativeDriver: true, damping: 20, stiffness: 200 }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Delete conversation",
      `Delete "${title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(id) },
      ]
    );
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (visible) setMounted(true); }, [visible]);
  if (!visible && !mounted) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", opacity: backdropAnim }}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={{
          position: "absolute", top: 0, right: 0, bottom: 0,
          width: width * 0.82,
          backgroundColor: "#1A1208",
          transform: [{ translateX: slideAnim }],
          borderLeftWidth: 1,
          borderLeftColor: "rgba(210,153,74,0.2)",
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Drawer header */}
          <View style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            paddingHorizontal: 20, paddingVertical: 18,
            borderBottomWidth: 1, borderBottomColor: "rgba(210,153,74,0.12)",
          }}>
            <View>
              <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700" }}>Recent Chats</Text>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.07)",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          {isLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color="#D2994A" />
            </View>
          ) : conversations.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
              <Text style={{ fontSize: 40, marginBottom: 16 }}>💬</Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, textAlign: "center", lineHeight: 22 }}>
                Your conversations with Henzo will appear here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isActive = item.id === activeId;
                const preview = item.messages[0]?.content ?? "";
                return (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => { onSelect(item); onClose(); }}
                    onLongPress={() => handleDelete(item.id, item.title)}
                    style={{
                      marginHorizontal: 12, marginVertical: 4,
                      backgroundColor: isActive ? "rgba(210,153,74,0.15)" : "rgba(255,255,255,0.04)",
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: isActive ? "rgba(210,153,74,0.35)" : "rgba(255,255,255,0.06)",
                      padding: 14,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                      <View style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: isActive ? "#D2994A" : "rgba(210,153,74,0.2)",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Text style={{ fontSize: 16 }}>✨</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600", flex: 1, marginRight: 8 }} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                            {formatRelativeDate(item.updatedAt)}
                          </Text>
                        </View>
                        {preview ? (
                          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 18 }} numberOfLines={2}>
                            {preview}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* Hint */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 }}>
            <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, textAlign: "center" }}>
              Long press a conversation to delete it
            </Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdvisorScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [showRecents, setShowRecents] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ["ai", "conversations"],
    queryFn: aiApi.listConversations,
  });

  const deleteMutation = useMutation({
    mutationFn: aiApi.deleteConversation,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
      if (conversationId === deletedId) {
        setMessages([]);
        setConversationId(undefined);
      }
    },
  });

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const loadConversation = useCallback(async (conv: AiConversationSummary) => {
    try {
      const detail: AiConversationDetail = await aiApi.getConversation(conv.id);
      const loaded: ChatMessage[] = detail.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      setMessages(loaded);
      setConversationId(conv.id);
      scrollToBottom();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);
    scrollToBottom();

    try {
      const { reply, conversationId: convId } = await aiApi.chat(newMessages, conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setConversationId(convId);
      queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
      scrollToBottom();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, conversationId, scrollToBottom, queryClient]);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    setError(null);
  }, []);

  const firstName = user?.firstName || "there";
  const isEmpty = messages.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#2a1f1a" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 20, paddingVertical: 16,
          borderBottomWidth: 1, borderBottomColor: "rgba(210,153,74,0.15)",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <LinearGradient
              colors={["#D2994A", "#B8823A"]}
              style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 20 }}>✨</Text>
            </LinearGradient>
            <View>
              <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "700" }}>Henzo</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CAF50" }} />
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>AI Hair Advisor</Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {!isEmpty && (
              <TouchableOpacity
                onPress={startNewChat}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7,
                  borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
                }}
              >
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>New chat</Text>
              </TouchableOpacity>
            )}

            {/* Recents button */}
            <TouchableOpacity
              onPress={() => setShowRecents(true)}
              style={{
                width: 38, height: 38, borderRadius: 19,
                backgroundColor: "rgba(210,153,74,0.12)",
                borderWidth: 1, borderColor: "rgba(210,153,74,0.2)",
                alignItems: "center", justifyContent: "center",
              }}
            >
              {conversations.length > 0 && (
                <View style={{
                  position: "absolute", top: -2, right: -2,
                  width: 16, height: 16, borderRadius: 8,
                  backgroundColor: "#D2994A", alignItems: "center", justifyContent: "center",
                  borderWidth: 1.5, borderColor: "#2a1f1a",
                }}>
                  <Text style={{ color: "#FFF", fontSize: 9, fontWeight: "700" }}>
                    {conversations.length > 9 ? "9+" : conversations.length}
                  </Text>
                </View>
              )}
              <Text style={{ fontSize: 17 }}>🕐</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        {isEmpty ? (
          <View style={{ flex: 1 }}>
            <EmptyState firstName={firstName} onPrompt={sendMessage} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            {error && (
              <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                <View style={{
                  backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 12,
                  borderWidth: 1, borderColor: "rgba(239,68,68,0.25)",
                  padding: 14, flexDirection: "row", alignItems: "center", gap: 10,
                }}>
                  <Text style={{ fontSize: 18 }}>⚠️</Text>
                  <Text style={{ color: "#FCA5A5", fontSize: 14, flex: 1 }}>{error}</Text>
                  <TouchableOpacity onPress={() => sendMessage(messages[messages.length - 1]?.content || "")}>
                    <Text style={{ color: "#D2994A", fontSize: 13, fontWeight: "600" }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Input bar */}
        <View style={{
          paddingHorizontal: 16, paddingTop: 12,
          paddingBottom: Platform.OS === "ios" ? 8 : 16,
          borderTopWidth: 1, borderTopColor: "rgba(210,153,74,0.12)",
          backgroundColor: "#2a1f1a",
        }}>
          <View style={{
            flexDirection: "row", alignItems: "flex-end",
            backgroundColor: "rgba(255,255,255,0.06)",
            borderRadius: 28, borderWidth: 1, borderColor: "rgba(210,153,74,0.2)",
            paddingLeft: 18, paddingRight: 6, paddingVertical: 6, gap: 8,
          }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask Henzo anything about your hair..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              maxLength={500}
              style={{ flex: 1, color: "#FFFFFF", fontSize: 15, lineHeight: 22, maxHeight: 120, paddingVertical: 8 }}
              onSubmitEditing={() => sendMessage(input)}
              blurOnSubmit={false}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={() => sendMessage(input)} disabled={!input.trim() || isLoading} activeOpacity={0.8}>
              <LinearGradient
                colors={input.trim() && !isLoading ? ["#D2994A", "#B8823A"] : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.05)"]}
                style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ fontSize: 18, marginLeft: 2 }}>➤</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, textAlign: "center", marginTop: 8 }}>
            Henzo can make mistakes. Always consult a professional for medical concerns.
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Recents drawer */}
      <RecentsDrawer
        visible={showRecents}
        onClose={() => setShowRecents(false)}
        onSelect={loadConversation}
        onDelete={(id) => deleteMutation.mutate(id)}
        conversations={conversations}
        isLoading={convsLoading}
        activeId={conversationId}
      />
    </SafeAreaView>
  );
}

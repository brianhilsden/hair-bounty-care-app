import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useCartStore } from "../../../../store/cartStore";
import { productsApi } from "../../../../lib/api/products";
import { promosApi, PromoCode } from "../../../../lib/api/promos";
import { useToast } from "../../../../components/ui/Toast";
import { EmptyState } from "../../../../components/shared/EmptyState";

export default function CartScreen() {
  const router = useRouter();
  const { show: showToast } = useToast();
  const {
    items,
    removeItem,
    updateQuantity,
    totalAmount,
    deliveryAddress,
    deliveryNotes,
    setDeliveryAddress,
    setDeliveryNotes,
    clear,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const orderMutation = useMutation({
    mutationFn: () =>
      productsApi.createOrder({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        deliveryAddress,
        deliveryNotes,
        paymentMethod,
      }),
    onSuccess: () => {
      clear();
      Alert.alert(
        "🎉 Order Placed!",
        `Order confirmed!\nYou'll receive updates on your delivery.`,
        [
          { text: "View Orders", onPress: () => router.replace('/explore/orders') },
          { text: "OK", onPress: () => router.back() },
        ],
      );
    },
    onError: () => showToast("Failed to place order. Try again.", "error"),
  });

  const promoMutation = useMutation({
    mutationFn: () => promosApi.validate(promoInput),
    onSuccess: (res) => {
      if (res.data) setAppliedPromo(res.data);
      showToast("Promo code applied successfully! 🎁", "success");
      setPromoInput("");
    },
    onError: () => {
      showToast("Invalid or expired promo code", "error");
    },
  });

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    promoMutation.mutate();
  };

  const handleCheckout = () => {
    if (!deliveryAddress.trim()) {
      showToast("Please enter your delivery address", "error");
      return;
    }
    if (items.length === 0) return;
    orderMutation.mutate();
  };

  const baseTotal = totalAmount();
  let discountAmount = 0;

  if (appliedPromo) {
    if (appliedPromo.discountType === "percentage") {
      discountAmount = baseTotal * (appliedPromo.discountValue / 100);
    } else if (appliedPromo.discountType === "fixed_amount") {
      discountAmount = appliedPromo.discountValue;
    }
    // ensure discount doesn't exceed total
    if (discountAmount > baseTotal) discountAmount = baseTotal;
  }

  const finalTotal = baseTotal - discountAmount;

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-hair-bg">
        <View className="px-4 py-3 flex-row items-center bg-hair-bg-dark border-b border-hair-gold/10">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Text className="text-hair-gold text-base">←</Text>
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Your Cart</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <EmptyState
            emoji="🛒"
            title="Cart is empty"
            description="Add some products to get started!"
            actionLabel="Browse Products"
            onAction={() => router.push('/explore/products')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center bg-hair-bg-dark border-b border-hair-gold/10">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Text className="text-hair-gold text-base">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">Your Cart</Text>
          <Text className="text-white/40 text-xs">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cart items */}
        <View className="px-4 mt-4 gap-3">
          {items.map((item) => (
            <View
              key={item.productId}
              className="flex-row items-center bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/10"
            >
              <View className="w-14 h-14 rounded-xl overflow-hidden mr-3">
                <Image
                  source={{ uri: item.imageUrl ?? "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400" }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-white font-semibold text-sm"
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text className="text-hair-gold font-bold text-sm mt-1">
                  KES {(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 ml-3">
                <TouchableOpacity
                  onPress={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                  className="w-7 h-7 bg-hair-bg-light rounded-full items-center justify-center"
                >
                  <Text className="text-white font-bold">−</Text>
                </TouchableOpacity>
                <Text className="text-white font-bold w-5 text-center">
                  {item.quantity}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                  className="w-7 h-7 bg-hair-gold rounded-full items-center justify-center"
                >
                  <Text className="text-white font-bold">+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => removeItem(item.productId)}
                className="ml-3 p-1"
              >
                <Text className="text-white/30 text-lg">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Delivery address */}
        <View className="px-4 mt-5">
          <Text className="text-white font-semibold mb-2">
            📍 Delivery Address
          </Text>
          <View className="bg-hair-bg-dark rounded-2xl border border-hair-gold/20 px-4 py-3 mb-3">
            <TextInput
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Enter your delivery address..."
              placeholderTextColor="#7a6a5a"
              multiline
              numberOfLines={2}
              className="text-white text-sm"
              style={{ textAlignVertical: "top" }}
            />
          </View>
          <View className="bg-hair-bg-dark rounded-2xl border border-hair-gold/20 px-4 py-3">
            <TextInput
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
              placeholder="Delivery notes (optional)..."
              placeholderTextColor="#7a6a5a"
              className="text-white text-sm"
            />
          </View>
        </View>

        {/* Payment method */}
        <View className="px-4 mt-5">
          <Text className="text-white font-semibold mb-3">
            💳 Payment Method
          </Text>
          <View className="flex-row gap-3">
            {[
              {
                key: "mpesa",
                label: "M-Pesa",
                emoji: "📱",
                desc: "Pay via Safaricom",
              },
              {
                key: "card",
                label: "Card",
                emoji: "💳",
                desc: "Debit / Credit",
              },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setPaymentMethod(opt.key as "mpesa" | "card")}
                className={`flex-1 rounded-2xl p-4 border items-center ${paymentMethod === opt.key ? "bg-hair-gold border-hair-gold" : "bg-hair-bg-dark border-hair-gold/20"}`}
              >
                <Text className="text-2xl mb-1">{opt.emoji}</Text>
                <Text
                  className={`font-bold text-sm ${paymentMethod === opt.key ? "text-white" : "text-white/70"}`}
                >
                  {opt.label}
                </Text>
                <Text
                  className={`text-xs mt-0.5 ${paymentMethod === opt.key ? "text-white/80" : "text-white/40"}`}
                >
                  {opt.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promo Code input */}
        <View className="px-4 mt-5">
          <Text className="text-white font-semibold mb-3">🎁 Promo Code</Text>
          {appliedPromo ? (
            <View className="bg-hair-gold/10 border border-hair-gold/50 rounded-2xl px-4 py-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🎉</Text>
                <View>
                  <Text className="text-hair-gold font-bold">
                    {appliedPromo.code}
                  </Text>
                  <Text className="text-white/60 text-xs">
                    Discount applied
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setAppliedPromo(null)}>
                <Text className="text-white/50 text-sm font-semibold">
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center bg-hair-bg-dark rounded-2xl border border-hair-gold/20 pl-4 p-1">
              <Text className="text-xl mr-2 text-white/50">#</Text>
              <TextInput
                value={promoInput}
                onChangeText={setPromoInput}
                placeholder="Enter promo code"
                placeholderTextColor="#7a6a5a"
                autoCapitalize="characters"
                className="flex-1 text-white text-sm py-3"
              />
              <TouchableOpacity
                onPress={handleApplyPromo}
                disabled={promoMutation.isPending || !promoInput.trim()}
                className={`rounded-xl px-5 py-3 ${promoInput.trim() ? "bg-hair-gold" : "bg-hair-bg-light"}`}
              >
                <Text
                  className={`font-bold ${promoInput.trim() ? "text-white" : "text-white/40"}`}
                >
                  {promoMutation.isPending ? "..." : "Apply"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Order summary */}
        <View className="mx-4 mt-5 bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/20">
          <Text className="text-white font-bold mb-3">Order Summary</Text>
          {items.map((item) => (
            <View
              key={item.productId}
              className="flex-row justify-between mb-2"
            >
              <Text className="text-white/60 text-sm flex-1" numberOfLines={1}>
                {item.name} ×{item.quantity}
              </Text>
              <Text className="text-white text-sm font-semibold ml-2">
                KES {(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}

          {appliedPromo && (
            <View className="flex-row justify-between mb-2 pb-2">
              <Text className="text-hair-gold text-sm flex-1 font-semibold">
                Discount ({appliedPromo.code})
              </Text>
              <Text className="text-hair-gold text-sm font-semibold ml-2">
                -KES {discountAmount.toLocaleString()}
              </Text>
            </View>
          )}

          <View className="border-t border-hair-gold/20 mt-2 pt-3 flex-row justify-between">
            <Text className="text-white font-bold">Total</Text>
            <Text className="text-hair-gold font-bold text-lg">
              KES {finalTotal.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout bar */}
      <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-hair-bg-dark border-t border-hair-gold/10">
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={orderMutation.isPending}
          className={`rounded-2xl py-4 items-center ${orderMutation.isPending ? "bg-hair-gold/50" : "bg-hair-gold"}`}
        >
          <Text className="text-white font-bold text-base">
            {orderMutation.isPending
              ? "Placing Order..."
              : `Place Order · KES ${finalTotal.toLocaleString()}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

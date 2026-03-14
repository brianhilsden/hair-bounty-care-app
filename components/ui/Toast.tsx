import React, { useEffect, useRef, createContext, useContext, useState, useCallback } from 'react';
import { Animated, Text, View, TouchableOpacity } from 'react-native';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

const variantStyles: Record<ToastVariant, { container: string; text: string; icon: string }> = {
  success: { container: 'bg-success/20 border-success/40', text: 'text-success', icon: '✓' },
  error:   { container: 'bg-error/20 border-error/40',   text: 'text-error',   icon: '✕' },
  warning: { container: 'bg-warning/20 border-warning/40', text: 'text-warning', icon: '!' },
  info:    { container: 'bg-info/20 border-info/40',     text: 'text-info',    icon: 'i' },
};

function ToastMessage({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { container, text, icon } = variantStyles[item.variant];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => onDismiss(item.id));
    }, item.duration ?? 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      <TouchableOpacity
        onPress={() => onDismiss(item.id)}
        className={`flex-row items-center px-4 py-3 rounded-xl border mb-2 ${container}`}
        activeOpacity={0.9}
      >
        <View className={`w-6 h-6 rounded-full border ${container} items-center justify-center mr-3`}>
          <Text className={`${text} text-xs font-bold`}>{icon}</Text>
        </View>
        <Text className={`${text} text-sm font-medium flex-1`}>{item.message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((message: string, variant: ToastVariant = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, variant, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View className="absolute top-14 left-4 right-4 z-50">
        {toasts.map(item => (
          <ToastMessage key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

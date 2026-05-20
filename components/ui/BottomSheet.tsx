import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  snapHeight?: number;   // height in px, defaults to 50% of screen
  children: React.ReactNode;
}

export const BottomSheet = ({
  visible,
  onClose,
  title,
  snapHeight = SCREEN_HEIGHT * 0.5,
  children,
}: BottomSheetProps) => {
  const translateY = useRef(new Animated.Value(snapHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: snapHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > snapHeight * 0.35 || vy > 0.8) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', opacity: backdropOpacity }}
          />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: snapHeight,
              transform: [{ translateY }],
            },
          ]}
          className="bg-hair-bg-dark rounded-t-3xl border-t border-hair-gold/20"
        >
          {/* Drag handle */}
          <View {...panResponder.panHandlers} className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-hair-gold/30" />
          </View>

          {title && (
            <View className="px-6 pb-4 border-b border-hair-gold/10">
              <Text className="text-white text-lg font-bold">{title}</Text>
            </View>
          )}

          <View className="flex-1 px-6 pt-4">{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import type { TextInputProps } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isPassword = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className="w-full">
        {label && (
          <Text className="text-white text-sm font-medium mb-2">
            {label}
          </Text>
        )}

        <View
          className={`
            flex-row items-center bg-hair-bg-dark rounded-xl px-4 py-3
            border ${error ? 'border-error' : isFocused ? 'border-hair-gold' : 'border-hair-gold/20'}
          `}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}

          <TextInput
            ref={ref}
            className={`flex-1 text-white text-base ${className}`}
            placeholderTextColor="#7a6a5a"
            secureTextEntry={isPassword && !isPasswordVisible}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {isPassword && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="ml-3"
            >
              <Text className="text-hair-gold text-sm font-medium">
                {isPasswordVisible ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          )}

          {rightIcon && !isPassword && (
            <View className="ml-3">{rightIcon}</View>
          )}
        </View>

        {error && (
          <Text className="text-error text-sm mt-1">{error}</Text>
        )}

        {helperText && !error && (
          <Text className="text-white/60 text-sm mt-1">
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import type { TouchableOpacityProps } from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  ButtonProps
>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      className = "",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    // Variant styles
    const variantStyles = {
      primary: "bg-hair-gold active:bg-hair-gold-hover",
      secondary: "bg-hair-bg-light active:bg-hair-bg",
      outline:
        "border-2 border-hair-gold/30 active:border-hair-gold bg-transparent",
      ghost: "bg-transparent active:bg-hair-bg-light/20",
    };

    // Size styles
    const sizeStyles = {
      sm: "px-4 py-2",
      md: "px-6 py-3",
      lg: "px-8 py-4",
    };

    // Text size styles
    const textSizeStyles = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    };

    // Text color styles
    const textColorStyles = {
      primary: "text-white font-semibold",
      secondary: "text-white font-semibold",
      outline: "text-hair-gold font-semibold",
      ghost: "text-white font-medium",
    };

    return (
      <TouchableOpacity
        ref={ref}
        disabled={isDisabled}
        className={`
          flex-row items-center justify-center rounded-full
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${isDisabled ? "opacity-50" : "opacity-100"}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator
            color={variant === "outline" ? "#D2994A" : "#FFFFFF"}
          />
        ) : (
          <>
            {leftIcon && <View className="mr-2">{leftIcon}</View>}
            <Text
              className={`${textColorStyles[variant]} ${textSizeStyles[size]}`}
            >
              {children}
            </Text>
            {rightIcon && <View className="ml-2">{rightIcon}</View>}
          </>
        )}
      </TouchableOpacity>
    );
  },
);

Button.displayName = "Button";

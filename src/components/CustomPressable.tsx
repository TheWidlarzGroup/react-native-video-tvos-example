import React, {forwardRef, useCallback} from 'react';
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';

export type StyleType = (
  state: PressableStateCallbackType,
) => StyleProp<ViewStyle>;

export const CustomPressable = forwardRef<View, PressableProps>(
  ({children, style, ...props}, ref) => {
    const _style = useCallback<StyleType>(
      ({focused}) => [
        style as ViewStyle,
        {
          backgroundColor: focused ? '#b0b0b080' : 'transparent',
          padding: RFPercentage(1.2),
          borderRadius: 9999,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ],
      [style],
    );

    return (
      <Pressable ref={ref} style={_style} {...props}>
        {children}
      </Pressable>
    );
  },
);

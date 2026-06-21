import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

interface TileProps {
  id: number;
  color: string;
  isActive: boolean;
  isWrong?: boolean;
  disabled?: boolean;
  onPress: (id: number) => void;
  size?: number;
  ghostMode?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Tile({
  id,
  color,
  isActive,
  isWrong = false,
  disabled = false,
  onPress,
  size = 92,
  ghostMode = false,
}: TileProps) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1.06, { damping: 14, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 16, stiffness: 220 });
    }
  }, [isActive]);

  React.useEffect(() => {
    if (isWrong) {
      scale.value = withTiming(0.9, { duration: 70 });
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 12 });
      }, 160);
    }
  }, [isWrong]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = isWrong
      ? '#FF3366'
      : isActive
        ? color
        : ghostMode
          ? COLORS.tileIdle
          : COLORS.tileIdle;

    // Much calmer idle glow
    const effectiveShadowColor = (isActive || isWrong)
      ? (isWrong ? '#FF3366' : color)
      : '#6B7280';

    const shadowOpacity = isActive || isWrong ? 0.7 : 0.08;
    const shadowRadius = isActive || isWrong ? 14 : 3;

    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
      shadowColor: effectiveShadowColor,
      shadowOpacity,
      shadowRadius,
    };
  });

  const handlePress = () => {
    if (!disabled) {
      scale.value = withSpring(0.9, { damping: 18, stiffness: 380 });
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 240 });
      }, 70);
      onPress(id);
    }
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderColor: isActive || isWrong ? color : '#2A2A3D',
        },
        animatedStyle,
      ]}
    >
      <View style={styles.innerGlow} />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  innerGlow: {
    position: 'absolute',
    width: '65%',
    height: '65%',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
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
  const glow = useSharedValue(0);

  React.useEffect(() => {
    if (isActive) {
      glow.value = withTiming(1, { duration: 120 });
      scale.value = withSpring(1.08, { damping: 12, stiffness: 180 });
    } else {
      glow.value = withTiming(0, { duration: 180 });
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  }, [isActive]);

  React.useEffect(() => {
    if (isWrong) {
      scale.value = withTiming(0.92, { duration: 80 });
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 12 });
      }, 180);
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

    // Neutral calm glow for ALL idle tiles. Color only appears when active.
    const effectiveShadowColor = (isActive || isWrong)
      ? (isWrong ? '#FF3366' : color)
      : '#A8B8D0'; // single neutral glow color for idle state

    const shadowOpacity = isActive || isWrong ? 0.85 : 0.18;
    const shadowRadius = isActive || isWrong ? 16 : 5;

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
      scale.value = withSpring(0.92, { damping: 20, stiffness: 400 });
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 250 });
      }, 80);
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
          borderColor: isActive || isWrong ? color : '#333355',
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
    borderRadius: 18,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  innerGlow: {
    position: 'absolute',
    width: '68%',
    height: '68%',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
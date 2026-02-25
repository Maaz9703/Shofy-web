import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32) / 2 - 8;

const ShimmerBox = ({ width, height, style }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.shimmer, { width, height }, style, animatedStyle]}
    />
  );
};

const LoadingShimmer = () => (
  <View style={styles.container}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <View key={i} style={styles.card}>
        <ShimmerBox width={CARD_WIDTH} height={CARD_WIDTH} style={styles.image} />
        <ShimmerBox width={CARD_WIDTH * 0.8} height={16} style={styles.text} />
        <ShimmerBox width={CARD_WIDTH * 0.5} height={12} style={styles.text} />
        <ShimmerBox width={CARD_WIDTH * 0.4} height={14} style={[styles.text, { marginTop: 8 }]} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    width: CARD_WIDTH + 16,
    margin: 8,
    padding: 8,
  },
  shimmer: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  image: {
    borderRadius: 12,
  },
  text: {
    marginTop: 8,
    borderRadius: 4,
  },
});

export default LoadingShimmer;

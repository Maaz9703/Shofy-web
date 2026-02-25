import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const [animationError, setAnimationError] = useState(false);

  return (
    <View style={styles.container}>
      {!animationError ? (
        <LottieView
          source={require('../../assets/animations/splash.json')}
          autoPlay
          loop={false}
          style={styles.animation}
          onAnimationFailure={() => setAnimationError(true)}
        />
      ) : (
        <ActivityIndicator size="large" color="#6366f1" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: width * 0.8,
    height: width * 0.8,
  },
});

export default SplashScreen;

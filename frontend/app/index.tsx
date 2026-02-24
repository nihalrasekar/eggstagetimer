import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Stage configurations
const STAGES = {
  SOFT: {
    id: 1,
    name: 'Soft Boiled',
    duration: 360, // 6 minutes in seconds
    bgColor: '#FFF8E7',
    accentColor: '#FFE680',
    description: 'Whites are set, yolk is warm and runny — perfect for ramen or toast dipping',
    badge: '🟡 Runny Yolk',
  },
  MEDIUM: {
    id: 2,
    name: 'Medium Boiled',
    duration: 180, // 3 minutes in seconds
    bgColor: '#FFD966',
    accentColor: '#FFC107',
    description: 'Whites fully set, yolk is jammy and creamy — great for salads and grain bowls',
    badge: '🟠 Jammy Yolk',
  },
  HARD: {
    id: 3,
    name: 'Hard Boiled',
    duration: 180, // 3 minutes in seconds
    bgColor: '#F5C400',
    accentColor: '#E6A800',
    description: 'Fully cooked through — ideal for deviled eggs, sandwiches, and meal prep',
    badge: '⚪ Solid Yolk',
  },
};

export default function Index() {
  const [currentStage, setCurrentStage] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(STAGES.SOFT.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animated values
  const bgColorAnim = useSharedValue(0);
  const wobbleAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);
  const confettiAnim = useSharedValue(0);
  const steamAnim = useSharedValue(0);

  // Get current stage config
  const getCurrentStageConfig = () => {
    if (currentStage === 1) return STAGES.SOFT;
    if (currentStage === 2) return STAGES.MEDIUM;
    return STAGES.HARD;
  };

  const stageConfig = getCurrentStageConfig();

  // Background color animation
  const animatedBackground = useAnimatedStyle(() => {
    const colors = [STAGES.SOFT.bgColor, STAGES.MEDIUM.bgColor, STAGES.HARD.bgColor];
    const bgColor = colors[currentStage - 1];
    
    return {
      backgroundColor: withTiming(bgColor, { duration: 1500, easing: Easing.ease }),
    };
  });

  // Wobble animation
  const animatedEgg = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${wobbleAnim.value}deg`,
        },
      ],
    };
  });

  // Pulse animation for timer ring
  const animatedPulse = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnim.value }],
    };
  });

  // Confetti animation
  const animatedConfetti = useAnimatedStyle(() => {
    return {
      opacity: confettiAnim.value,
      transform: [{ translateY: withTiming(confettiAnim.value * -50, { duration: 1000 }) }],
    };
  });

  // Steam animation
  const animatedSteam = useAnimatedStyle(() => {
    return {
      opacity: steamAnim.value,
      transform: [{ translateY: withTiming(steamAnim.value * -100, { duration: 2000 }) }],
    };
  });

  // Play sound effect
  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, volume: 0.5 }
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 2000);
    } catch (error) {
      console.log('Sound play error:', error);
    }
  };

  // Haptic feedback
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Stage complete
            const nextStage = currentStage + 1;
            
            if (nextStage <= 3) {
              // Move to next stage
              setCurrentStage(nextStage);
              playSound();
              triggerHaptic();
              
              const nextStageConfig = nextStage === 2 ? STAGES.MEDIUM : STAGES.HARD;
              return nextStageConfig.duration;
            } else {
              // All stages complete
              setIsRunning(false);
              setIsCompleted(true);
              playSound();
              triggerHaptic();
              
              // Trigger confetti and steam animations
              confettiAnim.value = withRepeat(
                withTiming(1, { duration: 500 }),
                6,
                true
              );
              steamAnim.value = withRepeat(
                withSequence(
                  withTiming(1, { duration: 2000 }),
                  withTiming(0, { duration: 1000 })
                ),
                -1
              );
              
              return 0;
            }
          }
          
          setTotalElapsed((e) => e + 1);
          
          // Pulse in last 30 seconds
          if (prev <= 30 && prev % 2 === 0) {
            pulseAnim.value = withSequence(
              withSpring(1.05, { damping: 10 }),
              withSpring(1)
            );
          }
          
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isCompleted, currentStage]);

  // Start/Pause button handler
  const handleStartPause = () => {
    if (isCompleted) return;
    
    if (!isRunning) {
      // Start wobble animation
      wobbleAnim.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 100 }),
          withTiming(3, { duration: 100 }),
          withTiming(-3, { duration: 100 }),
          withTiming(0, { duration: 100 })
        ),
        2
      );
      triggerHaptic();
    }
    
    setIsRunning(!isRunning);
  };

  // Reset button handler
  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setCurrentStage(1);
    setTimeRemaining(STAGES.SOFT.duration);
    setTotalElapsed(0);
    confettiAnim.value = 0;
    steamAnim.value = 0;
    pulseAnim.value = 1;
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const getProgress = () => {
    const stageDuration = stageConfig.duration;
    return ((stageDuration - timeRemaining) / stageDuration) * 100;
  };

  // Render egg illustration
  const renderEgg = () => {
    const size = width * 0.35;
    
    if (currentStage === 1) {
      // Soft boiled - liquid yolk
      return (
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <G>
            {/* Outer white */}
            <Ellipse cx="100" cy="100" rx="80" ry="90" fill="#FFFFFF" />
            {/* Inner soft white */}
            <Ellipse cx="100" cy="100" rx="50" ry="55" fill="#FFF9E6" />
            {/* Liquid yolk with shine */}
            <Circle cx="100" cy="100" r="35" fill="#FFD700" />
            <Circle cx="100" cy="100" r="30" fill="#FFC700" opacity="0.8" />
            {/* Shine effect */}
            <Circle cx="90" cy="90" r="10" fill="#FFED4E" opacity="0.6" />
          </G>
        </Svg>
      );
    } else if (currentStage === 2) {
      // Medium boiled - jammy yolk
      return (
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <G>
            {/* Outer white */}
            <Ellipse cx="100" cy="100" rx="80" ry="90" fill="#FFFFFF" />
            {/* Firm white */}
            <Ellipse cx="100" cy="100" rx="50" ry="55" fill="#FFFEF8" />
            {/* Jammy yolk - darker orange */}
            <Circle cx="100" cy="100" r="35" fill="#FF9500" />
            <Circle cx="100" cy="100" r="25" fill="#FF8C00" opacity="0.9" />
            {/* Soft ring */}
            <Circle cx="100" cy="100" r="30" fill="none" stroke="#FFB84D" strokeWidth="3" opacity="0.5" />
          </G>
        </Svg>
      );
    } else {
      // Hard boiled - solid yolk
      return (
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <G>
            {/* Outer white */}
            <Ellipse cx="100" cy="100" rx="80" ry="90" fill="#FFFFFF" />
            {/* Firm white */}
            <Ellipse cx="100" cy="100" rx="50" ry="55" fill="#FFFEF8" />
            {/* Solid pale yellow yolk - matte */}
            <Circle cx="100" cy="100" r="35" fill="#F0E68C" />
            <Circle cx="100" cy="100" r="30" fill="#EEE8AA" opacity="0.95" />
          </G>
        </Svg>
      );
    }
  };

  // Render circular progress ring
  const renderProgressRing = () => {
    const size = width * 0.5;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = getProgress();
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <Svg width={size} height={size} style={styles.progressRing}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.3}
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stageConfig.accentColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    );
  };

  // Render confetti
  const renderConfetti = () => {
    if (!isCompleted) return null;
    
    return (
      <Animated.View style={[styles.confettiContainer, animatedConfetti]}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.confetti,
              {
                left: Math.random() * width,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7B731'][i % 5],
              },
            ]}
          />
        ))}
      </Animated.View>
    );
  };

  // Render steam
  const renderSteam = () => {
    if (!isCompleted) return null;
    
    return (
      <Animated.View style={[styles.steamContainer, animatedSteam]}>
        {[...Array(5)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.steam,
              {
                left: width / 2 - 50 + i * 25,
              },
            ]}
          />
        ))}
      </Animated.View>
    );
  };

  if (isCompleted) {
    return (
      <Animated.View style={[styles.container, animatedBackground]}>
        <StatusBar style="dark" />
        {renderConfetti()}
        
        <View style={styles.completionContainer}>
          {renderSteam()}
          <Animated.View style={animatedEgg}>
            {renderEgg()}
          </Animated.View>
          
          <Text style={styles.completionTitle}>Your egg is ready! 🥚</Text>
          <Text style={styles.completionSubtitle}>
            Total time: {Math.floor(totalElapsed / 60)} minutes {totalElapsed % 60} seconds
          </Text>
          
          <TouchableOpacity style={styles.restartButton} onPress={handleReset}>
            <Text style={styles.restartButtonText}>Start New Timer</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <StatusBar style="dark" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>EggTimer 🥚</Text>
      </View>

      {/* Stage Indicators */}
      <View style={styles.stageIndicators}>
        {[1, 2, 3].map((stage) => (
          <View
            key={stage}
            style={[
              styles.stageDot,
              stage === currentStage && { backgroundColor: stageConfig.accentColor },
              stage < currentStage && { backgroundColor: '#4CAF50' },
            ]}
          />
        ))}
      </View>

      {/* Stage Label */}
      <Text style={styles.stageLabel}>{stageConfig.name}</Text>

      {/* Egg Illustration */}
      <Animated.View style={[styles.eggContainer, animatedEgg]}>
        {renderEgg()}
      </Animated.View>

      {/* Circular Timer */}
      <Animated.View style={[styles.timerContainer, animatedPulse]}>
        <View style={styles.progressContainer}>
          {renderProgressRing()}
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Stage Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.badge}>{stageConfig.badge}</Text>
        <Text style={styles.description}>{stageConfig.description}</Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, { backgroundColor: stageConfig.accentColor }]}
          onPress={handleStartPause}
        >
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleReset}
        >
          <Text style={[styles.buttonText, { color: '#333' }]}>Reset</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  topBar: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 1,
  },
  stageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stageDot: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  stageLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  eggContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  timeDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#333',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  badge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    minWidth: 110,
    alignItems: 'center',
  },
  primaryButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  completionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 32,
  },
  completionSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginTop: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height,
    zIndex: 100,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: -10,
  },
  steamContainer: {
    position: 'absolute',
    top: -50,
    flexDirection: 'row',
  },
  steam: {
    width: 20,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

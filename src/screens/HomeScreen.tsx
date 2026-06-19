import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS } from '../constants/colors';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();

  // Demo data (will be replaced with AsyncStorage + real stats in later steps)
  const [dailyStreak] = useState(7);
  const [personalBests] = useState({
    classic: 12,
    survival: 24,
    twist: 9,
  });
  const [classicLevel] = useState(7); // demo current progress

  const handleClassic = () => {
    navigation.navigate('Game', { mode: 'classic' });
  };

  const handleSurvival = () => {
    navigation.navigate('Game', { mode: 'survival' });
  };

  const handleTwist = () => {
    // For now route to a twist mode (Reverse). Full twist selector comes in Step 11
    navigation.navigate('Game', { mode: 'reverse' });
  };

  const handleProfile = () => {
    navigation.navigate('Stats');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          {/* Daily Streak */}
          <View style={styles.streakContainer}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={styles.streakNumber}>{dailyStreak}</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
            </View>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>NEUROX</Text>
            <Text style={styles.logoSub}>ARCADE MEMORY</Text>
          </View>

          {/* Profile Icon */}
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={handleProfile}
            activeOpacity={0.7}
          >
            <View style={styles.profileCircle}>
              <Text style={styles.profileIcon}>👾</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* TAGLINE */}
        <Text style={styles.tagline}>WATCH • REMEMBER • REPEAT</Text>
        <Text style={styles.taglineSub}>Pure neon. Zero mercy.</Text>

        {/* MODE SELECTION */}
        <View style={styles.modesSection}>
          <Text style={styles.sectionLabel}>CHOOSE YOUR MODE</Text>

          {/* CLASSIC MODE */}
          <TouchableOpacity 
            style={[styles.modeCard, styles.classicCard]} 
            onPress={handleClassic}
            activeOpacity={0.85}
          >
            <View style={styles.modeTopRow}>
              <View>
                <Text style={[styles.modeTitle, { color: COLORS.cyan }]}>CLASSIC</Text>
                <Text style={styles.modeSubtitle}>Structured • Progressive</Text>
              </View>
              <View style={styles.pbContainer}>
                <Text style={styles.pbLabel}>PERSONAL BEST</Text>
                <Text style={[styles.pbValue, { color: COLORS.cyan }]}>{personalBests.classic}</Text>
              </View>
            </View>

            <View style={styles.modeBottomRow}>
              <Text style={styles.continueText}>
                ▶ CONTINUE FROM LEVEL {classicLevel}
              </Text>
              <View style={styles.playBadge}>
                <Text style={styles.playBadgeText}>PLAY</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* SURVIVAL MODE */}
          <TouchableOpacity 
            style={[styles.modeCard, styles.survivalCard]} 
            onPress={handleSurvival}
            activeOpacity={0.85}
          >
            <View style={styles.modeTopRow}>
              <View>
                <Text style={[styles.modeTitle, { color: COLORS.pink }]}>SURVIVAL</Text>
                <Text style={styles.modeSubtitle}>Endless • Leaderboard</Text>
              </View>
              <View style={styles.pbContainer}>
                <Text style={styles.pbLabel}>HIGH SCORE</Text>
                <Text style={[styles.pbValue, { color: COLORS.pink }]}>{personalBests.survival}</Text>
              </View>
            </View>

            <View style={styles.modeBottomRow}>
              <Text style={styles.continueText}>
                ▶ START NEW RUN
              </Text>
              <View style={[styles.playBadge, { backgroundColor: COLORS.pink + '22', borderColor: COLORS.pink }]}>
                <Text style={[styles.playBadgeText, { color: COLORS.pink }]}>PLAY</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* TWIST MODES */}
          <TouchableOpacity 
            style={[styles.modeCard, styles.twistCard]} 
            onPress={handleTwist}
            activeOpacity={0.85}
          >
            <View style={styles.modeTopRow}>
              <View>
                <Text style={[styles.modeTitle, { color: COLORS.purple }]}>TWIST MODES</Text>
                <Text style={styles.modeSubtitle}>Reverse • Ghost • Bomb + 3 more</Text>
              </View>
              <View style={styles.pbContainer}>
                <Text style={styles.pbLabel}>UNLOCKED</Text>
                <Text style={[styles.pbValue, { color: COLORS.purple }]}>3/6</Text>
              </View>
            </View>

            <View style={styles.modeBottomRow}>
              <Text style={styles.continueText}>
                ▶ BROWSE TWIST CHALLENGES
              </Text>
              <View style={[styles.playBadge, { backgroundColor: COLORS.purple + '22', borderColor: COLORS.purple }]}>
                <Text style={[styles.playBadgeText, { color: COLORS.purple }]}>PLAY</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* FOOTER HINT */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔥 Don't break your streak • One tap to play
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6600',
  },
  streakEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF6600',
    lineHeight: 22,
  },
  streakLabel: {
    fontSize: 10,
    color: '#AAAAAA',
    fontWeight: '600',
    letterSpacing: 1,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.cyan,
    letterSpacing: 6,
    textShadowColor: COLORS.cyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  logoSub: {
    fontSize: 11,
    color: '#666688',
    letterSpacing: 3,
    marginTop: -4,
    fontWeight: '600',
  },
  profileButton: {
    padding: 4,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  profileIcon: {
    fontSize: 24,
  },
  tagline: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 2,
  },
  taglineSub: {
    fontSize: 12,
    color: '#666688',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 28,
  },
  modesSection: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#8888AA',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 4,
  },
  modeCard: {
    backgroundColor: '#111122',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  classicCard: {
    borderColor: COLORS.cyan,
  },
  survivalCard: {
    borderColor: COLORS.pink,
  },
  twistCard: {
    borderColor: COLORS.purple,
  },
  modeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modeSubtitle: {
    fontSize: 13,
    color: '#8888AA',
    marginTop: 2,
    fontWeight: '500',
  },
  pbContainer: {
    alignItems: 'flex-end',
  },
  pbLabel: {
    fontSize: 10,
    color: '#666688',
    fontWeight: '700',
    letterSpacing: 1,
  },
  pbValue: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  modeBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  continueText: {
    color: '#CCCCDD',
    fontSize: 15,
    fontWeight: '600',
  },
  playBadge: {
    backgroundColor: COLORS.cyan + '22',
    borderWidth: 1,
    borderColor: COLORS.cyan,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  playBadgeText: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#555577',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
  },
});
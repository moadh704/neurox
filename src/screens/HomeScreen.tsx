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
import { COLORS, TILE_COLORS } from '../constants/colors';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();

  // Demo data (real data will come from AsyncStorage in later steps)
  const [dailyStreak] = useState(7);
  const [personalBests] = useState({
    classic: 12,
    survival: 24,
    twist: 9,
  });
  const [classicLevel] = useState(7);

  const handleClassic = () => navigation.navigate('Game', { mode: 'classic' });
  const handleSurvival = () => navigation.navigate('Game', { mode: 'survival' });
  const handleTwist = () => navigation.navigate('Game', { mode: 'reverse' }); // temp until Step 11
  const handleProfile = () => navigation.navigate('Stats');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        {/* === HEADER === */}
        <View style={styles.header}>
          {/* Streak Badge - Arcade style */}
          <View style={styles.streakBadge}>
            <Text style={styles.streakNumber}>🔥 {dailyStreak}</Text>
            <Text style={styles.streakLabel}>STREAK</Text>
          </View>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={styles.logo}>NEUROX</Text>
            <View style={styles.logoAccent} />
          </View>

          {/* Profile */}
          <TouchableOpacity onPress={handleProfile} activeOpacity={0.7}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileEmoji}>👾</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* === HERO === */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>THE NEON MEMORY ARCADE</Text>
          <Text style={styles.heroSubtitle}>Watch. Remember. Survive.</Text>
        </View>

        {/* === MODES === */}
        <View style={styles.modesWrap}>

          {/* CLASSIC - Primary mode, most important */}
          <TouchableOpacity 
            style={[styles.modeCard, styles.classicCard]} 
            onPress={handleClassic}
            activeOpacity={0.9}
          >
            <View style={styles.leftAccent} />
            
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={[styles.modeName, { color: COLORS.cyan }]}>CLASSIC</Text>
                <View style={styles.pbPill}>
                  <Text style={styles.pbPillText}>BEST {personalBests.classic}</Text>
                </View>
              </View>

              <Text style={styles.modeDesc}>Structured levels with permanent progress</Text>

              {/* Level progress hint */}
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>LEVEL {classicLevel}</Text>
                <View style={styles.dots}>
                  {[1,2,3,4,5].map((i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.dot, 
                        i <= 3 ? styles.dotActive : styles.dotInactive
                      ]} 
                    />
                  ))}
                </View>
              </View>

              <View style={styles.cardAction}>
                <Text style={[styles.actionText, { color: COLORS.cyan }]}>CONTINUE RUN →</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* SURVIVAL */}
          <TouchableOpacity 
            style={[styles.modeCard, styles.survivalCard]} 
            onPress={handleSurvival}
            activeOpacity={0.9}
          >
            <View style={[styles.leftAccent, { backgroundColor: COLORS.pink }]} />
            
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={[styles.modeName, { color: COLORS.pink }]}>SURVIVAL</Text>
                <View style={[styles.pbPill, { borderColor: COLORS.pink }]}>
                  <Text style={[styles.pbPillText, { color: COLORS.pink }]}>BEST {personalBests.survival}</Text>
                </View>
              </View>

              <Text style={styles.modeDesc}>Endless sequences • Global leaderboard</Text>

              <View style={styles.cardAction}>
                <Text style={[styles.actionText, { color: COLORS.pink }]}>START ENDLESS RUN →</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* TWIST MODES - Distinct treatment */}
          <TouchableOpacity 
            style={[styles.modeCard, styles.twistCard]} 
            onPress={handleTwist}
            activeOpacity={0.9}
          >
            <View style={[styles.leftAccent, { backgroundColor: COLORS.purple }]} />
            
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={[styles.modeName, { color: COLORS.purple }]}>TWIST MODES</Text>
                <View style={[styles.pbPill, { borderColor: COLORS.purple }]}>
                  <Text style={[styles.pbPillText, { color: COLORS.purple }]}>{personalBests.twist} RUNS</Text>
                </View>
              </View>

              <Text style={styles.modeDesc}>Reverse • Ghost • Bomb • Blind • more</Text>

              <View style={styles.twistUnlockRow}>
                <Text style={styles.twistUnlockText}>3 unlocked • 3 more at higher levels</Text>
              </View>

              <View style={styles.cardAction}>
                <Text style={[styles.actionText, { color: COLORS.purple }]}>ENTER TWIST CHAMBER →</Text>
              </View>
            </View>
          </TouchableOpacity>

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't break the streak • Play every day</Text>
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
    paddingTop: 8,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  streakBadge: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#FF6600',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  streakNumber: {
    color: '#FF6600',
    fontSize: 16,
    fontWeight: '800',
  },
  streakLabel: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.cyan,
    letterSpacing: 5,
    textShadowColor: COLORS.cyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  logoAccent: {
    width: 42,
    height: 2,
    backgroundColor: COLORS.cyan,
    marginTop: 2,
    opacity: 0.6,
  },
  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  profileEmoji: {
    fontSize: 22,
  },

  /* Hero */
  hero: {
    marginBottom: 28,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#777799',
    letterSpacing: 1,
  },

  /* Modes */
  modesWrap: {
    gap: 14,
  },
  modeCard: {
    backgroundColor: '#0f0f1f',
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
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
  leftAccent: {
    width: 5,
    backgroundColor: COLORS.cyan,
  },
  cardContent: {
    flex: 1,
    padding: 18,
    paddingLeft: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pbPill: {
    borderWidth: 1,
    borderColor: COLORS.cyan,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pbPillText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeDesc: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  progressLabel: {
    color: '#CCCCDD',
    fontSize: 13,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: COLORS.cyan,
  },
  dotInactive: {
    backgroundColor: '#333355',
  },
  cardAction: {
    marginTop: 'auto',
    paddingTop: 4,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* Twist specific */
  twistUnlockRow: {
    marginBottom: 10,
  },
  twistUnlockText: {
    color: '#777799',
    fontSize: 12,
    fontStyle: 'italic',
  },

  /* Footer */
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#555577',
    fontSize: 12,
    fontWeight: '500',
  },
});
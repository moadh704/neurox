import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const STATS_KEY = '@neurox_stats';

interface GameRun {
  date: string;
  mode: string;
  score: number;
  level?: number;
}

interface Stats {
  classicLevel: number;
  personalBests: Record<string, number>;
  totalGames: number;
  lastRuns: GameRun[];
}

export default function StatsScreen() {
  const navigation = useNavigation<NavProp>();
  const [stats, setStats] = useState<Stats>({
    classicLevel: 1,
    personalBests: { classic: 0, survival: 0 },
    totalGames: 0,
    lastRuns: [],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const saved = await AsyncStorage.getItem(STATS_KEY);
      if (saved) {
        setStats(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Failed to load stats');
    }
  };

  const saveStats = async (newStats: Stats) => {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    } catch (e) {}
  };

  // This function will be called from GameScreen later to update stats
  const updateStatsAfterGame = async (mode: string, score: number, level?: number) => {
    const newStats = { ...stats };

    newStats.totalGames += 1;

    // Update personal best
    if (!newStats.personalBests[mode] || score > newStats.personalBests[mode]) {
      newStats.personalBests[mode] = score;
    }

    // Update classic level if applicable
    if (mode === 'classic' && level && level > newStats.classicLevel) {
      newStats.classicLevel = level;
    }

    // Add to last 10 runs
    const newRun: GameRun = {
      date: new Date().toISOString(),
      mode,
      score,
      level,
    };
    newStats.lastRuns = [newRun, ...newStats.lastRuns].slice(0, 10);

    setStats(newStats);
    await saveStats(newStats);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>STATS</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Classic Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CLASSIC MODE</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Current Level</Text>
              <Text style={styles.statValue}>{stats.classicLevel}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Personal Best</Text>
              <Text style={styles.statValue}>{stats.personalBests.classic || 0}</Text>
            </View>
          </View>

          {/* Survival */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SURVIVAL MODE</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Personal Best</Text>
              <Text style={styles.statValue}>{stats.personalBests.survival || 0}</Text>
            </View>
          </View>

          {/* Overall Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OVERALL</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Games Played</Text>
              <Text style={styles.statValue}>{stats.totalGames}</Text>
            </View>
          </View>

          {/* Recent Runs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LAST 10 RUNS</Text>
            {stats.lastRuns.length > 0 ? (
              stats.lastRuns.map((run, index) => (
                <View key={index} style={styles.runRow}>
                  <Text style={styles.runMode}>{run.mode.toUpperCase()}</Text>
                  <Text style={styles.runScore}>Score: {run.score}</Text>
                  <Text style={styles.runDate}>
                    {new Date(run.date).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No runs yet. Play some games!</Text>
            )}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: COLORS.cyan,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#111122',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222244',
  },
  sectionTitle: {
    color: COLORS.cyan,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  runRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222244',
  },
  runMode: {
    color: COLORS.pink,
    fontWeight: '700',
    width: 90,
  },
  runScore: {
    color: COLORS.white,
    fontWeight: '600',
    flex: 1,
  },
  runDate: {
    color: '#666688',
    fontSize: 12,
  },
  emptyText: {
    color: '#666688',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
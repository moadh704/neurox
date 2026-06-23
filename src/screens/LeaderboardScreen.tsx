import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';
const PLAYER_NAME_KEY = '@neurox_player_name';

export default function LeaderboardScreen() {
  const navigation = useNavigation<NavProp>();
  const [playerName, setPlayerName] = useState('Player');
  const [bestLevel, setBestLevel] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const name = await AsyncStorage.getItem(PLAYER_NAME_KEY);
        if (name) setPlayerName(name);

        const level = await AsyncStorage.getItem(CLASSIC_PROGRESS_KEY);
        if (level) setBestLevel(parseInt(level));
      } catch {}
    };
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Leaderboard</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>YOUR BEST</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.name}>{playerName}</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>BEST LEVEL</Text>
                <Text style={styles.score}>{bestLevel}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.note}>
            Your highest level reached in Classic mode.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    padding: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  sectionTitle: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '600',
  },
  score: {
    color: '#5B7FE0',
    fontSize: 32,
    fontWeight: '800',
    marginTop: -4,
  },
  note: {
    color: '#666666',
    fontSize: 13,
    marginTop: 24,
    textAlign: 'center',
  },
});
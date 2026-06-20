import React, { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';
const TOTAL_LEVELS = 20;

export default function LevelsScreen() {
  const navigation = useNavigation<NavProp>();
  const [unlockedLevel, setUnlockedLevel] = useState(1);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const saved = await AsyncStorage.getItem(CLASSIC_PROGRESS_KEY);
        if (saved) setUnlockedLevel(parseInt(saved));
      } catch {}
    };
    loadProgress();
  }, []);

  const startLevel = (levelNumber: number) => {
    navigation.navigate('Game', { mode: 'classic', startLevel: levelNumber });
  };

  const renderLevel = (levelNum: number) => {
    const isUnlocked = levelNum <= unlockedLevel;
    const isCurrent = levelNum === unlockedLevel;

    return (
      <TouchableOpacity
        key={levelNum}
        style={[
          styles.levelBox,
          isCurrent && styles.currentLevel,
          !isUnlocked && styles.lockedLevel
        ]}
        onPress={() => isUnlocked && startLevel(levelNum)}
        disabled={!isUnlocked}
      >
        {isUnlocked ? (
          <Text style={[styles.levelNumber, isCurrent && styles.currentText]}>
            {levelNum}
          </Text>
        ) : (
          <Text style={styles.lockIcon}>🔒</Text>
        ))}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Levels</Text>
        <Text style={styles.subtitle}>Classic Mode</Text>

        <ScrollView contentContainerStyle={styles.grid}>
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => renderLevel(i + 1))}
        </ScrollView>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0D0D' },
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  levelBox: {
    width: 60,
    height: 60,
    backgroundColor: '#12121F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#222233',
  },
  currentLevel: {
    backgroundColor: '#00f0ff',
    borderColor: '#00f0ff',
  },
  lockedLevel: {
    backgroundColor: '#0A0A14',
    borderColor: '#222233',
  },
  levelNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  currentText: {
    color: '#000000',
    fontWeight: '800',
  },
  lockIcon: {
    fontSize: 22,
  },
  backButton: {
    marginTop: 30,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  backText: {
    color: '#888888',
    fontSize: 16,
  },
});
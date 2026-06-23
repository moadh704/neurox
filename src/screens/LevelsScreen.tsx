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
import { Ionicons } from '@expo/vector-icons';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';
const TOTAL_LEVELS = 25;

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
    const isFinal = levelNum === TOTAL_LEVELS;

    let content;
    if (isUnlocked) {
      content = (
        <Text style={[styles.levelNumber, isCurrent && styles.currentText, isFinal && styles.finalText]}>
          {levelNum}
        </Text>
      );
    } else {
      content = <Ionicons name="lock-closed" size={20} color="#555577" />;
    }

    return (
      <TouchableOpacity
        key={levelNum}
        style={[
          styles.levelBox,
          isCurrent && styles.currentLevel,
          isFinal && styles.finalLevel,
          !isUnlocked && styles.lockedLevel,
        ]}
        onPress={() => isUnlocked && startLevel(levelNum)}
        disabled={!isUnlocked}
      >
        {content}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Levels</Text>
        <Text style={styles.subtitle}>Classic Mode • 25 Levels</Text>

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
    backgroundColor: '#5B7FE0',
    borderColor: '#5B7FE0',
  },
  finalLevel: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    borderWidth: 3,
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
    color: '#FFFFFF',
    fontWeight: '800',
  },
  finalText: {
    color: '#000000',
    fontWeight: '900',
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
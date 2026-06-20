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

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [currentLevel, setCurrentLevel] = useState(1);

  // Load real progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const saved = await AsyncStorage.getItem(CLASSIC_PROGRESS_KEY);
        if (saved) setCurrentLevel(parseInt(saved));
      } catch {}
    };
    loadProgress();
  }, []);

  const goToMode = (mode: 'classic' | 'survival' | 'twist') => {
    navigation.navigate('Game', { mode });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header - clean like Arrows */}
        <View style={styles.header}>
          <Text style={styles.logo}>NEUROX</Text>
          <Text style={styles.levelText}>Level {currentLevel}</Text>
        </View>

        {/* Mode Selection - clean cards */}
        <View style={styles.modesContainer}>
          <TouchableOpacity style={styles.modeCard} onPress={() => goToMode('classic')}>
            <Text style={styles.modeTitle}>Classic</Text>
            <Text style={styles.modeDesc}>Progressive levels with lives</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeCard} onPress={() => goToMode('survival')}>
            <Text style={styles.modeTitle}>Survival</Text>
            <Text style={styles.modeDesc}>Endless run, beat your score</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeCard} onPress={() => goToMode('twist')}>
            <Text style={styles.modeTitle}>Twist Modes</Text>
            <Text style={styles.modeDesc}>Reverse, Ghost, Bomb & more</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={styles.navLabelActive}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Game', { mode: 'classic' })}
          >
            <Text style={styles.navIcon}>🔒</Text>
            <Text style={styles.navLabel}>Levels</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.navIcon}>⚙️</Text>
            <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0D0D' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: { alignItems: 'center' },
  logo: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  levelText: {
    fontSize: 17,
    color: '#888888',
    marginTop: 6,
    fontWeight: '600',
  },
  modesContainer: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 14,
  },
  modeCard: {
    backgroundColor: '#12121F',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222233',
  },
  modeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  modeDesc: {
    color: '#888888',
    fontSize: 14,
    marginTop: 6,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#222233',
  },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 22, marginBottom: 3 },
  navLabel: { color: '#888888', fontSize: 12, fontWeight: '600' },
  navLabelActive: { color: '#00f0ff', fontSize: 12, fontWeight: '700' },
});
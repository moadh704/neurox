import React from 'react';
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

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();

  // TODO: Get real current level from storage later
  const currentLevel = 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo / Title - clean and centered like Arrows */}
        <View style={styles.header}>
          <Text style={styles.logo}>NEUROX</Text>
          <Text style={styles.levelText}>Level {currentLevel}</Text>
        </View>

        {/* Big Play button - prominent like Arrows */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => navigation.navigate('Game', { mode: 'classic' })}
        >
          <Text style={styles.playText}>Play</Text>
        </TouchableOpacity>

        {/* Bottom navigation placeholder - clean style */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🔒</Text>
            <Text style={styles.navLabel}>Levels</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
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
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  levelText: {
    fontSize: 18,
    color: '#888888',
    marginTop: 8,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 80,
    paddingVertical: 18,
    borderRadius: 40,
    marginTop: 60,
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222233',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  navLabel: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },
});
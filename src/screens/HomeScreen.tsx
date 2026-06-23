import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';
const PLAYER_NAME_KEY = '@neurox_player_name';

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [playerName, setPlayerName] = useState<string>('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedLevel = await AsyncStorage.getItem(CLASSIC_PROGRESS_KEY);
        if (savedLevel) setCurrentLevel(parseInt(savedLevel));

        const savedName = await AsyncStorage.getItem(PLAYER_NAME_KEY);
        if (savedName) {
          setPlayerName(savedName);
        } else {
          setTimeout(() => setShowNameModal(true), 600);
        }
      } catch {}
    };
    loadData();
  }, []);

  const savePlayerName = async () => {
    const trimmed = tempName.trim();
    if (trimmed.length < 2) return;

    try {
      await AsyncStorage.setItem(PLAYER_NAME_KEY, trimmed);
      setPlayerName(trimmed);
      setShowNameModal(false);
      setTempName('');
    } catch {}
  };

  const startGame = () => {
    navigation.navigate('Game', { mode: 'classic' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>NEUROX</Text>
          {playerName ? (
            <Text style={styles.welcomeText}>Hey, {playerName}</Text>
          ) : null}
          <Text style={styles.levelText}>Level {currentLevel}</Text>
        </View>

        <View style={styles.playContainer}>
          <TouchableOpacity style={styles.playButton} onPress={startGame}>
            <Text style={styles.playText}>Play</Text>
            <Text style={styles.playSubtext}>Classic Memory Sequence</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <Ionicons name="home" size={22} color="#00f0ff" />
            <Text style={styles.navLabelActive}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Levels')}
          >
            <Ionicons name="list" size={22} color="#888888" />
            <Text style={styles.navLabel}>Levels</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Ionicons name="trophy-outline" size={22} color="#888888" />
            <Text style={styles.navLabel}>Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={22} color="#888888" />
            <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* First Time Name Modal */}
      <Modal
        visible={showNameModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Welcome to Neurox</Text>
            <Text style={styles.modalSubtitle}>What should we call you?</Text>

            <TextInput
              style={styles.nameInput}
              placeholder="Your name"
              placeholderTextColor="#666666"
              value={tempName}
              onChangeText={setTempName}
              maxLength={16}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={savePlayerName}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={savePlayerName}
              disabled={tempName.trim().length < 2}
            >
              <Text style={styles.saveButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  welcomeText: {
    fontSize: 16,
    color: '#5B7FE0',
    marginTop: 8,
    fontWeight: '600',
  },
  levelText: {
    fontSize: 17,
    color: '#888888',
    marginTop: 6,
    fontWeight: '600',
  },
  playContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  playButton: {
    backgroundColor: '#5B7FE0',
    width: '100%',
    paddingVertical: 28,
    borderRadius: 20,
    alignItems: 'center',
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  playSubtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    marginTop: 6,
    fontWeight: '600',
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
  navLabel: { color: '#888888', fontSize: 12, fontWeight: '600' },
  navLabelActive: { color: '#00f0ff', fontSize: 12, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    padding: 28,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#AAAAAA',
    fontSize: 15,
    marginBottom: 24,
  },
  nameInput: {
    backgroundColor: '#111111',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#5B7FE0',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
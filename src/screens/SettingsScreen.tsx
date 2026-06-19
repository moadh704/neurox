import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSoundEnabled } from '../hooks/useSound';
import { setHapticsEnabled } from '../hooks/useHaptics';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const SETTINGS_KEY = '@neurox_settings';

interface Settings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  selectedTheme: string;
}

export default function SettingsScreen() {
  const navigation = useNavigation<NavProp>();
  const [settings, setSettings] = useState<Settings>({
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
    selectedTheme: 'default',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        setSoundEnabled(parsed.soundEnabled);
        setHapticsEnabled(parsed.hapticsEnabled);
      }
    } catch (e) {}
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {}
  };

  const updateSetting = async (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);

    if (key === 'soundEnabled') {
      setSoundEnabled(value);
    }
    if (key === 'hapticsEnabled') {
      setHapticsEnabled(value);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>SETTINGS</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.content}>
          {/* Sound Toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSetting('soundEnabled', value)}
              trackColor={{ false: '#333355', true: COLORS.cyan }}
              thumbColor={settings.soundEnabled ? '#FFFFFF' : '#888888'}
            />
          </View>

          {/* Haptics Toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(value) => updateSetting('hapticsEnabled', value)}
              trackColor={{ false: '#333355', true: COLORS.cyan }}
              thumbColor={settings.hapticsEnabled ? '#FFFFFF' : '#888888'}
            />
          </View>

          {/* Notifications Toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => updateSetting('notificationsEnabled', value)}
              trackColor={{ false: '#333355', true: COLORS.cyan }}
              thumbColor={settings.notificationsEnabled ? '#FFFFFF' : '#888888'}
            />
          </View>

          {/* Theme Selector (Placeholder) */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Color Theme</Text>
            <TouchableOpacity style={styles.themeButton}>
              <Text style={styles.themeText}>{settings.selectedTheme}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              More themes and grid types will unlock as you progress in Classic Mode.
            </Text>
          </View>
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
  content: {
    flex: 1,
    paddingTop: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111122',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222244',
  },
  settingLabel: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
  },
  themeButton: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cyan,
  },
  themeText: {
    color: COLORS.cyan,
    fontWeight: '700',
  },
  infoBox: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#111122',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333355',
  },
  infoText: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
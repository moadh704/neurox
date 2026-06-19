import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NEUROX</Text>
      <Text style={styles.subtitle}>Dark Neon Memory Arcade</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.modeButton}
          onPress={() => navigation.navigate('Game', { mode: 'classic' })}
        >
          <Text style={styles.buttonText}>CLASSIC MODE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.modeButton}
          onPress={() => navigation.navigate('Game', { mode: 'survival' })}
        >
          <Text style={styles.buttonText}>SURVIVAL MODE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.modeButton}
          onPress={() => navigation.navigate('Stats')}
        >
          <Text style={styles.buttonText}>STATS</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.settingsText}>⚙ SETTINGS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 60,
    letterSpacing: 2,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  modeButton: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#00FFFF',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  settingsButton: {
    position: 'absolute',
    bottom: 40,
    padding: 12,
  },
  settingsText: {
    color: '#888888',
    fontSize: 14,
  },
});
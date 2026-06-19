import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;

export default function GameScreen() {
  const route = useRoute<GameRouteProp>();
  const { mode } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GAME SCREEN</Text>
      <Text style={styles.mode}>Mode: {mode.toUpperCase()}</Text>
      <Text style={styles.placeholder}>[Grid and game logic will be implemented in Step 3]</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  mode: {
    fontSize: 18,
    color: '#00FFFF',
    marginBottom: 40,
  },
  placeholder: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
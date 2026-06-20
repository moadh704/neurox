import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS, TILE_COLORS } from '../constants/colors';
import Tile from '../components/Tile';
import AsyncStorage from '@react-native-async-storage/async-storage';

type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

const GRID_SIZE = 3;
const TILE_SIZE = 92;
const MAX_LIVES = 3;

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';

const getFlashTiming = (level: number) => {
  if (level <= 5) return { flashDuration: 380, gap: 140 };
  if (level <= 12) return { flashDuration: 260, gap: 90 };
  return { flashDuration: 150, gap: 55 };
};

export default function GameScreen() {
  const route = useRoute<GameRouteProp>();
  const navigation = useNavigation<NavProp>();
  const { mode } = route.params;

  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'watching' | 'playing' | 'roundComplete' | 'gameOver'>('idle');
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lives, setLives] = useState(MAX_LIVES);

  const addNewTileToSequence = useCallback(() => {
    const randomTile = Math.floor(Math.random() * 9);
    setSequence(prev => [...prev, randomTile]);
  }, []);

  const playSequence = useCallback(async (seq: number[], currentLevel: number) => {
    const { flashDuration, gap } = getFlashTiming(currentLevel);
    setGameState('watching');
    setIsProcessing(true);
    setUserInput([]);

    for (let i = 0; i < seq.length; i++) {
      setActiveTile(seq[i]);
      await new Promise(r => setTimeout(r, flashDuration));
      setActiveTile(null);
      if (i < seq.length - 1) await new Promise(r => setTimeout(r, gap));
    }
    setActiveTile(null);
    setIsProcessing(false);
    setGameState('playing');
  }, []);

  const loseLife = useCallback(() => {
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      setGameState('gameOver');
      setIsProcessing(true);
    }
  }, [lives]);

  const startNewRound = useCallback(async (startingLevel?: number) => {
    const currentLevel = startingLevel || level;
    let newSeq: number[] = [];
    for (let i = 0; i < currentLevel; i++) {
      newSeq.push(Math.floor(Math.random() * 9));
    }
    setSequence(newSeq);
    setLevel(currentLevel);
    setLives(MAX_LIVES);
    await new Promise(r => setTimeout(r, 200));
    await playSequence(newSeq, currentLevel);
  }, [level, playSequence]);

  useEffect(() => {
    const init = async () => {
      if (mode === 'classic') {
        try {
          const saved = await AsyncStorage.getItem(CLASSIC_PROGRESS_KEY);
          const startLevel = saved ? parseInt(saved) : 1;
          setTimeout(() => startNewRound(startLevel), 300);
        } catch {
          setTimeout(() => startNewRound(1), 300);
        }
      } else {
        setTimeout(() => startNewRound(1), 300);
      }
    };
    init();
  }, []);

  const handleTilePress = useCallback((tileId: number) => {
    if (gameState !== 'playing' || isProcessing) return;

    const newInput = [...userInput, tileId];
    setUserInput(newInput);

    const currentIndex = newInput.length - 1;

    if (sequence[currentIndex] !== tileId) {
      setWrongTile(tileId);
      setIsProcessing(true);

      setTimeout(() => {
        setWrongTile(null);
        loseLife();
        if (lives - 1 > 0) {
          setUserInput([]);
          setGameState('playing');
          setIsProcessing(false);
        }
      }, 500);
      return;
    }

    if (newInput.length === sequence.length) {
      setGameState('roundComplete');
      setIsProcessing(true);

      setTimeout(() => {
        setUserInput([]);
        setGameState('idle');
        setIsProcessing(false);
        startNewRound(level + 1);
      }, 650);
    }
  }, [gameState, isProcessing, userInput, sequence, startNewRound, loseLife, lives, level]);

  const resetGame = () => {
    setSequence([]);
    setUserInput([]);
    setGameState('idle');
    setActiveTile(null);
    setWrongTile(null);
    setLevel(1);
    setIsProcessing(false);
    setLives(MAX_LIVES);
    setTimeout(() => startNewRound(1), 200);
  };

  // Render lives as small glowing dots
  const renderLives = () => {
    return (
      <View style={styles.livesContainer}>
        {Array.from({ length: MAX_LIVES }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.lifeDot,
              {
                backgroundColor: index < lives ? COLORS.cyan : '#1a1a2e',
                borderColor: index < lives ? COLORS.cyan : '#333355',
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderGrid = () => {
    const tiles = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      const rowTiles = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        const id = row * GRID_SIZE + col;
        rowTiles.push(
          <Tile
            key={id}
            id={id}
            color={TILE_COLORS[id]}
            isActive={activeTile === id}
            isWrong={wrongTile === id}
            disabled={gameState !== 'playing' || isProcessing || gameState === 'gameOver'}
            onPress={handleTilePress}
            size={TILE_SIZE}
          />
        );
      }
      tiles.push(<View key={row} style={styles.row}>{rowTiles}</View>);
    }
    return tiles;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: '#888' }}>← HOME</Text>
          </TouchableOpacity>
          <Text style={styles.statusText}>
            {gameState === 'gameOver' ? 'GAME OVER' : gameState.toUpperCase()}
          </Text>
          <TouchableOpacity onPress={resetGame}>
            <Text style={{ color: '#888' }}>RESET</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>{renderGrid()}</View>

        {/* Level - bigger and cleaner */}
        <Text style={styles.levelText}>LEVEL {level}</Text>

        {/* Lives as glowing dots */}
        <View style={styles.livesSection}>
          <Text style={styles.livesLabel}>LIVES</Text>
          {renderLives()}
        </View>

        {gameState === 'gameOver' && (
          <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
            <Text style={{ color: 'white', fontSize: 18 }}>TRY AGAIN</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0a14' },
  container: { flex: 1, alignItems: 'center', paddingTop: 40 },
  topBar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  statusText: { color: '#00f0ff', fontSize: 18, fontWeight: 'bold' },
  gridContainer: { backgroundColor: '#111122', padding: 16, borderRadius: 20 },
  row: { flexDirection: 'row' },
  levelText: { color: '#00f0ff', fontSize: 22, fontWeight: '800', marginTop: 24 },
  livesSection: { marginTop: 20, alignItems: 'center' },
  livesLabel: { color: '#666688', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  livesContainer: { flexDirection: 'row', gap: 14 },
  lifeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  retryButton: { marginTop: 40, backgroundColor: '#00f0ff', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 },
});
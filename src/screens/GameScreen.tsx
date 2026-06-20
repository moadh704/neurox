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
const TILE_SIZE = 90;
const MAX_LIVES = 3;

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';

const getFlashTiming = (level: number) => {
  if (level <= 5) return { flashDuration: 380, gap: 140 };
  if (level <= 12) return { flashDuration: 260, gap: 90 };
  return { flashDuration: 160, gap: 60 };
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

  // Hearts for lives - exactly like Arrows screenshot
  const renderLives = () => {
    return (
      <View style={styles.livesContainer}>
        {Array.from({ length: MAX_LIVES }).map((_, index) => (
          <Text key={index} style={styles.heart}>
            {index < lives ? '❤️' : '♡'}
          </Text>
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
        {/* Top Bar - very minimal like Arrows */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.topIcon}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetGame} style={{ marginLeft: 16 }}>
              <Text style={styles.topIcon}>↻</Text>
            </TouchableOpacity>
          </View>

          {/* Hearts on the right - exactly like Arrows */}
          <View style={styles.topRight}>
            {renderLives()}
          </View>
        </View>

        {/* Grid - centered and clean */}
        <View style={styles.gridWrapper}>
          <View style={styles.gridContainer}>{renderGrid()}</View>
        </View>

        {/* Level indicator - minimal */}
        <Text style={styles.levelText}>Level {level}</Text>

        {gameState === 'gameOver' && (
          <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0D0D' },
  container: { flex: 1, alignItems: 'center', paddingTop: 20 },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center' },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  topIcon: { color: '#888888', fontSize: 26, fontWeight: '300' },
  gridWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gridContainer: {
    backgroundColor: '#12121F',
    padding: 16,
    borderRadius: 20,
  },
  row: { flexDirection: 'row' },
  levelText: {
    color: '#666688',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 32,
    letterSpacing: 1,
  },
  livesContainer: { flexDirection: 'row', gap: 6 },
  heart: { fontSize: 22 },
  retryButton: {
    marginTop: 40,
    backgroundColor: '#00f0ff',
    paddingHorizontal: 44,
    paddingVertical: 14,
    borderRadius: 28,
  },
  retryText: { color: '#000000', fontSize: 17, fontWeight: '700' },
});
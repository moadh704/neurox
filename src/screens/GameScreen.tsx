import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

const GRID_SIZE = 3;
const TILE_SIZE = 92;
const MAX_LIVES = 3;

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';

// Preload sounds for better performance
const soundFiles = {
  tile: require('../../assets/sounds/tile.mp3'),
  wrong: require('../../assets/sounds/wrong.mp3'),
  success: require('../../assets/sounds/success.mp3'),
  gameover: require('../../assets/sounds/gameover.mp3'),
};

let soundObjects: { [key: string]: Audio.Sound } = {};

const loadSounds = async () => {
  try {
    for (const [key, file] of Object.entries(soundFiles)) {
      const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: false });
      soundObjects[key] = sound;
    }
  } catch (e) {
    console.log('Sound loading error:', e);
  }
};

const playSound = async (type: 'tile' | 'wrong' | 'success' | 'gameover') => {
  try {
    if (soundObjects[type]) {
      await soundObjects[type].replayAsync();
    }
  } catch (e) {
    console.log('Play sound error:', e);
  }
};

const getFlashTiming = (level: number) => {
  if (level <= 5) return { flashDuration: 420, gap: 160 };
  if (level <= 12) return { flashDuration: 280, gap: 100 };
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

  // Load sounds once when component mounts
  useEffect(() => {
    loadSounds();
    return () => {
      // Unload sounds when leaving screen
      Object.values(soundObjects).forEach(sound => sound.unloadAsync());
    };
  }, []);

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
      playSound('gameover');
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
    await new Promise(r => setTimeout(r, 250));
    await playSequence(newSeq, currentLevel);
  }, [level, playSequence]);

  useEffect(() => {
    const init = async () => {
      if (mode === 'classic') {
        try {
          const saved = await AsyncStorage.getItem(CLASSIC_PROGRESS_KEY);
          const startLevel = saved ? parseInt(saved) : 1;
          setTimeout(() => startNewRound(startLevel), 350);
        } catch {
          setTimeout(() => startNewRound(1), 350);
        }
      } else {
        setTimeout(() => startNewRound(1), 350);
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
      playSound('wrong');

      setTimeout(() => {
        setWrongTile(null);
        loseLife();
        if (lives - 1 > 0) {
          setUserInput([]);
          setGameState('playing');
          setIsProcessing(false);
        }
      }, 550);
      return;
    }

    playSound('tile');

    if (newInput.length === sequence.length) {
      setGameState('roundComplete');
      setIsProcessing(true);

      setTimeout(() => {
        playSound('success');
        setUserInput([]);
        setGameState('idle');
        setIsProcessing(false);
        startNewRound(level + 1);
      }, 700);
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
    setTimeout(() => startNewRound(1), 250);
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

        <Text style={styles.levelText}>LEVEL {level}</Text>
        <Text style={styles.livesText}>LIVES: {lives}</Text>

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
  levelText: { color: '#888', fontSize: 16, marginTop: 30 },
  livesText: { color: '#888', fontSize: 16, marginTop: 8 },
  retryButton: { marginTop: 40, backgroundColor: '#00f0ff', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 },
});
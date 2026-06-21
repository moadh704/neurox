import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS, TILE_COLORS } from '../constants/colors';
import Tile from '../components/Tile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

const GRID_SIZE = 3;
const TILE_SIZE = 96;
type GameState = 'idle' | 'watching' | 'playing' | 'levelComplete' | 'gameOver';

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';

const getFlashTiming = (level: number) => {
  if (level <= 5) return { flashDuration: 350, gap: 120 };
  if (level <= 12) return { flashDuration: 230, gap: 80 };
  return { flashDuration: 145, gap: 50 };
};

export default function GameScreen() {
  const route = useRoute<GameRouteProp>();
  const navigation = useNavigation<NavProp>();
  const { mode } = route.params;

  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lives, setLives] = useState(3);
  const [showLevelCompleteUI, setShowLevelCompleteUI] = useState(false);

  const gridShake = useRef(new Animated.Value(0)).current;
  const successPulse = useRef(new Animated.Value(1)).current;

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
    setLives(3);
    setShowLevelCompleteUI(false);
    await new Promise(r => setTimeout(r, 160));
    await playSequence(newSeq, currentLevel);
  }, [level, playSequence]);

  useEffect(() => {
    const init = async () => {
      if (mode === 'classic') {
        try {
          const saved = await AsyncStorage.getItem(CLASSIC_PROGRESS_KEY);
          const startLevel = saved ? parseInt(saved) : 1;
          setTimeout(() => startNewRound(startLevel), 260);
        } catch {
          setTimeout(() => startNewRound(1), 260);
        }
      } else {
        setTimeout(() => startNewRound(1), 260);
      }
    };
    init();
  }, []);

  const playLevelCompleteWave = async () => {
    setShowLevelCompleteUI(false);

    const waveOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    for (let i = 0; i < waveOrder.length; i++) {
      setActiveTile(waveOrder[i]);
      await new Promise(r => setTimeout(r, 70));
    }

    setActiveTile(null);

    setTimeout(() => {
      setShowLevelCompleteUI(true);
    }, 150);
  };

  const triggerWrongFeedback = () => {
    Animated.sequence([
      Animated.timing(gridShake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(gridShake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(gridShake, { toValue: 8, duration: 45, useNativeDriver: true }),
      Animated.timing(gridShake, { toValue: -8, duration: 45, useNativeDriver: true }),
      Animated.timing(gridShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const triggerSuccessPulse = () => {
    Animated.sequence([
      Animated.timing(successPulse, { toValue: 1.12, duration: 90, useNativeDriver: true }),
      Animated.timing(successPulse, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const handleTilePress = useCallback((tileId: number) => {
    if (gameState !== 'playing' || isProcessing) return;

    const newInput = [...userInput, tileId];
    setUserInput(newInput);

    const currentIndex = newInput.length - 1;

    if (sequence[currentIndex] !== tileId) {
      setWrongTile(tileId);
      setIsProcessing(true);
      triggerWrongFeedback();

      setTimeout(() => {
        setWrongTile(null);
        loseLife();
        if (lives - 1 > 0) {
          setUserInput([]);
          setGameState('playing');
          setIsProcessing(false);
        }
      }, 420);
      return;
    }

    if (newInput.length === sequence.length) {
      setGameState('levelComplete');
      setIsProcessing(true);
      triggerSuccessPulse();
      playLevelCompleteWave();

      if (mode === 'classic') {
        AsyncStorage.setItem(CLASSIC_PROGRESS_KEY, String(level + 1));
      }
    }
  }, [gameState, isProcessing, userInput, sequence, loseLife, lives, level, mode]);

  const goToNextLevel = () => {
    setUserInput([]);
    setGameState('idle');
    setIsProcessing(false);
    setShowLevelCompleteUI(false);
    startNewRound(level + 1);
  };

  const resetGame = () => {
    setSequence([]);
    setUserInput([]);
    setGameState('idle');
    setActiveTile(null);
    setWrongTile(null);
    setLevel(1);
    setIsProcessing(false);
    setLives(3);
    setShowLevelCompleteUI(false);
    setTimeout(() => startNewRound(1), 160);
  };

  const renderLives = () => {
    return (
      <View style={styles.livesContainer}>
        {[1, 2, 3].map((i) => (
          <Ionicons
            key={i}
            name={i <= lives ? 'heart' : 'heart-outline'}
            size={22}
            color={i <= lives ? '#FF3B5C' : '#555577'}
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
        {/* Tighter top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#888888" />
          </TouchableOpacity>

          <Text style={styles.levelInBar}>LEVEL {level}</Text>

          {renderLives()}
        </View>

        <View style={styles.content}>
          <Animated.View style={[styles.gridWrapper, { transform: [{ translateX: gridShake }] }]}>
            <Animated.View style={[styles.gridContainer, { transform: [{ scale: successPulse }] }]}>
              {renderGrid()}
            </Animated.View>
          </Animated.View>

          {gameState === 'levelComplete' && showLevelCompleteUI && (
            <View style={styles.levelCompleteContainer}>
              <Text style={styles.levelCompleteTitle}>Level Complete!</Text>
              <TouchableOpacity style={styles.nextButton} onPress={goToNextLevel}>
                <Text style={styles.nextText}>Next Level</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'gameOver' && (
            <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0D0D' },
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,      // reduced
    paddingBottom: 6,   // reduced
  },
  levelInBar: { color: '#00f0ff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  livesContainer: { flexDirection: 'row', gap: 8, alignItems: 'center' },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  gridWrapper: { marginBottom: 20 },
  gridContainer: {
    backgroundColor: '#111122',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#222233',
  },
  row: { flexDirection: 'row' },

  levelCompleteContainer: { alignItems: 'center', marginTop: 8 },
  levelCompleteTitle: { color: '#00f0ff', fontSize: 23, fontWeight: '800', marginBottom: 14 },
  nextButton: { backgroundColor: '#00f0ff', paddingHorizontal: 44, paddingVertical: 13, borderRadius: 26 },
  nextText: { color: '#000000', fontSize: 16, fontWeight: '700' },

  retryButton: { marginTop: 16, backgroundColor: '#00f0ff', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 24 },
  retryText: { color: '#000000', fontSize: 15, fontWeight: '700' },
});
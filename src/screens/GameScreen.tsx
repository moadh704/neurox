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
import { COLORS, TILE_COLORS, TILE_NAMES } from '../constants/colors';
import Tile from '../components/Tile';
import { useSound } from '../hooks/useSound';
import { useHaptics } from '../hooks/useHaptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

const GRID_SIZE = 3;
const TILE_SIZE = 92;
const MAX_LIVES = 3;

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';

// Speed scaling for flashing
const getFlashTiming = (level: number) => {
  if (level <= 5) {
    return { flashDuration: 520, gap: 200 };      // Slow
  } else if (level <= 12) {
    return { flashDuration: 360, gap: 130 };     // Medium
  } else {
    return { flashDuration: 200, gap: 70 };      // Fast
  }
};

export default function GameScreen() {
  const route = useRoute<GameRouteProp>();
  const navigation = useNavigation<NavProp>();
  const { mode } = route.params;

  const { playTileSound, playWrong, playRoundComplete, playGameOver } = useSound();
  const { lightImpact, mediumImpact, heavyImpact, success, error: hapticError } = useHaptics();

  // Core game state
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'watching' | 'playing' | 'roundComplete' | 'wrong' | 'gameOver'>('idle');
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lives, setLives] = useState(MAX_LIVES);
  const [personalBest, setPersonalBest] = useState(0);
  const [showNewBest, setShowNewBest] = useState(false);

  // Generate a new random tile and add to sequence
  const addNewTileToSequence = useCallback(() => {
    const randomTile = Math.floor(Math.random() * 9);
    setSequence(prev => [...prev, randomTile]);
  }, []);

  // Play the current sequence with flashing animations (speed depends on level)
  const playSequence = useCallback(async (seq: number[], currentLevel: number = level) => {
    const { flashDuration, gap } = getFlashTiming(currentLevel);

    setGameState('watching');
    setIsProcessing(true);
    setUserInput([]);

    for (let i = 0; i < seq.length; i++) {
      const tileId = seq[i];
      setActiveTile(tileId);
      await new Promise(resolve => setTimeout(resolve, flashDuration));
      setActiveTile(null);
      if (i < seq.length - 1) {
        await new Promise(resolve => setTimeout(resolve, gap));
      }
    }

    setActiveTile(null);
    setIsProcessing(false);
    setGameState('playing');
  }, [level]);

  // Lose a life
  const loseLife = useCallback(() => {
    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      setGameState('gameOver');
      setIsProcessing(true);
      playGameOver();
      hapticError();
      heavyImpact();

      if (sequence.length > personalBest) {
        setPersonalBest(sequence.length);
        setShowNewBest(true);
      }
    }
  }, [lives, playGameOver, hapticError, heavyImpact, sequence.length, personalBest]);

  // Start a new round / level
  const startNewRound = useCallback(async (startingLevel?: number) => {
    const currentLevel = startingLevel || level;

    if (sequence.length === 0) {
      let newSeq: number[] = [];
      for (let i = 0; i < currentLevel; i++) {
        newSeq.push(Math.floor(Math.random() * 9));
      }
      setSequence(newSeq);
      setLevel(currentLevel);
      setLives(MAX_LIVES);
      await new Promise(resolve => setTimeout(resolve, 300));
      await playSequence(newSeq, currentLevel);
    } else {
      addNewTileToSequence();
      const newLevel = currentLevel + 1;
      setLevel(newLevel);

      if (mode === 'classic') {
        try {
          await AsyncStorage.setItem(CLASSIC_PROGRESS_KEY, newLevel.toString());
        } catch (e) {}
      }

      await new Promise(resolve => setTimeout(resolve, 400));
      await playSequence([...sequence, sequence[sequence.length - 1]], newLevel);
    }
  }, [sequence, level, addNewTileToSequence, playSequence, mode]);

  const loadClassicProgress = async () => {
    if (mode === 'classic') {
      try {
        const savedLevel = await AsyncStorage.getItem(CLASSIC_PROGRESS_KEY);
        if (savedLevel) {
          const parsed = parseInt(savedLevel, 10);
          setLevel(Math.max(1, parsed));
          return parsed;
        }
      } catch (e) {
        console.log('Failed to load classic progress');
      }
    }
    return 1;
  };

  useEffect(() => {
    const initGame = async () => {
      if (mode === 'classic') {
        const startingLevel = await loadClassicProgress();
        setTimeout(() => {
          startNewRound(startingLevel);
        }, 600);
      } else {
        setTimeout(() => {
          startNewRound(1);
        }, 600);
      }
    };
    initGame();
  }, []);

  const resetGame = () => {
    setSequence([]);
    setUserInput([]);
    setGameState('idle');
    setActiveTile(null);
    setWrongTile(null);
    setLevel(1);
    setIsProcessing(false);
    setLives(MAX_LIVES);
    setShowNewBest(false);

    setTimeout(() => {
      startNewRound();
    }, 300);
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
            ghostMode={mode === 'ghost' && gameState === 'playing'}
          />
        );
      }
      tiles.push(
        <View key={row} style={styles.row}>
          {rowTiles}
        </View>
      );
    }
    return tiles;
  };

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
                shadowColor: index < lives ? COLORS.cyan : 'transparent',
                shadowOpacity: index < lives ? 0.9 : 0,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const getStatusText = () => {
    if (gameState === 'gameOver') return 'GAME OVER';
    switch (gameState) {
      case 'watching': return 'WATCH CAREFULLY...';
      case 'playing': return 'YOUR TURN';
      case 'roundComplete': return 'NICE!';
      case 'wrong': return 'WRONG!';
      default: return mode.toUpperCase();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← HOME</Text>
          </TouchableOpacity>

          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, gameState === 'gameOver' && { color: COLORS.error }]}>{getStatusText()}</Text>
            <Text style={styles.roundText}>LEVEL {level}</Text>
          </View>

          <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
            <Text style={styles.resetText}>RESET</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          {renderGrid()}
        </View>

        <View style={styles.livesSection}>
          <Text style={styles.livesLabel}>LIVES</Text>
          {renderLives()}
        </View>

        <View style={styles.bottomInfo}>
          <Text style={styles.sequenceLength}>
            {mode === 'survival' ? 'SCORE' : 'SEQUENCE'}: {sequence.length}
          </Text>
          {gameState === 'playing' && (
            <Text style={styles.inputProgress}>
              {userInput.length} / {sequence.length}
            </Text>
          )}
        </View>

        {gameState === 'gameOver' && (
          <View style={styles.gameOverOverlay}>
            <Text style={styles.gameOverTitle}>GAME OVER</Text>

            {showNewBest && (
              <View style={styles.newBestBadge}>
                <Text style={styles.newBestText}>★ NEW BEST! ★</Text>
              </View>
            )}

            <Text style={styles.gameOverScore}>
              Score: {sequence.length}
            </Text>
            {personalBest > 0 && (
              <Text style={styles.personalBestText}>
                Personal Best: {personalBest}
              </Text>
            )}

            <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
              <Text style={styles.retryText}>TRY AGAIN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeButton} onPress={() => navigation.goBack()}>
              <Text style={styles.homeText}>BACK TO HOME</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.devNote}>Step 11 • Twist Modes</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    color: COLORS.cyan,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  roundText: {
    color: '#666688',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333355',
  },
  resetText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '700',
  },
  gridContainer: {
    backgroundColor: '#0a0a14',
    padding: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#222244',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  livesSection: {
    marginTop: 28,
    alignItems: 'center',
  },
  livesLabel: {
    color: '#666688',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  lifeDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 6,
  },
  bottomInfo: {
    marginTop: 20,
    alignItems: 'center',
    gap: 4,
  },
  sequenceLength: {
    color: '#666688',
    fontSize: 14,
  },
  inputProgress: {
    color: COLORS.cyan,
    fontSize: 15,
    fontWeight: '700',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gameOverTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.error,
    letterSpacing: 4,
    marginBottom: 12,
  },
  gameOverScore: {
    fontSize: 18,
    color: '#CCCCDD',
    marginBottom: 40,
  },
  retryButton: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 16,
  },
  retryText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  homeButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  homeText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '600',
  },
  newBestBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  newBestText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  personalBestText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 24,
  },
  devNote: {
    position: 'absolute',
    bottom: 16,
    color: '#333355',
    fontSize: 11,
  },
});
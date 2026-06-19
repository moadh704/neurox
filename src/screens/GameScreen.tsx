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

type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

const GRID_SIZE = 3;
const TILE_SIZE = 92;
const MAX_LIVES = 3;

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
  const [round, setRound] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lives, setLives] = useState(MAX_LIVES);

  // Generate a new random tile and add to sequence
  const addNewTileToSequence = useCallback(() => {
    const randomTile = Math.floor(Math.random() * 9);
    setSequence(prev => [...prev, randomTile]);
  }, []);

  // Play the current sequence with flashing animations
  const playSequence = useCallback(async (seq: number[]) => {
    setGameState('watching');
    setIsProcessing(true);
    setUserInput([]);

    for (let i = 0; i < seq.length; i++) {
      const tileId = seq[i];
      setActiveTile(tileId);
      await new Promise(resolve => setTimeout(resolve, 420));
      setActiveTile(null);
      if (i < seq.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 180));
      }
    }

    setActiveTile(null);
    setIsProcessing(false);
    setGameState('playing');
  }, []);

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
    }
  }, [lives, playGameOver, hapticError, heavyImpact]);

  // Start a new round
  const startNewRound = useCallback(async () => {
    if (sequence.length === 0) {
      const firstTile = Math.floor(Math.random() * 9);
      const newSeq = [firstTile];
      setSequence(newSeq);
      setRound(1);
      setLives(MAX_LIVES);
      await new Promise(resolve => setTimeout(resolve, 300));
      await playSequence(newSeq);
    } else {
      addNewTileToSequence();
      const newRound = round + 1;
      setRound(newRound);
      await new Promise(resolve => setTimeout(resolve, 400));
      await playSequence([...sequence, sequence[sequence.length - 1]]);
    }
  }, [sequence, round, addNewTileToSequence, playSequence]);

  // Handle tile press from user
  const handleTilePress = useCallback((tileId: number) => {
    if (gameState !== 'playing' || isProcessing) return;

    const newInput = [...userInput, tileId];
    setUserInput(newInput);

    const currentIndex = newInput.length - 1;

    if (sequence[currentIndex] !== tileId) {
      // Wrong tile!
      setWrongTile(tileId);
      setIsProcessing(true);
      playWrong();
      hapticError();
      heavyImpact();

      setTimeout(() => {
        setWrongTile(null);
        loseLife();

        if (lives - 1 > 0) {
          setUserInput([]);
          setGameState('playing');
          setIsProcessing(false);
        }
      }, 650);
      return;
    }

    // Correct press
    if (newInput.length === sequence.length) {
      playTileSound(tileId);
      mediumImpact();
      setGameState('roundComplete');
      setIsProcessing(true);

      setTimeout(() => {
        playRoundComplete();
        success();
        setUserInput([]);
        setGameState('idle');
        setIsProcessing(false);
        startNewRound();
      }, 900);
    } else {
      playTileSound(tileId);
      lightImpact();
    }
  }, [gameState, isProcessing, userInput, sequence, startNewRound, loseLife, lives, playTileSound, playRoundComplete, playWrong, lightImpact, mediumImpact, success]);

  useEffect(() => {
    const timer = setTimeout(() => {
      startNewRound();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const resetGame = () => {
    setSequence([]);
    setUserInput([]);
    setGameState('idle');
    setActiveTile(null);
    setWrongTile(null);
    setRound(1);
    setIsProcessing(false);
    setLives(MAX_LIVES);

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
            <Text style={styles.roundText}>ROUND {round}</Text>
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
            Sequence: {sequence.length}
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
            <Text style={styles.gameOverScore}>Longest sequence: {sequence.length}</Text>

            <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
              <Text style={styles.retryText}>TRY AGAIN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeButton} onPress={() => navigation.goBack()}>
              <Text style={styles.homeText}>BACK TO HOME</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.devNote}>Step 6 • Haptics</Text>
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
  devNote: {
    position: 'absolute',
    bottom: 16,
    color: '#333355',
    fontSize: 11,
  },
});
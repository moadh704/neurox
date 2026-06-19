import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS, TILE_COLORS, TILE_NAMES } from '../constants/colors';
import Tile from '../components/Tile';

type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

const GRID_SIZE = 3;
const TILE_SIZE = 92;

export default function GameScreen() {
  const route = useRoute<GameRouteProp>();
  const navigation = useNavigation<NavProp>();
  const { mode } = route.params;

  // Core game state
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'watching' | 'playing' | 'roundComplete' | 'wrong'>('idle');
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

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
      
      // Highlight tile
      setActiveTile(tileId);
      
      // Wait for flash duration
      await new Promise(resolve => setTimeout(resolve, 420));
      
      // Turn off
      setActiveTile(null);
      
      // Small gap between flashes
      if (i < seq.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 180));
      }
    }

    // Finished watching
    setActiveTile(null);
    setIsProcessing(false);
    setGameState('playing');
  }, []);

  // Start a new round (or first round)
  const startNewRound = useCallback(async () => {
    if (sequence.length === 0) {
      // First round - start with 1 tile
      const firstTile = Math.floor(Math.random() * 9);
      const newSeq = [firstTile];
      setSequence(newSeq);
      setRound(1);
      await new Promise(resolve => setTimeout(resolve, 300));
      await playSequence(newSeq);
    } else {
      // Add one new tile
      addNewTileToSequence();
      const newRound = round + 1;
      setRound(newRound);
      await new Promise(resolve => setTimeout(resolve, 400));
      await playSequence([...sequence, sequence[sequence.length - 1]]); // temporary until state updates
    }
  }, [sequence, round, addNewTileToSequence, playSequence]);

  // Handle tile press from user
  const handleTilePress = useCallback((tileId: number) => {
    if (gameState !== 'playing' || isProcessing) return;

    const newInput = [...userInput, tileId];
    setUserInput(newInput);

    // Check if this press is correct so far
    const currentIndex = newInput.length - 1;

    if (sequence[currentIndex] !== tileId) {
      // Wrong tile!
      setWrongTile(tileId);
      setGameState('wrong');
      setIsProcessing(true);

      // Flash red for 600ms then show feedback
      setTimeout(() => {
        setWrongTile(null);
        setIsProcessing(false);
        
        Alert.alert(
          'Wrong!',
          `You tapped ${TILE_NAMES[tileId]} instead of ${TILE_NAMES[sequence[currentIndex]]}`,
          [
            {
              text: 'Try Again',
              onPress: () => {
                // Reset for retrying the same sequence
                setUserInput([]);
                setGameState('playing');
              },
            },
            {
              text: 'Back to Home',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }, 650);
      return;
    }

    // Correct so far
    if (newInput.length === sequence.length) {
      // Completed the full sequence!
      setGameState('roundComplete');
      setIsProcessing(true);

      setTimeout(() => {
        setUserInput([]);
        setGameState('idle');
        setIsProcessing(false);
        
        // Auto start next round
        startNewRound();
      }, 900);
    }
  }, [gameState, isProcessing, userInput, sequence, startNewRound, navigation]);

  // Initialize game on mount
  useEffect(() => {
    // Small delay then start first round
    const timer = setTimeout(() => {
      startNewRound();
    }, 600);

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  // Reset everything (for dev / future restart button)
  const resetGame = () => {
    setSequence([]);
    setUserInput([]);
    setGameState('idle');
    setActiveTile(null);
    setWrongTile(null);
    setRound(1);
    setIsProcessing(false);
    
    setTimeout(() => {
      startNewRound();
    }, 300);
  };

  // Render 3x3 grid
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
            disabled={gameState !== 'playing' || isProcessing}
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

  const getStatusText = () => {
    switch (gameState) {
      case 'watching':
        return 'WATCH CAREFULLY...';
      case 'playing':
        return 'YOUR TURN';
      case 'roundComplete':
        return 'NICE!';
      case 'wrong':
        return 'WRONG!';
      default:
        return mode.toUpperCase();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← HOME</Text>
          </TouchableOpacity>

          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
            <Text style={styles.roundText}>ROUND {round}</Text>
          </View>

          <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
            <Text style={styles.resetText}>RESET</Text>
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={styles.gridContainer}>
          {renderGrid()}
        </View>

        {/* Bottom info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.sequenceLength}>
            Sequence length: {sequence.length}
          </Text>
          {gameState === 'playing' && (
            <Text style={styles.inputProgress}>
              {userInput.length} / {sequence.length}
            </Text>
          )}
        </View>

        {/* Dev note */}
        <Text style={styles.devNote}>
          Step 3 core mechanic • {mode} mode
        </Text>
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
    marginBottom: 24,
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
    padding: 8,
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
  bottomInfo: {
    marginTop: 32,
    alignItems: 'center',
    gap: 6,
  },
  sequenceLength: {
    color: '#666688',
    fontSize: 14,
  },
  inputProgress: {
    color: COLORS.cyan,
    fontSize: 16,
    fontWeight: '700',
  },
  devNote: {
    position: 'absolute',
    bottom: 20,
    color: '#333355',
    fontSize: 11,
  },
});
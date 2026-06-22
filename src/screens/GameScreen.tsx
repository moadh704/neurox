import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

const GRID_SIZE = 3;
const TILE_SIZE = 78;
const TILE_GAP = 14;

type GameState = 'idle' | 'watching' | 'playing' | 'levelComplete' | 'gameOver';

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';

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
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);

  const addNewTileToSequence = useCallback(() => {
    const randomTile = Math.floor(Math.random() * 9);
    setSequence(prev => [...prev, randomTile]);
  }, []);

  const playSequence = useCallback(async (seq: number[], currentLevel: number) => {
    setGameState('watching');
    setIsProcessing(true);
    setUserInput([]);

    for (let i = 0; i < seq.length; i++) {
      setActiveTile(seq[i]);
      await new Promise(r => setTimeout(r, 380));
      setActiveTile(null);
      if (i < seq.length - 1) await new Promise(r => setTimeout(r, 120));
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
    setShowLevelCompleteModal(false);
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
      }, 450);
      return;
    }

    if (newInput.length === sequence.length) {
      setGameState('levelComplete');
      setIsProcessing(true);

      if (mode === 'classic') {
        AsyncStorage.setItem(CLASSIC_PROGRESS_KEY, String(level + 1));
      }

      setTimeout(() => {
        setShowLevelCompleteModal(true);
      }, 180);
    }
  }, [gameState, isProcessing, userInput, sequence, loseLife, lives, level, mode]);

  const goToNextLevel = () => {
    setShowLevelCompleteModal(false);
    setUserInput([]);
    setGameState('idle');
    setIsProcessing(false);
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
    setShowLevelCompleteModal(false);
    setTimeout(() => startNewRound(1), 200);
  };

  const renderLives = () => {
    return (
      <View style={styles.livesContainer}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.lifeDot,
              { backgroundColor: i <= lives ? '#FFFFFF' : '#555555' }
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
        const isActive = activeTile === id;
        const isWrong = wrongTile === id;

        let tileColor = '#E8E8E8';
        if (isWrong) tileColor = '#E25C5C';
        else if (isActive) tileColor = '#5B7FE0';

        rowTiles.push(
          <TouchableOpacity
            key={id}
            style={[styles.tile, { backgroundColor: tileColor }]}
            onPress={() => handleTilePress(id)}
            disabled={gameState !== 'playing' || isProcessing || gameState === 'gameOver'}
            activeOpacity={0.7}
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.levelText}>Level {level}</Text>
            {renderLives()}
          </View>

          <View style={{ width: 40 }} />
        </View>

        <View style={styles.gridContainer}>
          {renderGrid()}
        </View>

        <Modal
          visible={showLevelCompleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={goToNextLevel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Level {level} ✓</Text>
              <TouchableOpacity style={styles.nextButton} onPress={goToNextLevel}>
                <Text style={styles.nextButtonText}>Next Level</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  container: { flex: 1, alignItems: 'center' },

  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop:30,
    paddingBottom:20,
  },
  backButton: { padding: 8 },
  headerCenter: { alignItems: 'center' },
  levelText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  livesContainer: { flexDirection: 'row', gap: 10 },
  lifeDot: { width: 10, height: 10, borderRadius: 5 },

  gridContainer: {
    marginTop: 2,
    alignItems: 'center',
  },
  row: { flexDirection: 'row', marginBottom: TILE_GAP },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 14,
    marginHorizontal: TILE_GAP / 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 28,
    paddingHorizontal: 36,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 220,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  nextButton: {
    borderWidth: 1.5,
    borderColor: '#5B7FE0',
    paddingHorizontal: 32,
    paddingVertical: 11,
    borderRadius: 24,
  },
  nextButtonText: { color: '#5B7FE0', fontSize: 16, fontWeight: '600' },

  retryButton: {
    marginTop: 30,
    backgroundColor: '#5B7FE0',
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

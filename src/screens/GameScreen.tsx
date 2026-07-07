import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useSound } from '../hooks/useSound';

type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

const GRID_SIZE = 3;
const TILE_SIZE = 78;
const TILE_GAP = 14;
const MAX_LEVEL = 25;

type GameState = 'idle' | 'watching' | 'playing' | 'levelComplete' | 'gameOver' | 'gameComplete';

const CLASSIC_PROGRESS_KEY = '@neurox_classic_level';

export default function GameScreen() {
  const route = useRoute<GameRouteProp>();
  const navigation = useNavigation<NavProp>();
  const { mode, startLevel } = route.params || {};

  const { playTileSound, playWrong, playRoundComplete, playGameOver } = useSound();

  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lives, setLives] = useState(3);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showGameCompleteModal, setShowGameCompleteModal] = useState(false);
  const [correctTapFeedback, setCorrectTapFeedback] = useState<number | null>(null);
  const [waveTile, setWaveTile] = useState<number | null>(null);

  const autoAdvanceTimer = useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState(0);

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
      playTileSound(seq[i]);
      await new Promise(r => setTimeout(r, 380));
      setActiveTile(null);
      if (i < seq.length - 1) await new Promise(r => setTimeout(r, 120));
    }
    setActiveTile(null);
    setIsProcessing(false);
    setGameState('playing');
  }, [playTileSound]);

  const playWaveCelebration = useCallback(async () => {
    const waveOrder: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const stepTime = 72;

    for (let i = 0; i < waveOrder.length; i++) {
      setWaveTile(waveOrder[i]);
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
    setWaveTile(null);
  }, []);

  const loseLife = useCallback(() => {
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      playGameOver();
      setGameState('gameOver');
      setIsProcessing(true);
      setShowGameOverModal(true);
    }
  }, [lives, playGameOver]);

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
    setShowGameOverModal(false);
    setShowGameCompleteModal(false);
    setCountdown(0);
    setWaveTile(null);
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
    }
    await new Promise(r => setTimeout(r, 200));
    await playSequence(newSeq, currentLevel);
  }, [level, playSequence]);

  useEffect(() => {
    const init = async () => {
      if (mode === 'classic') {
        try {
          const saved = await AsyncStorage.getItem(CLASSIC_PROGRESS_KEY);
          // Priority: startLevel from LevelsScreen > saved progress > 1
          let startLevelNum = startLevel || (saved ? parseInt(saved) : 1);

          // Respect max level
          if (startLevelNum > MAX_LEVEL) startLevelNum = MAX_LEVEL;

          setTimeout(() => startNewRound(startLevelNum), 300);
        } catch {
          setTimeout(() => startNewRound(1), 300);
        }
      } else {
        setTimeout(() => startNewRound(1), 300);
      }
    };
    init();
  }, [mode, startLevel]);

  const triggerCorrectTapFeedback = (tileId: number) => {
    setCorrectTapFeedback(tileId);
    setTimeout(() => {
      setCorrectTapFeedback(null);
    }, 120);
  };

  const replaySequence = async () => {
    if (isProcessing || gameState !== 'playing') return;

    setIsProcessing(true);
    const currentInput = [...userInput];

    for (let i = 0; i < sequence.length; i++) {
      setActiveTile(sequence[i]);
      playTileSound(sequence[i]);
      await new Promise(r => setTimeout(r, 380));
      setActiveTile(null);
      if (i < sequence.length - 1) await new Promise(r => setTimeout(r, 120));
    }
    setActiveTile(null);
    setIsProcessing(false);
  };

  const handleTilePress = useCallback((tileId: number) => {
    if (gameState !== 'playing' || isProcessing) return;

    const newInput = [...userInput, tileId];
    setUserInput(newInput);

    const currentIndex = newInput.length - 1;

    if (sequence[currentIndex] !== tileId) {
      setWrongTile(tileId);
      playWrong();
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

    triggerCorrectTapFeedback(tileId);
    playTileSound(tileId);

    if (newInput.length === sequence.length) {
      const nextLevel = level + 1;

      if (level === MAX_LEVEL) {
        // Player beat the final level
        setGameState('gameComplete');
        setIsProcessing(true);
        playRoundComplete();

        setTimeout(() => {
          setShowGameCompleteModal(true);
        }, 300);
      } else {
        setGameState('levelComplete');
        setIsProcessing(true);
        playRoundComplete();

        if (mode === 'classic') {
          const newProgress = Math.min(nextLevel, MAX_LEVEL);
          AsyncStorage.setItem(CLASSIC_PROGRESS_KEY, String(newProgress));
        }

        setTimeout(() => {
          playWaveCelebration().then(() => {
            setTimeout(() => {
              setShowLevelCompleteModal(true);
              startAutoAdvanceCountdown();
            }, 60);
          });
        }, 130);
      }
    }
  }, [gameState, isProcessing, userInput, sequence, loseLife, lives, level, mode, playWaveCelebration, playTileSound, playWrong, playRoundComplete]);

  const startAutoAdvanceCountdown = () => {
    setCountdown(2);

    if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);

    autoAdvanceTimer.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);
          goToNextLevel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const goToNextLevel = () => {
    if (autoAdvanceTimer.current) {
      clearInterval(autoAdvanceTimer.current);
    }
    setShowLevelCompleteModal(false);
    setUserInput([]);
    setGameState('idle');
    setIsProcessing(false);
    setCountdown(0);
    setWaveTile(null);
    startNewRound(level + 1);
  };

  const resetGame = () => {
    if (autoAdvanceTimer.current) {
      clearInterval(autoAdvanceTimer.current);
    }
    setSequence([]);
    setUserInput([]);
    setGameState('idle');
    setActiveTile(null);
    setWrongTile(null);
    setLevel(1);
    setIsProcessing(false);
    setLives(3);
    setShowLevelCompleteModal(false);
    setShowGameOverModal(false);
    setShowGameCompleteModal(false);
    setCountdown(0);
    setWaveTile(null);
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
        const isCorrectFeedback = correctTapFeedback === id;
        const isWave = waveTile === id;

        let tileColor = '#E8E8E8';
        if (isWrong) tileColor = '#E25C5C';
        else if (isActive || isWave) tileColor = '#5B7FE0';
        else if (isCorrectFeedback) tileColor = '#7BA3F0';

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

  const progressText = `${userInput.length} / ${sequence.length}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonTop}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.levelText}>Level {level}</Text>
            {renderLives()}
          </View>

          {gameState === 'playing' && sequence.length > 0 && (
            <View style={styles.topControls}>
              <Text style={styles.progressText}>{progressText}</Text>

              <TouchableOpacity onPress={replaySequence} style={styles.replayButton}>
                <Ionicons name="eye-outline" size={22} color="#888888" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.gridContainer}>
            {renderGrid()}
          </View>
        </View>

        {/* Level Complete Modal */}
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
                <Text style={styles.nextButtonText}>
                  Next Level {countdown > 0 ? `(${countdown})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Game Over Modal */}
        <Modal
          visible={showGameOverModal}
          transparent={true}
          animationType="fade"
          onRequestClose={resetGame}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Game Over</Text>
              <TouchableOpacity style={styles.retryButtonModal} onPress={resetGame}>
                <Text style={styles.retryTextModal}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Game Complete Modal (Final Level) */}
        <Modal
          visible={showGameCompleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={resetGame}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>You Did It!</Text>
              <Text style={styles.completeText}>You completed all 25 levels</Text>
              <TouchableOpacity style={styles.completeButton} onPress={resetGame}>
                <Text style={styles.completeButtonText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0D0D' },
  container: { flex: 1, alignItems: 'center' },

  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },

  backButtonTop: {
    position: 'absolute',
    top: 14,
    left: 16,
    zIndex: 10,
  },

  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  livesContainer: { flexDirection: 'row', gap: 10 },
  lifeDot: { width: 10, height: 10, borderRadius: 5 },

  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  progressText: {
    color: '#888888',
    fontSize: 15,
    fontWeight: '600',
  },
  replayButton: {
    padding: 6,
  },

  gridContainer: {
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
  completeText: { color: '#AAAAAA', fontSize: 15, marginTop: -8, marginBottom: 20 },
  nextButton: {
    borderWidth: 1.5,
    borderColor: '#5B7FE0',
    paddingHorizontal: 32,
    paddingVertical: 11,
    borderRadius: 24,
  },
  nextButtonText: { color: '#5B7FE0', fontSize: 16, fontWeight: '600' },

  completeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
  },
  completeButtonText: { color: '#000000', fontSize: 16, fontWeight: '700' },

  retryButtonModal: {
    backgroundColor: '#5B7FE0',
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryTextModal: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
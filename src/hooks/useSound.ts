import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { SoundType } from '../types';

const TILE_FREQUENCIES = [
  261.63, // C4  - Tile 0 (Cyan)
  293.66, // D4  - Tile 1 (Purple)
  329.63, // E4  - Tile 2 (Pink)
  349.23, // F4  - Tile 3 (Lime)
  392.00, // G4  - Tile 4 (Orange)
  440.00, // A4  - Tile 5 (Red)
  493.88, // B4  - Tile 6 (Blue)
  523.25, // C5  - Tile 7 (White)
  587.33, // D5  - Tile 8 (Yellow)
];

let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const getSoundEnabled = () => soundEnabled;

export function useSound() {
  const soundsRef = useRef<{ [key: string]: Audio.Sound }>({});

  // Initialize audio mode
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const playTone = async (frequency: number, duration: number = 280, volume: number = 0.7) => {
    if (!soundEnabled) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
        {
          shouldPlay: false,
          volume,
          rate: frequency / 440,
          shouldCorrectPitch: true,
        }
      );

      await sound.playAsync();

      setTimeout(async () => {
        try {
          await sound.unloadAsync();
        } catch (e) {}
      }, duration + 100);
    } catch (error) {
      console.log('Sound playback issue (using fallback):', error);
    }
  };

  const playTileSound = async (tileId: number) => {
    const freq = TILE_FREQUENCIES[tileId] || 440;
    await playTone(freq, 260, 0.75);
  };

  const playCorrect = async () => {
    if (!soundEnabled) return;
    await playTone(523.25, 180, 0.6);
    setTimeout(() => playTone(659.25, 220, 0.65), 120);
  };

  const playWrong = async () => {
    if (!soundEnabled) return;
    await playTone(164.81, 420, 0.85);
  };

  const playRoundComplete = async () => {
    if (!soundEnabled) return;
    await playTone(659.25, 200, 0.7);
    setTimeout(() => playTone(783.99, 280, 0.75), 150);
  };

  const playGameOver = async () => {
    if (!soundEnabled) return;
    await playTone(130.81, 600, 0.9);
  };

  const playSound = async (type: SoundType, tileId?: number) => {
    if (!soundEnabled) return;

    switch (type) {
      case 'tile1':
      case 'tile2':
      case 'tile3':
      case 'tile4':
      case 'tile5':
      case 'tile6':
      case 'tile7':
      case 'tile8':
      case 'tile9':
        const id = parseInt(type.replace('tile', '')) - 1;
        await playTileSound(id);
        break;
      case 'correct':
        await playCorrect();
        break;
      case 'wrong':
        await playWrong();
        break;
      case 'levelComplete':
        await playRoundComplete();
        break;
      case 'gameOver':
        await playGameOver();
        break;
      default:
        break;
    }
  };

  return {
    playTileSound,
    playCorrect,
    playWrong,
    playRoundComplete,
    playGameOver,
    playSound,
    setSoundEnabled,
  };
}

import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const getSoundEnabled = () => soundEnabled;

export function useSound() {
  const soundsRef = useRef<Record<string, Audio.Sound>>({});

  // Preload all sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        const soundFiles = {
          tap: require('../../assets/sounds/tap.mp3'),
          success: require('../../assets/sounds/success.mp3'),
          error: require('../../assets/sounds/error.mp3'),
          levelComplete: require('../../assets/sounds/levelComplete.mp3'),
          gameOver: require('../../assets/sounds/gameOver.mp3'),
        };

        for (const [key, file] of Object.entries(soundFiles)) {
          const { sound } = await Audio.Sound.createAsync(file, {
            shouldPlay: false,
            volume: 0.4, // Calmer default volume
          });
          soundsRef.current[key] = sound;
        }
      } catch (error) {
        console.log('Error loading sounds:', error);
      }
    };

    loadSounds();

    return () => {
      // Unload sounds on unmount
      Object.values(soundsRef.current).forEach(sound => {
        sound.unloadAsync().catch(() => {});
      });
    };
  }, []);

  const playSound = async (name: string) => {
    if (!soundEnabled) return;

    try {
      const sound = soundsRef.current[name];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.log('Sound playback error:', error);
    }
  };

  // Public methods
  const playTileSound = async () => {
    await playSound('tap');
  };

  const playCorrect = async () => {
    await playSound('success');
  };

  const playWrong = async () => {
    await playSound('error');
  };

  const playRoundComplete = async () => {
    await playSound('levelComplete');
  };

  const playGameOver = async () => {
    await playSound('gameOver');
  };

  return {
    playTileSound,
    playCorrect,
    playWrong,
    playRoundComplete,
    playGameOver,
    setSoundEnabled,
  };
}

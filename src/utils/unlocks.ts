import AsyncStorage from '@react-native-async-storage/async-storage';

export const UNLOCKS_KEY = '@neurox_unlocks';

export interface Unlocks {
  badges: string[];
  themes: string[];
  gridTypes: string[];
  twistModes: string[];
}

export const DEFAULT_UNLOCKS: Unlocks = {
  badges: [],
  themes: ['default'],
  gridTypes: ['3x3'],
  twistModes: [],
};

export const MILESTONES = [
  { level: 5, badge: 'bronze', theme: null, twist: 'reverse' },
  { level: 8, badge: null, theme: null, twist: 'ghost' },
  { level: 10, badge: 'silver', theme: 'fire', twist: 'bomb' },
  { level: 13, badge: null, theme: null, twist: 'blind' },
  { level: 15, badge: 'gold', theme: 'ice', twist: null },
  { level: 16, badge: null, theme: null, twist: 'distraction' },
  { level: 20, badge: 'platinum', theme: 'galaxy', twist: 'rhythm' },
  { level: 25, badge: 'diamond', theme: 'neon_rainbow', twist: null },
  { level: 30, badge: 'master', theme: 'blood_red', twist: null },
];

export const unlockAtLevel = (level: number, currentUnlocks: Unlocks): Unlocks => {
  const newUnlocks = { ...currentUnlocks };

  MILESTONES.forEach((milestone) => {
    if (level >= milestone.level) {
      if (milestone.badge && !newUnlocks.badges.includes(milestone.badge)) {
        newUnlocks.badges.push(milestone.badge);
      }
      if (milestone.theme && !newUnlocks.themes.includes(milestone.theme)) {
        newUnlocks.themes.push(milestone.theme);
      }
      if (milestone.twist && !newUnlocks.twistModes.includes(milestone.twist)) {
        newUnlocks.twistModes.push(milestone.twist);
      }
    }
  });

  return newUnlocks;
};

export const loadUnlocks = async (): Promise<Unlocks> => {
  try {
    const saved = await AsyncStorage.getItem(UNLOCKS_KEY);
    if (saved) {
      return { ...DEFAULT_UNLOCKS, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return DEFAULT_UNLOCKS;
};

export const saveUnlocks = async (unlocks: Unlocks) => {
  try {
    await AsyncStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks));
  } catch (e) {}
};
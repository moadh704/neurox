export type GameMode = 
  | 'classic' 
  | 'survival' 
  | 'reverse' 
  | 'ghost' 
  | 'bomb' 
  | 'blind' 
  | 'distraction' 
  | 'rhythm';

export type Tile = {
  id: number;
  color: string;
  name: string;
};

export type GameStats = {
  classicLevel: number;
  personalBests: Record<GameMode, number>;
  totalGames: number;
  averageLevel: number;
  currentStreak: number;
  bestStreak: number;
  lastRuns: Array<{
    date: string;
    mode: GameMode;
    score: number;
    level?: number;
  }>;
  unlockedTwists: string[];
  unlockedThemes: string[];
  badges: string[];
};

export type SoundType = 
  | 'tile1' | 'tile2' | 'tile3' | 'tile4' | 'tile5' 
  | 'tile6' | 'tile7' | 'tile8' | 'tile9'
  | 'correct' | 'wrong' | 'levelComplete' | 'gameOver' | 'newBest';
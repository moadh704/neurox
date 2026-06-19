# 🧠 NEUROX

**Neurox is a dark neon arcade memory sequence game built with React Native and Expo.**

A highly polished mobile memory game where players watch sequences of neon tiles light up and must repeat them perfectly. Features multiple game modes, progressive difficulty, twist challenges, persistent progress, and addictive arcade gameplay.

## Features

- **Classic Mode**: Structured levels with permanent progress saving
- **Survival Mode**: Endless challenge with global leaderboard
- **Twist Modes**: Unlockable variants (Reverse, Ghost, Bomb, Blind, Distraction, Rhythm)
- **Dark Neon Visuals**: Stunning cyberpunk-inspired UI with glow effects
- **Unique Audio**: Each tile has its own musical tone forming melodies
- **Haptic Feedback**: Satisfying vibrations for every interaction
- **Progression System**: Badges, themes, and grid unlocks at milestones

## Tech Stack

- React Native + Expo
- TypeScript
- React Navigation
- Reanimated 2
- Expo AV (Audio)
- Expo Haptics
- AsyncStorage

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run android
npm run ios
```

## Project Structure

```
neurox/
├── src/
│   ├── components/     # Reusable UI components (Tile, Grid, Lives, etc.)
│   ├── constants/      # Colors, game config, themes
│   ├── hooks/          # Custom hooks (useGameLogic, useSound, etc.)
│   ├── navigation/     # Navigators and route types
│   ├── screens/        # All app screens
│   ├── utils/          # Helpers, sequence generators, storage
│   └── types/          # TypeScript interfaces
├── assets/
│   ├── images/         # Icons, backgrounds, sprites
│   └── sounds/         # Xylophone tone files + SFX
├── App.tsx
├── app.json
└── package.json
```

## Build Steps (Development Log)

This project is being built iteratively:

- Step 1: Project initialization & folder structure ✅
- Step 2: Home screen UI
- ... (see commits for progress)

## License

MIT

---

Built with ❤️ for memory game lovers and neon aesthetic fans.
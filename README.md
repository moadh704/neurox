# 🧠 NEUROX

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License: MIT"/>
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-blue?style=for-the-badge&logo=android" alt="Platform"/>
</p>

**Neurox** is a polished dark neon memory sequence game built with React Native and Expo. Players watch sequences of glowing tiles and must repeat them in order. The game features progressive difficulty, multiple modes, twist mechanics, and satisfying audio-visual feedback.

## Features

- **Classic Mode** — Structured levels with persistent progress
- **Survival Mode** — Endless gameplay with scoring and leaderboards
- **Twist Modes** — Unlockable variants including Reverse, Ghost, Bomb, Blind, Distraction, and Rhythm
- **Dark Neon Aesthetic** — Modern cyberpunk-inspired UI with smooth animations
- **Musical Feedback** — Each tile plays a unique tone, creating melodies as you play
- **Haptic Feedback** — Satisfying vibrations for every interaction
- **Progression System** — Unlock themes, badges, and grid variations through milestones

## How to Play

1. Watch the sequence of tiles light up
2. Repeat the exact sequence by tapping the tiles
3. Complete the sequence to advance to the next level
4. Use the eye icon to replay the sequence if needed
5. Survive as long as possible in Survival mode or master all 25 levels in Classic mode

## Tech Stack

- React Native + Expo
- TypeScript
- React Navigation (Native Stack)
- Reanimated 2
- Expo AV (Audio)
- Expo Haptics
- AsyncStorage

## Getting Started

```bash
# Clone the repository
git clone https://github.com/moadh704/neurox.git
cd neurox

# Install dependencies
npm install

# Start the development server
npx expo start

# Run on specific platform
npx expo run:android
npx expo run:ios
```

## Project Structure

```
neurox/
├── src/
│   ├── components/     # Reusable components (Tile, Grid, etc.)
│   ├── constants/      # Colors, config, themes
│   ├── hooks/          # Custom hooks (useSound, useHaptics, etc.)
│   ├── screens/        # Game screens (Home, Game, Levels, Settings...)
│   ├── utils/          # Helpers and utilities
│   └── types/          # TypeScript definitions
├── assets/
│   ├── images/
│   └── sounds/         # Audio assets
├── App.tsx
├── app.json
└── package.json
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Built with passion for memory games and beautiful mobile experiences.
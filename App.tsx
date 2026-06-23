import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import LevelsScreen from './src/screens/LevelsScreen';

export type RootStackParamList = {
  Home: undefined;
  Game: { mode: 'classic' | 'survival' | 'reverse' | 'ghost' | 'bomb' | 'blind' | 'distraction' | 'rhythm' };
  Stats: undefined;
  Settings: undefined;
  Leaderboard: undefined;
  Levels: undefined;
  LevelComplete: { level: number; score: number };
  GameOver: { score: number; isNewBest: boolean; mode: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0D0D0D' },
              animation: 'fade',
              animationDuration: 280,
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Levels" component={LevelsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

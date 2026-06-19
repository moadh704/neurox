import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS } from '../constants/colors';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isCurrentUser?: boolean;
}

// Mock global leaderboard data
const mockGlobalLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "NeonMaster42", score: 87 },
  { rank: 2, name: "CyberGhost", score: 76 },
  { rank: 3, name: "PulseRunner", score: 71 },
  { rank: 4, name: "VoidWalker", score: 68 },
  { rank: 5, name: "EchoByte", score: 65 },
  { rank: 6, name: "SynthWave", score: 61 },
  { rank: 7, name: "QuantumFlip", score: 58 },
  { rank: 8, name: "PixelDrift", score: 55 },
  { rank: 9, name: "ArcadeGhost", score: 52 },
  { rank: 10, name: "You", score: 48, isCurrentUser: true },
];

export default function LeaderboardScreen() {
  const navigation = useNavigation<NavProp>();
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => (
    <View style={[
      styles.leaderboardRow,
      item.isCurrentUser && styles.currentUserRow
    ]}>
      <Text style={styles.rank}>#{item.rank}</Text>
      <Text style={[
        styles.name,
        item.isCurrentUser && styles.currentUserName
      ]}>
        {item.name}
      </Text>
      <Text style={styles.score}>{item.score}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>LEADERBOARD</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'global' && styles.activeTab]}
            onPress={() => setActiveTab('global')}
          >
            <Text style={[styles.tabText, activeTab === 'global' && styles.activeTabText]}>
              GLOBAL
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              FRIENDS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard Content */}
        {activeTab === 'global' ? (
          <FlatList
            data={mockGlobalLeaderboard}
            keyExtractor={(item) => item.rank.toString()}
            renderItem={renderLeaderboardItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Friends Leaderboard</Text>
            <Text style={styles.emptyText}>
              Connect with friends to see their scores here.
            </Text>
            <TouchableOpacity style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Connect Accounts</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: COLORS.cyan,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#111122',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.cyan,
  },
  tabText: {
    color: '#888888',
    fontWeight: '700',
    fontSize: 15,
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 40,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111122',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#222244',
  },
  currentUserRow: {
    borderColor: COLORS.cyan,
    backgroundColor: '#0a2a2a',
  },
  rank: {
    color: COLORS.cyan,
    fontWeight: '800',
    width: 50,
    fontSize: 16,
  },
  name: {
    color: COLORS.white,
    fontWeight: '600',
    flex: 1,
    fontSize: 16,
  },
  currentUserName: {
    color: COLORS.cyan,
    fontWeight: '800',
  },
  score: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 18,
    minWidth: 50,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  connectButton: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  connectButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 16,
  },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, ScrollView } from 'react-native';
import heart from '../assets/heart.png';
import exclamationMark from '../assets/exclamation-mark.png';
import paperPlane from '../assets/paper-plane.png';
import colosseum from '../assets/colosseum.png';
import londonEye from '../assets/london-eye.png';
import galataTower from '../assets/galata-tower.png';
import pyramids from '../assets/pyramids.png';

const translations = {
  tr: {
    gameOver: 'Oyun Bitti!',
    winner: 'Kazanan:',
    mainMenu: 'Oyunu Bitir',
    continueGame: 'Devam Et',
    playAgain: 'Tekrar Oyna',
    correct: 'Doğru',
    pass: 'Pas',
    taboo: 'Tabu',
    team: 'Takım',
  },
  en: {
    gameOver: 'Game Over!',
    winner: 'Winner:',
    mainMenu: 'End Game',
    continueGame: 'Continue',
    playAgain: 'Play Again',
    correct: 'Correct',
    pass: 'Pass',
    taboo: 'Taboo',
    team: 'Team',
  },
};

export default function FinalResults({ route, navigation }) {
  const {
    teamA, teamB, teamAScore, teamBScore, language = 'tr',
    totalCorrect = 0, totalPass = 0, totalTaboo = 0,
    timeLimit, passCount, tabooCount, winPoints, gameMode,
    allowContinue = true,
    teamAStats = { correct: 0, pass: 0, taboo: 0, correctWords: [], passWords: [], tabooWords: [] },
    teamBStats = { correct: 0, pass: 0, taboo: 0, correctWords: [], passWords: [], tabooWords: [] },
  } = route.params || {};
  const t = translations[language];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.card}>
        {/* Notebook background */}
        <View style={styles.linedBackground}>
          {[...Array(20)].map((_, i) => (
            <View key={i} style={styles.line} />
          ))}
        </View>

        {/* Doodles */}
        <Image source={colosseum} style={styles.colosseumDoodle} pointerEvents="none" />
        <Image source={londonEye} style={styles.londonEyeDoodle} pointerEvents="none" />
        <Image source={galataTower} style={styles.galataTowerDoodle} pointerEvents="none" />
        <Image source={pyramids} style={styles.pyramidsDoodle} pointerEvents="none" />

        <Text style={styles.title}>{t.gameOver}</Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
          {/* Team A */}
          <View style={styles.teamBlock}>
            <Text style={styles.teamTitle}>{t.team} {teamA}</Text>
            <Text style={styles.scoreText}>{teamAScore}</Text>
            <View style={styles.badgesRow}>
              <View style={[styles.badge, { backgroundColor: '#66BB6A' }]}>
                <Image source={heart} style={styles.badgeIcon} />
                <Text style={styles.badgeCount}>{teamAStats.correct}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#FFB74D' }]}>
                <Image source={paperPlane} style={styles.badgeIcon} />
                <Text style={styles.badgeCount}>{teamAStats.pass}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#EF5350' }]}>
                <Image source={exclamationMark} style={styles.badgeIcon} />
                <Text style={styles.badgeCount}>{teamAStats.taboo}</Text>
              </View>
            </View>
            {(teamAStats.correctWords?.length > 0 || teamAStats.passWords?.length > 0 || teamAStats.tabooWords?.length > 0) && (
              <View style={styles.wordsPanel}>
                {teamAStats.correctWords?.map((w, idx) => (
                  <Text key={`A-c-${idx}`} style={[styles.wordItem, styles.correctWord]}>• {w}</Text>
                ))}
                {teamAStats.passWords?.map((w, idx) => (
                  <Text key={`A-p-${idx}`} style={[styles.wordItem, styles.passWord]}>• {w}</Text>
                ))}
                {teamAStats.tabooWords?.map((w, idx) => (
                  <Text key={`A-t-${idx}`} style={[styles.wordItem, styles.tabooWord]}>• {w}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Team B */}
          <View style={styles.teamBlock}>
            <Text style={styles.teamTitle}>{t.team} {teamB}</Text>
            <Text style={styles.scoreText}>{teamBScore}</Text>
            <View style={styles.badgesRow}>
              <View style={[styles.badge, { backgroundColor: '#66BB6A' }]}>
                <Image source={heart} style={styles.badgeIcon} />
                <Text style={styles.badgeCount}>{teamBStats.correct}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#FFB74D' }]}>
                <Image source={paperPlane} style={styles.badgeIcon} />
                <Text style={styles.badgeCount}>{teamBStats.pass}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#EF5350' }]}>
                <Image source={exclamationMark} style={styles.badgeIcon} />
                <Text style={styles.badgeCount}>{teamBStats.taboo}</Text>
              </View>
            </View>
            {(teamBStats.correctWords?.length > 0 || teamBStats.passWords?.length > 0 || teamBStats.tabooWords?.length > 0) && (
              <View style={styles.wordsPanel}>
                {teamBStats.correctWords?.map((w, idx) => (
                  <Text key={`B-c-${idx}`} style={[styles.wordItem, styles.correctWord]}>• {w}</Text>
                ))}
                {teamBStats.passWords?.map((w, idx) => (
                  <Text key={`B-p-${idx}`} style={[styles.wordItem, styles.passWord]}>• {w}</Text>
                ))}
                {teamBStats.tabooWords?.map((w, idx) => (
                  <Text key={`B-t-${idx}`} style={[styles.wordItem, styles.tabooWord]}>• {w}</Text>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.winnerText}>{t.winner} {teamAScore > teamBScore ? teamA : teamB}</Text>

          {/* Devam et butonu devre dışı (allowContinue false) */}

          {/* Tekrar Oyna devre dışı */}

          <TouchableOpacity style={[styles.button, styles.tertiary]} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'TabuuMenu' }] })}>
            <Text style={styles.buttonText}>{t.mainMenu}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  card: { width: '95%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#8B4513', padding: 18, alignItems: 'center', overflow: 'hidden' },
  title: { fontFamily: 'IndieFlower', fontSize: 32, color: '#8B4513', marginBottom: 12, marginTop: 6, fontWeight: 'normal', textAlign: 'center' },
  // notebook background
  linedBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingTop: 60 },
  line: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 18, width: '100%' },
  // doodles
  colosseumDoodle: { position: 'absolute', top: 6, left: 10, width: 30, height: 30, opacity: 0.12 },
  londonEyeDoodle: { position: 'absolute', top: 6, right: 12, width: 30, height: 30, opacity: 0.12 },
  galataTowerDoodle: { position: 'absolute', bottom: 50, left: 16, width: 26, height: 26, opacity: 0.12 },
  pyramidsDoodle: { position: 'absolute', bottom: 50, right: 16, width: 30, height: 30, opacity: 0.12 },
  // team blocks
  teamBlock: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#8B4513', borderRadius: 14, padding: 14, marginVertical: 8, alignSelf: 'stretch', width: '100%' },
  teamTitle: { fontFamily: 'IndieFlower', fontSize: 20, color: '#8B4513', textAlign: 'center' },
  scoreText: { fontFamily: 'IndieFlower', fontSize: 28, color: '#4A6FA5', textAlign: 'center', marginVertical: 4 },
  badgesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  badge: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 12, marginHorizontal: 6 },
  badgeIcon: { width: 22, height: 22, marginRight: 8, resizeMode: 'contain' },
  badgeText: { color: '#fff', fontFamily: 'IndieFlower', fontSize: 16 },
  badgeCount: { color: '#fff', fontFamily: 'IndieFlower', fontSize: 22, fontWeight: 'bold' },
  wordsPanel: { marginTop: 8, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10, flexDirection: 'row', flexWrap: 'wrap' },
  wordItem: { fontFamily: 'IndieFlower', fontSize: 16, color: '#F44336', marginBottom: 8, marginRight: 12, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.03)' },
  correctWord: { color: '#4CAF50' },
  passWord: { color: '#FFB74D' },
  tabooWord: { color: '#EF5350' },
  winnerText: { fontFamily: 'IndieFlower', fontSize: 22, color: '#8B4513', fontWeight: 'normal', marginVertical: 10, textAlign: 'center' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8, marginBottom: 6 },
  button: { borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 2, borderColor: '#8B4513', alignItems: 'center', width: '100%', marginBottom: 8 },
  primary: { backgroundColor: '#5b9bd5' },
  secondary: { backgroundColor: '#f4a460' },
  tertiary: { backgroundColor: '#8B4513' },
  buttonText: { color: '#fff', fontFamily: 'IndieFlower', fontWeight: 'normal', fontSize: 18 },
});

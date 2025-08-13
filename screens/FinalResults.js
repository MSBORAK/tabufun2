import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, ScrollView, Platform } from 'react-native';
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
    draw: 'Draw!'
  },
};

export default function FinalResults({ route, navigation }) {
  const {
    teamA, teamB, teamAScore, teamBScore, language = 'tr',
    totalCorrect = 0, totalPass = 0, totalTaboo = 0,
    timeLimit, passCount, tabooCount, gameMode,
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
                  <Text key={`A-t-${idx}`} style={[styles.wordItem, styles.tabooWordStruck]}>• {w}</Text>
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
                  <Text key={`B-t-${idx}`} style={[styles.wordItem, styles.tabooWordStruck]}>• {w}</Text>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.winnerText}>{teamAScore === teamBScore ? t.draw : `${t.winner} ${teamAScore > teamBScore ? teamA : teamB}`}</Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonHalfWidth, styles.primary]}
              onPress={() =>
                navigation.replace('Game', {
                  teamA,
                  teamB,
                  timeLimit,
                  passCount,
                  tabooCount,
                  // winPoints kaldırıldı,
                  gameMode,
                  language,
                  initialTeamAScore: 0,
                  initialTeamBScore: 0,
                })
              }
            >
              <Text style={styles.buttonText}>{t.playAgain}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonHalfWidth, styles.tertiary]} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'TabuuMenu' }] })}>
              <Text style={styles.buttonText}>{t.mainMenu}</Text>
            </TouchableOpacity>
          </View>

          {/* Devam et / Tekrar Oyna ve Oyunu Bitir butonları yukarıda hizalı şekilde */}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  card: { width: '90%', maxWidth: 720, backgroundColor: '#fdf6e3', borderRadius: 16, borderWidth: 2, borderColor: '#8B4513', padding: 20, alignItems: 'center', overflow: 'hidden' },
  title: { fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 24 : 26, color: '#8B4513', marginBottom: 12, marginTop: 8, fontWeight: 'normal', textAlign: 'center' },
  // notebook background
  linedBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingTop: 60 },
  line: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 18, width: '100%' },
  // doodles
  colosseumDoodle: { position: 'absolute', top: 20, left: 20, width: 28, height: 28, opacity: 0.1 },
  londonEyeDoodle: { position: 'absolute', top: 20, right: 20, width: 28, height: 28, opacity: 0.1 },
  galataTowerDoodle: { position: 'absolute', bottom: 20, left: 20, width: 24, height: 24, opacity: 0.1 },
  pyramidsDoodle: { position: 'absolute', bottom: 20, right: 20, width: 28, height: 28, opacity: 0.1 },
  // team blocks
  teamBlock: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#8B4513', borderRadius: 12, padding: Platform.OS === 'android' ? 12 : 15, marginVertical: 8, alignSelf: 'stretch', width: '100%' },
  teamTitle: { fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 15 : 16, color: '#8B4513', textAlign: 'center', fontWeight: 'normal' },
  scoreText: { fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 24 : 26, color: '#4A6FA5', textAlign: 'center', marginVertical: 6, fontWeight: 'normal' },
   badgesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
   badge: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 10, paddingVertical: Platform.OS === 'android' ? 6 : 8, paddingHorizontal: 8, marginHorizontal: 3 },
  badgeIcon: { width: 18, height: 18, marginRight: 5, resizeMode: 'contain' },
  badgeCount: { color: '#fff', fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 15 : 16, fontWeight: 'normal' },
  wordsPanel: { marginTop: 4, borderTopWidth: 1, borderColor: '#eee', paddingTop: 6, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
   wordItem: { fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 13 : 14, marginBottom: 4, marginRight: 6, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.03)' },
   correctWord: { color: '#4CAF50' },
   passWord: { color: '#FFB74D' },
   tabooWordStruck: { color: '#EF5350', textDecorationLine: 'line-through' },
  winnerText: { fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 18 : 20, color: '#8B4513', fontWeight: 'normal', marginVertical: 8, textAlign: 'center' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: 10, marginBottom: 8 },
  button: { borderRadius: 12, paddingVertical: Platform.OS === 'android' ? 6 : 8, paddingHorizontal: 12, borderWidth: 2, borderColor: '#8B4513', alignItems: 'center', marginBottom: 5 },
  buttonHalf: { flex: 1, marginHorizontal: 4 },
  buttonHalfWidth: { width: '49%' },
  primary: { backgroundColor: '#5b9bd5' },
  secondary: { backgroundColor: '#f4a460' },
  tertiary: { backgroundColor: '#8B4513' },
  buttonText: { color: '#fff', fontFamily: 'IndieFlower', fontWeight: 'normal', fontSize: Platform.OS === 'android' ? 15 : 16 },
});

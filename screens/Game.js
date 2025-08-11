import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, FlatList } from 'react-native';
import words from '../data/words.json'; // JSON'dan kelimeler

const Game = ({ route }) => {
  const { teamA = 'A Takımı', teamB = 'B Takımı', timeLimit = 10, passCount: initialPass = 3 } = route.params || {};

  const [currentWord, setCurrentWord] = useState('');
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [currentTeam, setCurrentTeam] = useState('A');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [passCount, setPassCount] = useState(initialPass);
  const [correctCount, setCorrectCount] = useState(0);
  const [passUsedCount, setPassUsedCount] = useState(0);
  const [tabooWordsUsed, setTabooWordsUsed] = useState([]);
  const [isRoundOver, setIsRoundOver] = useState(false);

  useEffect(() => { getNextWord(); }, []);

  useEffect(() => {
    if (isRoundOver) return;
    if (timeLeft <= 0) {
      setIsRoundOver(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRoundOver]);

  const handleCorrect = () => {
    if (currentTeam === 'A') setTeamAScore(prev => prev + 10);
    else setTeamBScore(prev => prev + 10);
    setCorrectCount(prev => prev + 1);
    getNextWord();
  };

  const handlePass = () => {
    if (passCount > 0) {
      setPassCount(prev => prev - 1);
      setPassUsedCount(prev => prev + 1);
      getNextWord();
    }
  };

  const handleTaboo = () => {
    if (currentTeam === 'A') setTeamAScore(prev => Math.max(0, prev - 5));
    else setTeamBScore(prev => Math.max(0, prev - 5));
    setTabooWordsUsed(prev => [...prev, currentWord]);
    getNextWord();
  };

  const getNextWord = () => {
    const nextWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(nextWord.word);
  };

  const startNextRound = () => {
    setCurrentTeam(prev => (prev === 'A' ? 'B' : 'A'));
    setTimeLeft(timeLimit);
    setPassCount(initialPass);
    setCorrectCount(0);
    setPassUsedCount(0);
    setTabooWordsUsed([]);
    setIsRoundOver(false);
    getNextWord();
  };

  return (
    <ImageBackground style={styles.container} resizeMode="cover">
      {isRoundOver ? (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tur Bitti!</Text>
          <Text style={styles.summaryText}>Doğru Sayısı: {correctCount}</Text>
          <Text style={styles.summaryText}>Kullanılan Pas: {passUsedCount}</Text>
          <Text style={styles.summaryText}>Tabu Yapılan Kelimeler:</Text>
          {tabooWordsUsed.length > 0 ? (
            <FlatList
              data={tabooWordsUsed}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text style={styles.tabooItem}>{item}</Text>}
            />
          ) : (
            <Text style={styles.tabooItem}>Yok</Text>
          )}
          <TouchableOpacity style={styles.nextButton} onPress={startNextRound}>
            <Text style={styles.buttonText}>Diğer Takım Başla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.timer}>{timeLeft}</Text>
            <Text style={styles.gameTitle}>TABU</Text>
            <Text style={styles.passCount}>Pas: {passCount}</Text>
          </View>
          <View style={styles.wordContainer}>
            <Text style={styles.currentWord}>{currentWord}</Text>
          </View>
          <View style={styles.tabooWordsContainer}>
            {words.find(w => w.word === currentWord)?.taboo.map((word, index) => (
              <Text key={index} style={styles.tabooWord}>{word}</Text>
            ))}
          </View>
          <View style={styles.teamsContainer}>
            <View style={[styles.team, currentTeam === 'A' && styles.activeTeam]}>
              <Text style={styles.teamName}>{teamA}</Text>
              <Text style={styles.teamScore}>SKOR: {teamAScore}</Text>
            </View>
            <View style={[styles.team, currentTeam === 'B' && styles.activeTeam]}>
              <Text style={styles.teamName}>{teamB}</Text>
              <Text style={styles.teamScore}>SKOR: {teamBScore}</Text>
            </View>
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCorrect}>
              <Text style={styles.buttonText}>DOĞRU</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handlePass}>
              <Text style={styles.buttonText}>PAS ({passCount})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleTaboo}>
              <Text style={styles.buttonText}>TABU</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
 container: { flex: 1, padding: 20 },
 header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
 timer: { fontSize: 24, fontWeight: 'bold', color: '#fff', backgroundColor: '#4A6FA5', padding: 10, borderRadius: 10 },
 gameTitle: { fontSize: 28, fontWeight: 'bold', color: '#4A6FA5' },
 passCount: { fontSize: 18, fontWeight: 'bold', color: '#FF5252' },
 wordContainer: { backgroundColor: '#fff', padding: 30, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
 currentWord: { fontSize: 42, fontWeight: 'bold', color: '#4A6FA5' },
 tabooWordsContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 30 },
 tabooWord: { fontSize: 16, color: '#FF5252', marginBottom: 5 },
 teamsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
 team: { backgroundColor: '#eee', padding: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
 activeTeam: { backgroundColor: '#4A6FA5' },
 teamName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
 teamScore: { fontSize: 16 },
 buttonsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
 actionButton: { backgroundColor: '#4A6FA5', padding: 15, borderRadius: 10, width: '30%', alignItems: 'center' },
 buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
 summaryContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }, summaryTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
 summaryText: { fontSize: 18, marginBottom: 10 },
 tabooItem: { fontSize: 16, color: '#FF5252' },
 nextButton: { backgroundColor: '#4A6FA5', padding: 15, borderRadius: 10, marginTop: 20 }
});

export default Game;

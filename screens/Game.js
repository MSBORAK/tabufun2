import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Vibration, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import words from '../data/words.json';

const { width, height } = Dimensions.get('window');

const Game = ({ route, navigation }) => {
  const { teamA = 'A Takımı', teamB = 'B Takımı', timeLimit = 60, passCount: initialPass = 3 } = route.params || {};

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
  const [gameStats, setGameStats] = useState({
    totalRounds: 0,
    totalCorrect: 0,
    totalPass: 0,
    totalTaboo: 0
  });

  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const wordAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getNextWord();
    startAnimations();
  }, []);

  useEffect(() => {
    if (isRoundOver) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRoundOver]);

  // Timer animasyonu
  useEffect(() => {
    const progress = timeLeft / timeLimit;
    Animated.timing(timerAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateWord = () => {
    Animated.sequence([
      Animated.timing(wordAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(wordAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCorrect = () => {
    Vibration.vibrate(100);
    if (currentTeam === 'A') setTeamAScore(prev => prev + 10);
    else setTeamBScore(prev => prev + 10);
    setCorrectCount(prev => prev + 1);
    setGameStats(prev => ({ ...prev, totalCorrect: prev.totalCorrect + 1 }));
    animateWord();
    getNextWord();
  };

  const handlePass = () => {
    if (passCount > 0) {
      Vibration.vibrate(50);
      setPassCount(prev => prev - 1);
      setPassUsedCount(prev => prev + 1);
      setGameStats(prev => ({ ...prev, totalPass: prev.totalPass + 1 }));
      animateWord();
      getNextWord();
    } else {
      Alert.alert('Pas Hakkı Yok!', 'Pas hakkınız bitti!');
    }
  };

  const handleTaboo = () => {
    Vibration.vibrate([100, 50, 100]);
    if (currentTeam === 'A') setTeamAScore(prev => Math.max(0, prev - 5));
    else setTeamBScore(prev => Math.max(0, prev - 5));
    setTabooWordsUsed(prev => [...prev, currentWord]);
    setGameStats(prev => ({ ...prev, totalTaboo: prev.totalTaboo + 1 }));
    animateWord();
    getNextWord();
  };

  const handleTimeUp = () => {
    Vibration.vibrate([200, 100, 200]);
    setIsRoundOver(true);
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
    setGameStats(prev => ({ ...prev, totalRounds: prev.totalRounds + 1 }));
    getNextWord();
    startAnimations();
  };

  const saveScore = async () => {
    try {
      const currentScore = {
        date: new Date().toISOString(),
        score: Math.max(teamAScore, teamBScore),
        correct: gameStats.totalCorrect,
        pass: gameStats.totalPass,
        taboo: gameStats.totalTaboo,
        winner: teamAScore > teamBScore ? teamA : teamB,
        teamAScore,
        teamBScore
      };

      const existingScores = await AsyncStorage.getItem('tabuuScores');
      const scores = existingScores ? JSON.parse(existingScores) : [];
      scores.unshift(currentScore);
      
      const limitedScores = scores.slice(0, 50);
      await AsyncStorage.setItem('tabuuScores', JSON.stringify(limitedScores));
    } catch (error) {
      console.log("Skor kaydedilemedi:", error);
    }
  };

  const endGame = async () => {
    await saveScore();
    const winner = teamAScore > teamBScore ? teamA : teamB;
    const winnerScore = Math.max(teamAScore, teamBScore);
    Alert.alert(
      'Oyun Bitti!',
      `Kazanan: ${winner}\nSkor: ${winnerScore}`,
      [
        { text: 'Ana Menü', onPress: () => navigation.navigate('TabuuMenu') },
        { text: 'Yeni Oyun', onPress: () => navigation.navigate('NewGame') }
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTabooWords = words.find(w => w.word === currentWord)?.taboo || [];

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {isRoundOver ? (
          <View style={styles.summaryContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.summaryCard}
            >
              <Text style={styles.summaryTitle}>🎯 Tur Bitti!</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.statText}>Doğru: {correctCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="arrow-forward" size={24} color="#FF9800" />
                  <Text style={styles.statText}>Pas: {passUsedCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                  <Text style={styles.statText}>Tabu: {tabooWordsUsed.length}</Text>
                </View>
              </View>
              
              {tabooWordsUsed.length > 0 && (
                <View style={styles.tabooList}>
                  <Text style={styles.tabooListTitle}>Tabu Yapılan Kelimeler:</Text>
                  {tabooWordsUsed.map((word, index) => (
                    <Text key={index} style={styles.tabooItem}>• {word}</Text>
                  ))}
                </View>
              )}
              
              <View style={styles.summaryButtons}>
                <TouchableOpacity style={styles.nextButton} onPress={startNextRound}>
                  <LinearGradient
                    colors={['#4CAF50', '#45a049']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Sonraki Tur</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.endButton} onPress={endGame}>
                  <LinearGradient
                    colors={['#F44336', '#d32f2f']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Oyunu Bitir</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.timerContainer}>
                <Animated.View 
                  style={[
                    styles.timerProgress,
                    { width: timerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })}
                  ]}
                />
                <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
              </View>
              
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>TABU</Text>
                <View style={styles.passContainer}>
                  <Ionicons name="arrow-forward" size={20} color="#FFD700" />
                  <Text style={styles.passCount}>{passCount}</Text>
                </View>
              </View>
            </View>

            {/* Current Word */}
            <Animated.View 
              style={[
                styles.wordContainer,
                { transform: [{ scale: wordAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1]
                })}] }
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                style={styles.wordCard}
              >
                <Text style={styles.currentWord}>{currentWord}</Text>
              </LinearGradient>
            </Animated.View>

            {/* Taboo Words */}
            <View style={styles.tabooWordsContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.tabooCard}
              >
                <Text style={styles.tabooTitle}>YASAKLI KELİMELER</Text>
                <View style={styles.tabooWordsList}>
                  {currentTabooWords.map((word, index) => (
                    <Text key={index} style={styles.tabooWord}>{word}</Text>
                  ))}
                </View>
              </LinearGradient>
            </View>

            {/* Teams */}
            <View style={styles.teamsContainer}>
              <View style={[styles.team, currentTeam === 'A' && styles.activeTeam]}>
                <LinearGradient
                  colors={currentTeam === 'A' ? ['#4CAF50', '#45a049'] : ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']}
                  style={styles.teamCard}
                >
                  <Text style={[styles.teamName, currentTeam === 'A' && styles.activeTeamText]}>
                    {teamA}
                  </Text>
                  <Text style={[styles.teamScore, currentTeam === 'A' && styles.activeTeamText]}>
                    {teamAScore}
                  </Text>
                </LinearGradient>
              </View>
              
              <View style={[styles.team, currentTeam === 'B' && styles.activeTeam]}>
                <LinearGradient
                  colors={currentTeam === 'B' ? ['#2196F3', '#1976D2'] : ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']}
                  style={styles.teamCard}
                >
                  <Text style={[styles.teamName, currentTeam === 'B' && styles.activeTeamText]}>
                    {teamB}
                  </Text>
                  <Text style={[styles.teamScore, currentTeam === 'B' && styles.activeTeamText]}>
                    {teamBScore}
                  </Text>
                </LinearGradient>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCorrect} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.buttonText}>DOĞRU</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handlePass} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FF9800', '#F57C00']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                  <Text style={styles.buttonText}>PAS</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleTaboo} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#F44336', '#d32f2f']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                  <Text style={styles.buttonText}>TABU</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerContainer: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 15,
    minWidth: 100,
    alignItems: 'center',
  },
  timerProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameInfo: {
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  passContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 5,
  },
  passCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 5,
  },
  wordContainer: {
    marginBottom: 20,
  },
  wordCard: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  currentWord: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4A6FA5',
    textAlign: 'center',
  },
  tabooWordsContainer: {
    marginBottom: 30,
  },
  tabooCard: {
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabooTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  tabooWordsList: {
    alignItems: 'center',
  },
  tabooWord: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 5,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  team: {
    width: '48%',
  },
  teamCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  teamScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  activeTeamText: {
    color: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '30%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
  summaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    padding: 30,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 5,
  },
  tabooList: {
    width: '100%',
    marginBottom: 20,
  },
  tabooListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  tabooItem: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 3,
  },
  summaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  nextButton: {
    width: '45%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  endButton: {
    width: '45%',
    borderRadius: 15,
    overflow: 'hidden',
  },
});

export default Game;


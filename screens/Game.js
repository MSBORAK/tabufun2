import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Vibration, StatusBar, Alert, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import words from '../data/words.json';
import * as Font from 'expo-font';
import heart from '../assets/heart.png';
import exclamationMark from '../assets/exclamation-mark.png';
import paperPlane from '../assets/paper-plane.png';


const { width, height } = Dimensions.get('window');

const translations = {
  tr: {
    gameOver: 'Oyun Bitti!',
    winner: 'Kazanan:',
    score: 'Skor:',
    mainMenu: 'Ana Menü',
    newGame: 'Yeni Oyun',
    roundOver: 'Tur Bitti!',
    correct: 'Doğru:',
    pass: 'Pas:',
    taboo: 'Tabu:',
    tabooedWords: 'Tabu Yapılan Kelimeler:',
    nextRound: 'Sonraki Tur',
    endGame: 'Oyunu Bitir',
    noPassRights: 'Pas Hakkı Yok!',
    passRightsEnded: 'Pas hakkınız bitti!',
    tabooTitle: 'YASAKLI KELİMELER',
    tabooGame: 'TABU',
    error: 'Hata',
    noWordsFound: 'Seçilen oyun modu için kelime bulunamadı. Lütfen NewGame ekranına dönün.',
    noMoreWords: 'BİTEBİLİR',
  },
  en: {
    gameOver: 'Game Over!',
    winner: 'Winner:',
    score: 'Score:',
    mainMenu: 'Main Menu',
    newGame: 'New Game',
    roundOver: 'Round Over!',
    correct: 'Correct:',
    pass: 'Pass:',
    taboo: 'Taboo:',
    tabooedWords: 'Tabooed Words:',
    nextRound: 'Next Round',
    endGame: 'End Game',
    noPassRights: 'No Pass Rights!',
    passRightsEnded: 'You have no pass rights left!',
    tabooTitle: 'TABOO WORDS',
    tabooGame: 'TABOO',
    error: 'Error',
    noWordsFound: 'No words found for the selected game mode. Please return to the NewGame screen.',
    noMoreWords: 'NO MORE WORDS',
  },
};

const Game = ({ route, navigation }) => {
  const { teamA = 'A Takımı', teamB = 'B Takımı', timeLimit = 60, passCount: initialPass = 3, gameMode = 'adult', language = 'tr', tabooCount: initialTaboo = 3 } = route.params || {};

  const [currentWord, setCurrentWord] = useState('');
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [currentTeam, setCurrentTeam] = useState('A');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [passCount, setPassCount] = useState(initialPass);
  const [correctCount, setCorrectCount] = useState(0);
  const [passUsedCount, setPassUsedCount] = useState(0);
  const [tabooWordsUsed, setTabooWordsUsed] = useState([]);
  const [tabooLeft, setTabooLeft] = useState(initialTaboo);
  const [isPaused, setIsPaused] = useState(false);
  const [showTurnModal, setShowTurnModal] = useState(false);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalRounds: 0,
    totalCorrect: 0,
    totalPass: 0,
    totalTaboo: 0
  });
  const [fontLoaded, setFontLoaded] = useState(false);
  const [availableWords, setAvailableWords] = useState([]);

  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const wordAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        'IndieFlower': require('../assets/IndieFlower-Regular.ttf'),
      });
      setFontLoaded(true);
    })();
    
    // Oyun moduna göre kelimeleri filtrele
    let filteredWords;
    if (gameMode === 'child') {
      filteredWords = words.filter(word => word.mode === 'child' || word.mode === 'both');
    } else {
      filteredWords = words.filter(word => word.mode === 'adult' || word.mode === 'both');
    }
    setAvailableWords(filteredWords);

    // Kelime listesi boşsa uyarı ver
    if (filteredWords.length === 0) {
      Alert.alert(translations[language].error, translations[language].noWordsFound);
      navigation.goBack();
      return;
    }

    getNextWord(filteredWords, language);
    startAnimations();
    setTabooLeft(initialTaboo);
  }, [gameMode, language]); // gameMode ve language değiştiğinde bu useEffect tekrar çalışsın

  // Yeni eklenen useEffect: timeLimit ve initialPass değiştiğinde state'leri güncelle
  useEffect(() => {
    setTimeLeft(timeLimit);
    setPassCount(initialPass);
  }, [timeLimit, initialPass]);

  useEffect(() => {
    if (isRoundOver) return;
    if (isPaused) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRoundOver, isPaused]);

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
    getNextWord(availableWords, language);
  };

  const handlePass = () => {
    if (passCount > 0) {
      Vibration.vibrate(50);
      setPassCount(prev => prev - 1);
      setPassUsedCount(prev => prev + 1);
      setGameStats(prev => ({ ...prev, totalPass: prev.totalPass + 1 }));
      animateWord();
      getNextWord(availableWords, language);
    } else {
      // pas hakkı bittiğinde uyarı göstermeden görmezden gel
      return;
    }
  };

  const handleTaboo = () => {
    Vibration.vibrate([100, 50, 100]);
    if (currentTeam === 'A') setTeamAScore(prev => Math.max(0, prev - 5));
    else setTeamBScore(prev => Math.max(0, prev - 5));
    setTabooWordsUsed(prev => [...prev, currentWord]);
    setGameStats(prev => ({ ...prev, totalTaboo: prev.totalTaboo + 1 }));
    animateWord();
    setTabooLeft(prev => Math.max(0, prev - 1));
    if (tabooLeft - 1 <= 0) {
      // tabu hakkı bittiğinde daha fazla tabu sayılmaz
      return;
    }
    getNextWord(availableWords, language);
  };

  const handleTimeUp = () => {
    Vibration.vibrate([200, 100, 200]);
    setIsRoundOver(true);
    setIsPaused(true);
    setShowTurnModal(true);
  };

  const getNextWord = (wordList, lang) => {
    if (wordList.length === 0) {
      setCurrentWord(translations[lang].noMoreWords);
      return;
    }
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const nextWordObject = wordList[randomIndex];
    setCurrentWord(lang === 'en' ? nextWordObject.english_word : nextWordObject.word);
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
    getNextWord(availableWords, language);
    startAnimations();
    setTabooLeft(initialTaboo);
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
        teamBScore,
        gameMode,
        language,
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
      translations[language].gameOver,
      `${translations[language].winner} ${winner}\n${translations[language].score} ${winnerScore}`,
      [
        { text: translations[language].mainMenu, onPress: () => navigation.navigate('TabuuMenu') },
        { text: translations[language].newGame, onPress: () => navigation.navigate('NewGame') }
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTabooWords = (
    words.find(w => w.word === currentWord) || 
    words.find(w => w.english_word === currentWord)
  );
  const displayTabooWords = language === 'en' ? currentTabooWords?.english_taboo : currentTabooWords?.taboo || [];

  if (!fontLoaded) {
    return null; // Font yüklenene kadar hiçbir şey gösterme
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.linedBackground}>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={styles.line} />
        ))}
      </View>
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {isRoundOver ? (
          <View style={styles.summaryContainer}>
            <View style={styles.notebookPage}>
              <Text style={styles.summaryTitle}>{translations[language].roundOver}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.statText}>{translations[language].correct} {correctCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="arrow-forward" size={24} color="#FF9800" />
                  <Text style={styles.statText}>{translations[language].pass} {passUsedCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                  <Text style={styles.statText}>{translations[language].taboo} {tabooWordsUsed.length}</Text>
                </View>
              </View>
              
              {displayTabooWords.length > 0 && (
                <View style={styles.tabooList}>
                  <Text style={styles.tabooListTitle}>{translations[language].tabooedWords}</Text>
                  {tabooWordsUsed.map((word, index) => (
                    <Text key={index} style={styles.tabooItem}>• {word}</Text>
                  ))}
                </View>
              )}
              
              <View style={styles.summaryButtons}>
                <TouchableOpacity style={styles.nextButton} onPress={startNextRound}>
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>{translations[language].nextRound}</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.endButton} onPress={endGame}>
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>{translations[language].endGame}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.timerContainer}>
                <Ionicons name="hourglass-outline" size={24} color="#8B4513" style={{ marginRight: 8 }} />
                <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
              </View>
              
              <View style={styles.gameInfo}>
                <Text style={[styles.gameTitle, { textAlign: 'center' }]}>{translations[language].tabooGame}</Text>
                <View style={styles.passContainer}>
                  <Ionicons name="arrow-forward" size={20} color="#8B4513" />
                  <Text style={styles.passLabel}>{translations[language].pass}</Text>
                  <Text style={styles.passCount}>{passCount}</Text>
                </View>
              <View style={styles.passContainer}>
                <Ionicons name="close-circle" size={20} color="#F44336" />
                <Text style={styles.passLabel}>{translations[language].taboo}</Text>
                <Text style={styles.passCount}>{tabooLeft}</Text>
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
              <View style={styles.wordCard}>
                <Text
                  style={styles.currentWord}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                >
                  {currentWord}
                </Text>
              </View>
            </Animated.View>

            {/* Taboo Words */}
            <View style={styles.tabooWordsContainer}>
              <View style={styles.tabooCard}>
                <Text style={styles.tabooTitle}>{translations[language].tabooTitle}</Text>
                <View style={styles.tabooWordsList}>
                  {displayTabooWords.map((word, index) => (
                    <Text key={index} style={styles.tabooWord}>{word}</Text>
                  ))}
                </View>
              </View>
            </View>

            {/* Teams */}
            <View style={styles.teamsContainer}>
              <View style={[styles.team, currentTeam === 'A' && styles.activeTeam]}>
                <View style={styles.teamCard}>
                  <Text style={[styles.teamName, currentTeam === 'A' && styles.activeTeamText]}>
                    {teamA}
                  </Text>
                  <Text style={[styles.teamScore, currentTeam === 'A' && styles.activeTeamText]}>
                    {teamAScore}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.team, currentTeam === 'B' && styles.activeTeam]}>
                <View style={styles.teamCard}>
                  <Text style={[styles.teamName, currentTeam === 'B' && styles.activeTeamText]}>
                    {teamB}
                  </Text>
                  <Text style={[styles.teamScore, currentTeam === 'B' && styles.activeTeamText]}>
                    {teamBScore}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCorrect} activeOpacity={0.8}>
                <View style={[styles.buttonContent, styles.correctButton]}>
                  <Image source={heart} style={styles.actionIcon} />
                  <Text style={styles.buttonText}>{translations[language].correct}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handlePass} activeOpacity={0.8}>
                <View style={[styles.buttonContent, styles.passButton]}>
                  <Image source={paperPlane} style={styles.actionIcon} />
                  <Text style={styles.buttonText}>{translations[language].pass}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleTaboo} activeOpacity={0.8}>
                <View style={[styles.buttonContent, styles.tabooButton]}>
                  <Image source={exclamationMark} style={styles.actionIcon} />
                  <Text style={styles.buttonText}>{translations[language].taboo}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Pause/Resume */}
            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setIsPaused(prev => !prev)}
                style={{
                  backgroundColor: isPaused ? '#66BB6A' : '#FFB74D',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#8B4513',
                }}
              >
                <Text style={{ color: '#fff', fontFamily: 'IndieFlower', fontSize: 18, fontWeight: 'bold' }}>
                  {isPaused ? 'Devam Et' : 'Durdur'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Turn modal */}
      <Modal transparent visible={showTurnModal} animationType="fade">
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.25)' }}>
          <View style={{ backgroundColor:'#fff', borderRadius:16, padding:24, borderWidth:2, borderColor:'#8B4513', width:'80%' }}>
            <Text style={{ fontFamily:'IndieFlower', fontSize:24, color:'#8B4513', textAlign:'center', marginBottom:12 }}>
              Sıra {currentTeam === 'A' ? teamB : teamA} takımında!
            </Text>
            <TouchableOpacity onPress={() => { setShowTurnModal(false); setIsPaused(false); }} style={{ alignSelf:'center', backgroundColor:'#5b9bd5', paddingVertical:10, paddingHorizontal:16, borderRadius:12, borderWidth:2, borderColor:'#8B4513' }}>
              <Text style={{ color:'#fff', fontFamily:'IndieFlower', fontSize:18, fontWeight:'bold' }}>Devam Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6e3', // Defter kağıdı rengi
  },
  linedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 80,
  },
  line: {
    height: 1,
    backgroundColor: '#e0e0e0', // Çizgi rengi
    marginVertical: 18, // Çizgiler arası boşluk
    width: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 28,
    // paddingBottom removed as flex will handle it
  },
  scrollContent: {
    // Removed as it's no longer a ScrollView
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerContainer: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 110,
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  timer: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B4513',
    fontFamily: 'IndieFlower',
  },
  gameInfo: {
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    fontFamily: 'IndieFlower',
  },
  passContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  passCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginLeft: 6,
    fontFamily: 'IndieFlower',
  },
  passLabel: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 6,
    fontFamily: 'IndieFlower',
  },
  wordContainer: {
    marginBottom: 10,
  },
  wordCard: {
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    backgroundColor: '#fff',
    borderWidth: 3, // Thicker border
    borderColor: '#8B4513',
  },
  currentWord: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4A6FA5',
    textAlign: 'center',
    fontFamily: 'IndieFlower',
  },
  tabooWordsContainer: {
    marginBottom: 14,
  },
  tabooCard: {
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#F44336', // Red border for taboo
  },
  tabooTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'IndieFlower',
  },
  tabooWordsList: {
    alignItems: 'center',
  },
  tabooWord: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 6,
    fontFamily: 'IndieFlower',
    textDecorationLine: 'line-through',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  team: {
    width: '48%',
  },
  teamCard: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    fontFamily: 'IndieFlower',
  },
  teamScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'IndieFlower',
  },
  activeTeam: {
    transform: [{ scale: 1.08 }], // More pronounced active effect
  },
  activeTeamText: {
    color: '#4A6FA5', // Blue for active team text
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '31%', // Adjusted width for better spacing
    borderRadius: 20, // More rounded
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonContent: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  correctButton: {
    backgroundColor: '#66BB6A', // Softer green
  },
  passButton: {
    backgroundColor: '#FFB74D', // Softer orange
  },
  tabooButton: {
    backgroundColor: '#EF5350', // Softer red
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 6,
    fontFamily: 'IndieFlower',
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginBottom: 4,
  },
  summaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notebookPage: {
    backgroundColor: '#fff',
    borderRadius: 15, // More rounded
    padding: 30, // Increased padding
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  summaryTitle: {
    fontSize: 32, // Larger
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#8B4513',
    fontFamily: 'IndieFlower',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 25,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 18, // Slightly larger
    fontWeight: '500',
    color: '#8B4513',
    marginTop: 8,
    fontFamily: 'IndieFlower',
  },
  tabooList: {
    width: '100%',
    marginBottom: 25,
  },
  tabooListTitle: {
    fontSize: 18, // Slightly larger
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'IndieFlower',
  },
  tabooItem: {
    fontSize: 16, // Slightly larger
    color: '#F44336',
    marginBottom: 5,
    fontFamily: 'IndieFlower',
    textAlign: 'center',
  },
  summaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 25,
  },
  nextButton: {
    width: '48%',
    borderRadius: 20, // More rounded
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  endButton: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default Game;


import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Vibration, StatusBar, Alert, Image, Modal, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import words from '../data/words.json';
import * as Font from 'expo-font';
import { BlurView } from 'expo-blur';
import heart from '../assets/heart.png';
import exclamationMark from '../assets/exclamation-mark.png';
import paperPlane from '../assets/paper-plane.png';
import number1 from '../assets/number-1.png';
import number2 from '../assets/number-2.png';
import number3 from '../assets/numbre-3.png';
import colosseum from '../assets/colosseum.png';
import londonEye from '../assets/london-eye.png';
import galataTower from '../assets/galata-tower.png';
import pyramids from '../assets/pyramids.png';


const { width, height } = Dimensions.get('window');

const translations = {
  tr: {
    gameOver: 'Oyun Bitti!',
    winner: 'Kazanan:',
    score: 'Skor:',
    mainMenu: 'Oyunu Bitir',
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
    countdown: 'Geri Sayım',
    start: 'BAŞLA!',
    continueGame: 'Oyuna Devam Et',
    playAgain: 'Tekrar Oyna',
    tabooRightsEnded: 'Tabu hakkınız bitti!'
  },
  en: {
    gameOver: 'Game Over!',
    winner: 'Winner:',
    score: 'Score:',
    mainMenu: 'End Game',
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
    countdown: 'Countdown',
    start: 'START!',
    continueGame: 'Continue Game',
    playAgain: 'Play Again',
    tabooRightsEnded: 'No taboo rights left!'
  },
};

const Game = ({ route, navigation }) => {
  const { teamA = 'A Takımı', teamB = 'B Takımı', timeLimit = 60, passCount: initialPass = 3, gameMode = 'adult', language = 'tr', tabooCount: initialTaboo = 3 } = route.params || {};
  const routeMaxSets = route.params?.maxSets ?? 1;

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
    totalRounds: 1, // Start with 1 as the first round is active
    totalCorrect: 0,
    totalPass: 0,
    totalTaboo: 0
  });
  const [teamStats, setTeamStats] = useState({
    A: { correct: 0, pass: 0, taboo: 0, tabooWords: [] },
    B: { correct: 0, pass: 0, taboo: 0, tabooWords: [] },
  });
  const [fontLoaded, setFontLoaded] = useState(false);
  const [availableWords, setAvailableWords] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [showCountdownModal, setShowCountdownModal] = useState(true);
  const [maxRounds, setMaxRounds] = useState(routeMaxSets * 2); // A ve B için set sayısı x2
  const [showFinalScoreModal, setShowFinalScoreModal] = useState(false);
  const [winningScore, setWinningScore] = useState(route.params?.winPoints ?? 300); // Kazanma puanı

  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const wordAnim = useRef(new Animated.Value(0)).current;
  const countdownAnim = useRef(new Animated.Value(1)).current; // Başlangıçta 1, küçülecek
  const countdownOpacityAnim = useRef(new Animated.Value(1)).current; // Başlangıçta görünür
  const numberImageAnim = useRef(new Animated.Value(0)).current;
  const countdownTranslateYAnim = useRef(new Animated.Value(30)).current; // aşağıdan yukarı anim
  const isMounted = useRef(true); // Component'in mount durumunu takip etmek için

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        'IndieFlower': require('../assets/IndieFlower-Regular.ttf'),
      });
      setFontLoaded(true);
    })();
    
    // Component unmount olduğunda isMounted değerini false yap
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    let filteredWords;
    if (gameMode === 'child') {
      filteredWords = words.filter(word => word.mode === 'child' || word.mode === 'both');
    } else {
      filteredWords = words.filter(word => word.mode === 'adult' || word.mode === 'both');
    }
    setAvailableWords(filteredWords);

    if (filteredWords.length === 0) {
      Alert.alert(translations[language].error, translations[language].noWordsFound);
      navigation.goBack();
      return;
    }

    if (!showCountdownModal && isMounted.current) {
      getNextWord(filteredWords, language);
      startAnimations();
      setTabooLeft(initialTaboo);
    }
  }, [gameMode, language, showCountdownModal]);

  useEffect(() => {
    setTimeLeft(timeLimit);
    setPassCount(initialPass);
  }, [timeLimit, initialPass]);

  useEffect(() => {
    if (route.params?.initialTeamAScore !== undefined) {
      setTeamAScore(route.params.initialTeamAScore);
    }
    if (route.params?.initialTeamBScore !== undefined) {
      setTeamBScore(route.params.initialTeamBScore);
    }
  }, [route.params?.initialTeamAScore, route.params?.initialTeamBScore]);

  useEffect(() => {
    if (isRoundOver) return;
    if (isPaused) return;
    if (showCountdownModal) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRoundOver, isPaused, showCountdownModal]);

  useEffect(() => {
    if (!showCountdownModal) return;

    countdownAnim.setValue(1); 
    countdownOpacityAnim.setValue(0); 
    countdownTranslateYAnim.setValue(30);
    
    // İlk değer (3) için animasyonu hemen oynat
    Animated.sequence([
      Animated.parallel([
        Animated.timing(countdownAnim, { toValue: 1.2, duration: 260, useNativeDriver: true }),
        Animated.timing(countdownOpacityAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(countdownTranslateYAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(countdownAnim, { toValue: 0.95, duration: 240, useNativeDriver: true }),
        Animated.timing(countdownOpacityAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(countdownTranslateYAnim, { toValue: -10, duration: 240, useNativeDriver: true }),
      ]),
    ]).start();
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          // "BAŞLA!" için aynı anim mantığı
          countdownTranslateYAnim.setValue(30);
          countdownOpacityAnim.setValue(0);
          Animated.sequence([
            Animated.parallel([
              Animated.timing(countdownAnim, { toValue: 1.5, duration: 350, useNativeDriver: true }),
              Animated.timing(countdownOpacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
              Animated.timing(countdownTranslateYAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
            ]),
            Animated.parallel([
              Animated.timing(countdownAnim, { toValue: 0.9, duration: 300, useNativeDriver: true }),
              Animated.timing(countdownOpacityAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
              Animated.timing(countdownTranslateYAnim, { toValue: -10, duration: 300, useNativeDriver: true }),
            ]),
          ]).start(() => {
            // Animasyon bittiğinde modalı kapat ve oyunu başlat
            setShowCountdownModal(false);
            if (isMounted.current) { // Component hala mounted ise
                getNextWord(availableWords, language);
                startAnimations();
                setTabooLeft(initialTaboo);
            }
          });
          return translations[language].start; 
        }
        // 3, 2, 1 için giriş animasyonu (aşağıdan yukarı)
        countdownTranslateYAnim.setValue(30);
        countdownOpacityAnim.setValue(0);
        Animated.sequence([
          Animated.parallel([
            Animated.timing(countdownAnim, { toValue: 1.2, duration: 260, useNativeDriver: true }),
            Animated.timing(countdownOpacityAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
            Animated.timing(countdownTranslateYAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(countdownAnim, { toValue: 0.95, duration: 240, useNativeDriver: true }),
            Animated.timing(countdownOpacityAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
            Animated.timing(countdownTranslateYAnim, { toValue: -10, duration: 240, useNativeDriver: true }),
          ]),
        ]).start();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [showCountdownModal, language, availableWords]);
  
  useEffect(() => {
    if (showCountdownModal && typeof countdown === 'number') {
      Animated.sequence([
        Animated.timing(numberImageAnim, {
          toValue: 1,
          duration: 0, 
          useNativeDriver: true,
        }),
        Animated.timing(numberImageAnim, {
          toValue: 0,
          duration: 800, 
          delay: 200, 
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [countdown, showCountdownModal]);

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
    setTeamStats(prev => ({
      ...prev,
      [currentTeam]: { ...prev[currentTeam], correct: prev[currentTeam].correct + 1 }
    }));
    animateWord();
    if (teamAScore + 10 >= winningScore || teamBScore + 10 >= winningScore) {
        handleTimeUp(); // Puan limitine ulaşılırsa turu bitir
        return;
    }
    getNextWord(availableWords, language);
  };

  const handlePass = () => {
    if (passCount > 0) {
      Vibration.vibrate(50);
      setPassCount(prev => prev - 1);
      setPassUsedCount(prev => prev + 1);
      setGameStats(prev => ({ ...prev, totalPass: prev.totalPass + 1 }));
      setTeamStats(prev => ({
        ...prev,
        [currentTeam]: { ...prev[currentTeam], pass: prev[currentTeam].pass + 1 }
      }));
      animateWord();
      getNextWord(availableWords, language);
    } else {
      return;
    }
  };

  const handleTaboo = () => {
    // If no taboo rights left, behave like pass when rights are over: do nothing
    if (tabooWordsUsed.length >= initialTaboo || tabooLeft <= 0) {
      return;
    }
    Vibration.vibrate([100, 50, 100]);
    if (currentTeam === 'A') setTeamAScore(prev => Math.max(0, prev - 5));
    else setTeamBScore(prev => Math.max(0, prev - 5));
    setTabooWordsUsed(prev => [...prev, currentWord]);
    setGameStats(prev => ({ ...prev, totalTaboo: prev.totalTaboo + 1 }));
    setTeamStats(prev => ({
      ...prev,
      [currentTeam]: {
        ...prev[currentTeam],
        taboo: prev[currentTeam].taboo + 1,
        tabooWords: [...prev[currentTeam].tabooWords, currentWord]
      }
    }));
    animateWord();
    setTabooLeft(prev => Math.max(0, prev - 1));
    
    getNextWord(availableWords, language);
  };

  const handleTimeUp = () => {
    Vibration.vibrate([200, 100, 200]);
    // If game should end now (after B finished or someone reached winning score), go to final directly
    if (gameStats.totalRounds >= maxRounds || teamAScore >= winningScore || teamBScore >= winningScore) {
      endGame();
      return;
    }
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
    const someoneReachedTarget = teamAScore >= winningScore || teamBScore >= winningScore;
    // End if maxRounds completed OR someone reached target and last played team was B (so both had chance)
    if (gameStats.totalRounds >= maxRounds || (someoneReachedTarget && currentTeam === 'B')) {
      endGame();
      return;
    }
    setCountdown(3); // Geri sayımı sıfırla
    setShowCountdownModal(true); // Yeni tur başlamadan önce geri sayımı göster
    setCurrentTeam(prev => (prev === 'A' ? 'B' : 'A'));
    setTimeLeft(timeLimit);
    setPassCount(initialPass);
    setCorrectCount(0);
    setPassUsedCount(0);
    setTabooWordsUsed([]);
    setIsRoundOver(false);
    setGameStats(prev => ({ ...prev, totalRounds: prev.totalRounds + 1 }));
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

  const endGame = async (disableContinue = false) => {
    await saveScore();
    const someoneReachedTarget = teamAScore >= winningScore || teamBScore >= winningScore;
    const fairEndReached = gameStats.totalRounds >= maxRounds || (someoneReachedTarget && currentTeam === 'B');
    const allowContinue = !(disableContinue || fairEndReached);
    navigation.navigate('FinalResults', {
      teamA,
      teamB,
      teamAScore,
      teamBScore,
      language,
      totalCorrect: gameStats.totalCorrect,
      totalPass: gameStats.totalPass,
      totalTaboo: gameStats.totalTaboo,
      teamAStats: teamStats.A,
      teamBStats: teamStats.B,
      timeLimit,
      passCount: initialPass,
      tabooCount: initialTaboo,
      winPoints: winningScore,
      gameMode,
      allowContinue,
    });
  };

  const endGameToMenu = async () => {
    await saveScore();
    setShowFinalScoreModal(false);
    navigation.navigate('TabuuMenu');
  };

  const startNewSet = () => {
    setShowFinalScoreModal(false);
    setCountdown(3); 
    setShowCountdownModal(true); 
    setCurrentTeam('A'); // Always start new set with Team A
    setTimeLeft(timeLimit);
    setPassCount(initialPass);
    setCorrectCount(0);
    setPassUsedCount(0);
    setTabooWordsUsed([]);
    setIsRoundOver(false);
    setGameStats(prev => ({ ...prev, totalRounds: 1, totalCorrect: 0, totalPass: 0, totalTaboo: 0 })); // Reset round stats
    setTabooLeft(initialTaboo);
    getNextWord(availableWords, language); // Get a new word for the new set
    startAnimations();
  };

  const startRematch = () => {
    // Completely restart scores but keep teams and settings
    setShowFinalScoreModal(false);
    setTeamAScore(0);
    setTeamBScore(0);
    setCountdown(3);
    setShowCountdownModal(true);
    setCurrentTeam('A');
    setTimeLeft(timeLimit);
    setPassCount(initialPass);
    setCorrectCount(0);
    setPassUsedCount(0);
    setTabooWordsUsed([]);
    setIsRoundOver(false);
    setGameStats({ totalRounds: 1, totalCorrect: 0, totalPass: 0, totalTaboo: 0 });
    setTabooLeft(initialTaboo);
    getNextWord(availableWords, language);
    startAnimations();
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
  const displayTabooWords = language === 'en' 
    ? (currentTabooWords?.english_taboo || []) 
    : (currentTabooWords?.taboo || []);

  if (!fontLoaded) {
    return null; 
  }

  const getNumberImage = (num) => {
    switch (num) {
      case 1:
        return number1;
      case 2:
        return number2;
      case 3:
        return number3;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.linedBackground}>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={styles.line} />
        ))}
      </View>
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Doodles (behind content) */}
        <View style={styles.doodlesContainer} pointerEvents="none">
          <Image source={colosseum} style={styles.colosseumDoodle} />
          <Image source={londonEye} style={styles.londonEyeDoodle} />
          <Image source={galataTower} style={styles.galataTowerDoodle} />
          <Image source={pyramids} style={styles.pyramidsDoodle} />
        </View>
        {isRoundOver ? (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryBackdrop} />
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
              
              <View style={styles.centerHeaderContent}>
                <Text style={styles.teamTurnText}>
                  Sıra: {currentTeam === 'A' ? teamA : teamB}
                </Text>
              </View>
              
              <View style={styles.passTabooContainer}>
                <View style={styles.passContainer}>
                  <Ionicons name="arrow-forward" size={20} color="#8B4513" />
                  <Text style={styles.passLabel}>{translations[language].pass}</Text>
                  <Text style={styles.passCount}>{passCount}</Text>
                </View>
                <View style={styles.passContainer}>
                  <Ionicons name="close-circle" size={20} color="#F44336" />
                  <Text style={styles.passLabel}>{translations[language].taboo}</Text>
                  <Text style={styles.passCount}>{initialTaboo - tabooWordsUsed.length}</Text>
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
                <Ionicons name={isPaused ? "play" : "pause"} size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>

      {isPaused && !isRoundOver && (
        <View style={styles.blurOverlay}>
          {Platform.OS === 'android' ? (
            <>
              <BlurView intensity={100} tint="default" style={StyleSheet.absoluteFillObject} />
              <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
              <View style={styles.blurAmplifierAndroid} />
            </>
          ) : (
            <>
              <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFillObject} />
              <View style={styles.blurAmplifierIOS} />
            </>
          )}
          <View style={styles.pauseCard}>
            <Ionicons name="pause" size={40} color="#8B4513" />
            <Text style={styles.pauseText}>Durduruldu</Text>
            <TouchableOpacity onPress={() => setIsPaused(false)} style={styles.resumeBtn}>
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.resumeText}>Devam Et</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => endGame(true)} style={styles.pauseEndBtn}>
              <Ionicons name="stop" size={22} color="#fff" />
              <Text style={styles.resumeText}>{translations[language].endGame}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Turn modal */}
      <Modal transparent visible={showTurnModal} animationType="fade">
        <View style={{ flex:1, justifyContent:'flex-end', alignItems:'center', backgroundColor:'rgba(0,0,0,0.25)' }}>
          <View style={{ backgroundColor:'#fff', borderRadius:16, padding:24, borderWidth:2, borderColor:'#8B4513', width:'80%', alignItems:'center', marginBottom: 40 }}>
            <Text style={{ fontFamily:'IndieFlower', fontSize:24, color:'#8B4513', textAlign:'center' }}>
              Sıra {currentTeam === 'A' ? teamB : teamA} takımında!
            </Text>
            <TouchableOpacity onPress={() => { setShowTurnModal(false); setIsPaused(false); startNextRound(); }} style={{ marginTop:12, alignSelf:'center', backgroundColor:'#7fb7ff', paddingVertical:10, paddingHorizontal:16, borderRadius:12, borderWidth:2, borderColor:'#8B4513' }}>
              <Text style={{ color:'#fff', fontFamily:'IndieFlower', fontSize:18, fontWeight:'normal' }}>Devam Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Countdown modal */}
      <Modal
        transparent
        visible={showCountdownModal}
        animationType="none" // Animasyon olmadan direkt görünür olsun
      >
        <View style={styles.countdownOverlay}>
          <View style={styles.linedBackground}>
            {[...Array(20)].map((_, i) => (
              <View key={i} style={styles.line} />
            ))}
          </View>
          <Animated.View style={[
            styles.countdownCircle,
            { transform: [{ scale: countdownAnim }, { translateY: countdownTranslateYAnim }], opacity: countdownOpacityAnim }
          ]}>
            {typeof countdown === 'number' ? (
              <Image source={getNumberImage(countdown)} style={styles.countdownImage} />
            ) : (
              <Text style={styles.countdownText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>{countdown}</Text>
            )}
          </Animated.View>
        </View>
      </Modal>
      {/* Final Score Modal */}
      <Modal transparent visible={showFinalScoreModal} animationType="fade">
        <View style={styles.countdownOverlay}> 
          <View style={styles.finalScoreNotebookPage}>
            <Text style={styles.finalScoreTitle}>{translations[language].gameOver}</Text>
            
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Image source={heart} style={styles.finalScoreIcon} />
                  <Text style={styles.statText}>{translations[language].correct} {gameStats.totalCorrect}</Text>
                </View>
                <View style={styles.statItem}>
                  <Image source={paperPlane} style={styles.finalScoreIcon} />
                  <Text style={styles.statText}>{translations[language].pass} {gameStats.totalPass}</Text>
                </View>
                <View style={styles.statItem}>
                  <Image source={exclamationMark} style={styles.finalScoreIcon} />
                  <Text style={styles.statText}>{translations[language].taboo} {gameStats.totalTaboo}</Text>
                </View>
            </View>

            <View style={styles.finalScoreDetail}>
              <Text style={styles.finalScoreText}>{teamA}: {teamAScore}</Text>
            </View>
            <View style={styles.finalScoreDetail}>
              <Text style={styles.finalScoreText}>{teamB}: {teamBScore}</Text>
            </View>
            <Text style={styles.winnerText}>
              {teamAScore > teamBScore ? `${translations[language].winner} ${teamA}` : teamBScore > teamAScore ? `${translations[language].winner} ${teamB}` : "Berabere!"}
            </Text>
            <View style={styles.summaryButtons}>
              <TouchableOpacity style={styles.nextButton} onPress={startNewSet}>
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>{translations[language].continueGame}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.endButton} onPress={startRematch}>
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>{translations[language].playAgain}</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.summaryButtons}>
              <TouchableOpacity style={[styles.endButton, { width: '80%' }]} onPress={endGameToMenu}>
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>{translations[language].endGame}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  doodlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
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
  centerHeaderContent: {
    flex: 1, // Take up remaining space
    alignItems: 'center', // Center its content
  },
  gameInfo: { // This style will no longer be used directly in JSX, but keeping it for reference if needed
    alignItems: 'center',
  },
  gameTitle: { // This style is likely no longer needed in the header based on the new layout
    fontSize: 28,
    fontWeight: 'normal',
    color: '#8B4513',
    fontFamily: 'IndieFlower',
    textAlign: 'center',
  },
  teamTurnText: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#8B4513',
    fontFamily: 'IndieFlower',
    marginBottom: 8,
  },
  passTabooContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end', // Align items to the right
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
  passLabel: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 6,
    fontFamily: 'IndieFlower',
  },
  passCount: {
    fontSize: 18,
    fontWeight: 'bold',
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
    fontWeight: 'normal',
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
    color: '#9C27B0',
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
    fontWeight: 'normal',
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
    fontWeight: 'normal',
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
    fontWeight: 'normal',
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
    fontWeight: 'normal',
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
  countdownOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf6e3',
  },
  countdownCircle: {
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').width * 0.5,
    borderRadius: Dimensions.get('window').width * 0.25,
    backgroundColor: '#8B4513', // Kahverengi
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#fff',
  },
  countdownText: {
    fontSize: 60,
    fontWeight: 'normal',
    color: '#fff',
    fontFamily: 'IndieFlower',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  countdownImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  finalScoreNotebookPage: {
    backgroundColor: '#fff',
    borderRadius: 15, 
    padding: 30, 
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#8B4513',
    width: '85%',
    alignItems: 'center',
  },
  finalScoreTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    fontFamily: 'IndieFlower',
    marginBottom: 16,
    textAlign: 'center',
  },
  finalScoreDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  finalScoreText: {
    fontSize: 20,
    fontWeight: 'normal',
    color: '#333',
    fontFamily: 'IndieFlower',
  },
  winnerText: {
    fontSize: 22,
    fontWeight: 'normal',
    color: '#8B4513',
    fontFamily: 'IndieFlower',
    marginBottom: 20,
  },
  finalScoreIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)'
  },
  pauseCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderWidth: 2,
    borderColor: '#8B4513',
    alignItems: 'center',
  },
  pauseText: {
    fontFamily: 'IndieFlower',
    fontSize: 20,
    color: '#8B4513',
    marginVertical: 8,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5b9bd5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B4513',
    marginTop: 6,
  },
  resumeText: {
    color: '#fff',
    marginLeft: 8,
    fontFamily: 'IndieFlower',
    fontSize: 18,
    fontWeight: 'normal',
  },
  pauseEndBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF5350',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B4513',
    marginTop: 10,
  },
  blurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.32)'
  },
  blurAmplifierIOS: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.45)'
  },
  blurAmplifierAndroid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.95)'
  },
  colosseumDoodle: { position: 'absolute', top: 90, left: 8, width: 28, height: 28, opacity: 0.14, resizeMode: 'contain' },
  londonEyeDoodle: { position: 'absolute', top: 60, right: 12, width: 30, height: 30, opacity: 0.14, resizeMode: 'contain' },
  galataTowerDoodle: { position: 'absolute', bottom: 120, left: 16, width: 26, height: 26, opacity: 0.14, resizeMode: 'contain' },
  pyramidsDoodle: { position: 'absolute', bottom: 60, right: 16, width: 32, height: 32, opacity: 0.14, resizeMode: 'contain' },
});

// Adjust padding for Android status bar
if (Platform.OS === 'android') {
  styles.container = { ...styles.container, paddingTop: StatusBar.currentHeight || 0 };
}

export default Game;


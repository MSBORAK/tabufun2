import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Vibration, StatusBar, Image, Modal, SafeAreaView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveStyles, isTablet, isLargeTablet, getResponsiveFontSize, getResponsivePadding, getResponsiveIconSize } from '../utils/responsive';
import wordsEasy from '../data/words_easy.json';
import wordsMedium from '../data/words_medium.json';
import wordsHard from '../data/words_hard.json';
import wordsCharadesEasy from '../data/words_charades_easy.json';
import wordsCharadesMedium from '../data/words_charades_medium.json';
import wordsCharadesHard from '../data/words_charades_hard.json';
import wordsCharadesUltra from '../data/words_charades_ultra.json';
import wordsCharadesBase from '../data/words_charades.json';
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
import SoundManager from '../utils/sounds';


const { width, height } = Dimensions.get('window');
const PAPER_BG = '#fdf6e3';

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
    noWordsFound: 'Seçilen oyun modu için kelime bulunamadı. Lütfen Yeni Oyun ekranına dönün.',
    noMoreWords: 'KELİME KALMADI',
    noMoreUserWords: 'Kendi kartlarınız bitti. Lütfen yeni kelime ekleyin veya Yeni Oyun\'a dönün.',
    noMoreWordsGeneric: 'Bu tur için kelime kalmadı.',
    countdown: 'Geri Sayım',
    start: 'BAŞLA!',
    continueGame: 'Oyuna Devam Et',
    playAgain: 'Tekrar Oyna',
    tabooRightsEnded: 'Tabu hakkınız bitti!',
    paused: 'Durduruldu',
    resume: 'Devam Et',
    turn: 'Sıra:',
    draw: 'Berabere!',
    threeTabooPenalty: '3 Tabu Cezası!',
    ok: 'Tamam'
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
    noWordsFound: 'No words found for the selected game mode. Please return to the New Game screen.',
    noMoreWords: 'NO MORE WORDS',
    noMoreUserWords: 'No more custom cards. Please add new words or return to New Game.',
    noMoreWordsGeneric: 'No more words for this round.',
    countdown: 'Countdown',
    start: 'START!',
    continueGame: 'Continue Game',
    playAgain: 'Play Again',
    tabooRightsEnded: 'No taboo rights left!',
    ok: 'OK',
    paused: 'Paused',
    resume: 'Resume',
    turn: 'Turn:',
    draw: 'Draw!',
    threeTabooPenalty: '3 Tabu Cezası!',
    ok: 'OK'
  },
};

const Game = ({ route, navigation }) => {
  const { teamA = 'A Takımı', teamB = 'B Takımı', timeLimit = 60, passCount: initialPass = 3, gameMode = 'adult', language = 'tr', tabooCount: initialTaboo = 3 } = route.params || {};
  const routeMaxSets = route.params?.maxSets ?? 1;

  const [currentWord, setCurrentWord] = useState('');
  const [currentWordObject, setCurrentWordObject] = useState(null);
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [currentTeam, setCurrentTeam] = useState('A');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [passCount, setPassCount] = useState(initialPass);
  const [correctCount, setCorrectCount] = useState(0);
  const [passUsedCount, setPassUsedCount] = useState(0);
  const [tabooWordsUsed, setTabooWordsUsed] = useState([]);
  const [roundCorrectWords, setRoundCorrectWords] = useState([]);
  const [roundPassWords, setRoundPassWords] = useState([]);
  const [tabooLeft, setTabooLeft] = useState(initialTaboo);
  const [isPaused, setIsPaused] = useState(false);
  const [showTurnModal, setShowTurnModal] = useState(false);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [roundInfoText, setRoundInfoText] = useState('');
  const [gameStats, setGameStats] = useState({
    totalRounds: 1, // Start with 1 as the first round is active
    totalCorrect: 0,
    totalPass: 0,
    totalTaboo: 0
  });
  const [teamStats, setTeamStats] = useState({
    A: { correct: 0, pass: 0, taboo: 0, correctWords: [], passWords: [], tabooWords: [] },
    B: { correct: 0, pass: 0, taboo: 0, correctWords: [], passWords: [], tabooWords: [] },
  });
  const [fontLoaded, setFontLoaded] = useState(false);
  const [availableWords, setAvailableWords] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [showCountdownModal, setShowCountdownModal] = useState(true);
  const [maxRounds, setMaxRounds] = useState(routeMaxSets * 2); // A ve B için set sayısı x2
  const [showFinalScoreModal, setShowFinalScoreModal] = useState(false);
  // winningScore kaldırıldı – oyun sadece tur sayısına göre biter
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '', shouldGoBack: false });
  // Settings-driven gameplay tweaks
  const [penaltyEnabled, setPenaltyEnabled] = useState(true);
  const [penaltyPoints, setPenaltyPoints] = useState(20);
  const [comboEnabled, setComboEnabled] = useState(true);
  const [combo3Bonus, setCombo3Bonus] = useState(5);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [silentMode, setSilentMode] = useState(route.params?.silentMode ?? false); // Sessiz Sinema modu
  const [consecutiveTaboos, setConsecutiveTaboos] = useState(0);
  const [displayTabooWords, setDisplayTabooWords] = useState([]);

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
      // Sesleri hazırla
      await SoundManager.init();
      // Load advanced settings
      try {
        const saved = await AsyncStorage.getItem('tabuuSettings');
        if (saved) {
          const s = JSON.parse(saved);
          setPenaltyEnabled(s.penaltyEnabled ?? true);
          setPenaltyPoints(Number(s.penaltyPoints ?? 20)); // Düzeltme burada: ?? 1 yerine ?? 20
          setComboEnabled(s.comboEnabled ?? true);
          setCombo3Bonus(Number(s.combo3 ?? 5));
          if (typeof s.soundEnabled === 'boolean') {
            SoundManager.setEnabled(s.soundEnabled);
          }
        }
      } catch (e) {
        // noop
      }
    })();
    
    // Component unmount olduğunda isMounted değerini false yap
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Kaynağı seç
      let baseWords = [];
      const buildCharadesPool = (mode) => {
        const primary = mode === 'easy'
          ? wordsCharadesEasy
          : mode === 'medium'
            ? wordsCharadesMedium
            : mode === 'hard'
              ? wordsCharadesHard
              : wordsCharadesUltra;
        // Tüm charades setlerini bir araya getir ve benzersizleştir
        const merged = [
          ...primary,
          ...wordsCharadesBase,
          ...wordsCharadesEasy,
          ...wordsCharadesMedium,
          ...wordsCharadesHard,
          ...wordsCharadesUltra,
        ];
        const seen = new Set();
        const unique = [];
        for (const w of merged) {
          const key = `${w.word}|${w.english_word}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(w);
          }
        }
        // En az 50 kelime olsun; yetmezse döngüsel tekrarlarla doldur
        if (unique.length >= 50) return unique.slice(0, unique.length);
        const filled = [...unique];
        let idx = 0;
        while (filled.length < 50 && unique.length > 0) {
          filled.push(unique[idx % unique.length]);
          idx += 1;
        }
        return filled;
      };
      if (gameMode === 'custom') {
        // Kullanıcı kartları (Sessiz Sinema açık olsa bile öncelik ver)
        try {
          const raw = await AsyncStorage.getItem('userWords');
          if (raw) {
            const user = JSON.parse(raw);
            baseWords = (Array.isArray(user) ? user : []).map(u => ({
              word: u.word,
              english_word: u.english_word ?? u.word,
              taboo: Array.isArray(u.taboo) ? u.taboo : [],
              english_taboo: Array.isArray(u.english_taboo) ? u.english_taboo : (Array.isArray(u.taboo) ? u.taboo : []),
              mode: 'both',
            }));
          }
        } catch (_) {}
        // Sessiz sinema + custom seçiliyken kullanıcı kartı yoksa charades'a düş
        if (silentMode && baseWords.length === 0) {
          baseWords = buildCharadesPool(gameMode);
        }
      } else if (silentMode) {
        // Sessiz Sinema modu: zorluğa göre dahili listeler ve en az 50 kelime garantisi
        baseWords = buildCharadesPool(gameMode);
      } else {
        // Dahili json'lardan sadece gerekli alanları kopyala (hafıza ve GC için daha hafif)
        const source = gameMode === 'easy' ? wordsEasy : gameMode === 'medium' ? wordsMedium : wordsHard;
        baseWords = source.map(w => ({
          word: w.word,
          english_word: w.english_word,
          taboo: w.taboo,
          english_taboo: w.english_taboo,
        }));
      }

      if (cancelled) return;
      setAvailableWords(baseWords);
      if (baseWords.length === 0) {
        setIsPaused(true);
        setShowTurnModal(false);
        setShowCountdownModal(false);
        setErrorModal({ visible: true, title: translations[language].error, message: translations[language].noWordsFound, shouldGoBack: true });
        return;
      }
    })();
    return () => { cancelled = true; };
  }, [gameMode, language, silentMode]);

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
    if (errorModal.visible) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRoundOver, isPaused, showCountdownModal, errorModal.visible]);

  useEffect(() => {
    if (!showCountdownModal) return;
    if (errorModal.visible) return;

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
          // "BAŞLA!" için animasyon
          countdownTranslateYAnim.setValue(30);
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
            // Animasyon bittiğinde önce pause'u kaldır, sonra modalı kapat
            setIsPaused(false);
            setShowCountdownModal(false);
          });
          return translations[language].start; 
        }
        // 3, 2, 1 için giriş animasyonu (aşağıdan yukarı)
        countdownTranslateYAnim.setValue(30);
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
  }, [showCountdownModal, language, errorModal.visible]);

  // When countdown closes, fetch next word and start animations
  useEffect(() => {
    if (!showCountdownModal && isMounted.current) {
      if (errorModal.visible) return;
      // Kelimeyi ve UI'ı hazırla; modal kapanmadan çağrılmış olabilir
      getNextWord(availableWords, language);
      startAnimations();
      setTabooLeft(initialTaboo);
      setShowTurnModal(false);
    }
  }, [showCountdownModal, language, initialTaboo, errorModal.visible]);

  const startAnimations = () => {
    // Animasyonları sıfırla; küçük değerler daha akıcı
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.96);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  };

  const animateWord = () => {
    wordAnim.setValue(0);
    Animated.timing(wordAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start(() => {
      Animated.timing(wordAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start();
    });
  };

  const handleCorrect = () => {
    if (!silentMode) Vibration.vibrate(100);
    SoundManager.playCorrect();
    let added = 10;
    const newStreak = consecutiveCorrect + 1;
    if (comboEnabled && newStreak % 3 === 0) {
      added += combo3Bonus;
    }
    if (currentTeam === 'A') setTeamAScore(prev => prev + added);
    else setTeamBScore(prev => prev + added);
    setCorrectCount(prev => prev + 1);
    setConsecutiveCorrect(newStreak);
    setGameStats(prev => ({ ...prev, totalCorrect: prev.totalCorrect + 1 }));
    setConsecutiveTaboos(0);
    setRoundCorrectWords(prev => [...prev, currentWord]);
    setTeamStats(prev => ({
      ...prev,
      [currentTeam]: {
        ...prev[currentTeam],
        correct: prev[currentTeam].correct + 1,
        correctWords: [...prev[currentTeam].correctWords, currentWord],
      }
    }));
    animateWord();
    const projected = currentTeam === 'A' ? (teamAScore + added) : (teamBScore + added);
    // Puan limitine göre bitirme kaldırıldı
    getNextWord(availableWords, language);
  };

  const handlePass = () => {
    if (passCount > 0) {
      if (!silentMode) Vibration.vibrate(50);
      SoundManager.playPass();
      setPassCount(prev => prev - 1);
      setPassUsedCount(prev => prev + 1);
      setConsecutiveCorrect(0);
      setGameStats(prev => ({ ...prev, totalPass: prev.totalPass + 1 }));
      setConsecutiveTaboos(0);
      setRoundPassWords(prev => [...prev, currentWord]);
      setTeamStats(prev => ({
        ...prev,
        [currentTeam]: {
          ...prev[currentTeam],
          pass: prev[currentTeam].pass + 1,
          passWords: [...prev[currentTeam].passWords, currentWord],
        }
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
    if (!silentMode) Vibration.vibrate([100, 50, 100]);
    SoundManager.playTaboo();
    const normalPenalty = 10; // Her tabu için sabit kesinti
    const newTabooStreak = consecutiveTaboos + 1;
    // 3. ardışık tabu ise, tek seferde sadece penaltyPoints kadar kes (10 + ekstra değil)
    const deduct = (penaltyEnabled && newTabooStreak % 3 === 0)
      ? Math.max(0, Number(penaltyPoints) || 0)
      : normalPenalty;
    if (currentTeam === 'A') setTeamAScore(prev => Math.max(0, prev - deduct));
    else setTeamBScore(prev => Math.max(0, prev - deduct));
    setTabooWordsUsed(prev => [...prev, currentWord]);
    setGameStats(prev => ({ ...prev, totalTaboo: prev.totalTaboo + 1 }));
    if (penaltyEnabled && newTabooStreak % 3 === 0) setConsecutiveTaboos(0); else setConsecutiveTaboos(newTabooStreak);
    setConsecutiveCorrect(0);
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
    // Sadece tur sayısına göre bitir
    if (gameStats.totalRounds >= maxRounds) {
      endGame();
      return;
    }
    // Build round progress text
    try {
      const roundsCompleted = gameStats.totalRounds; // current round index
      const isTurkish = language === 'tr';
      const nextRoundNumber = Math.min(roundsCompleted + 1, maxRounds);
      const currentRoundText = isTurkish ? `${roundsCompleted}. tur bitti` : `Round ${roundsCompleted} finished`;
      const nextRoundText = isTurkish ? `${nextRoundNumber}. tura geçelim` : `Let's start round ${nextRoundNumber}`;
      setRoundInfoText(`${currentRoundText} • ${nextRoundText}`);
    } catch {}
    setIsRoundOver(true);
    setIsPaused(true);
    // Only show round summary; do not stack the turn modal on top
    setShowTurnModal(false);
  };

  const getNextWord = (wordList, lang) => {
    if (wordList.length === 0) {
      // Kelime bittiğinde uyarı ver ve oyunu duraklat; kelime alanına metin basma
      setCurrentWord('');
      setCurrentWordObject(null);
      setDisplayTabooWords([]);
      setIsPaused(true);
      setShowTurnModal(false);
      setShowCountdownModal(false);
      const isCustom = gameMode === 'custom';
      const message = isCustom
        ? translations[language].noMoreUserWords
        : translations[language].noMoreWordsGeneric;
      setErrorModal({ visible: true, title: translations[language].error, message, shouldGoBack: true });
      return;
    }
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const nextWordObject = wordList[randomIndex];
    // Remove the selected word from the available words list to prevent repetition
    const newAvailableWords = [...wordList];
    newAvailableWords.splice(randomIndex, 1);
    setAvailableWords(newAvailableWords);

    setCurrentWordObject(nextWordObject);
    setCurrentWord(lang === 'en' ? nextWordObject.english_word : nextWordObject.word);
    const tabooArr = Array.isArray(lang === 'en' ? nextWordObject.english_taboo : nextWordObject.taboo)
      ? (lang === 'en' ? nextWordObject.english_taboo : nextWordObject.taboo)
      : [];
    setDisplayTabooWords(tabooArr);
  };

  // Dil değişince mevcut kelimenin tabu listesini yeniden seç
  useEffect(() => {
    if (!currentWordObject) return;
    const tabooArr = Array.isArray(language === 'en' ? currentWordObject.english_taboo : currentWordObject.taboo)
      ? (language === 'en' ? currentWordObject.english_taboo : currentWordObject.taboo)
      : [];
    setDisplayTabooWords(tabooArr);
  }, [language, currentWordObject]);

  const startNextRound = () => {
    // Sadece tur sayısına göre bitir
    if (gameStats.totalRounds >= maxRounds) {
      endGame();
      return;
    }
    // Ensure content won’t flash any previous word while countdown shows
    setCurrentWord('');
    setIsPaused(true); // Geri sayım boyunca pause modunda tut
    setShowTurnModal(false);
    setCountdown(3); // Geri sayımı sıfırla
    setShowCountdownModal(true); // Yeni tur başlamadan önce geri sayımı göster
    setCurrentTeam(prev => (prev === 'A' ? 'B' : 'A'));
    setTimeLeft(timeLimit);
    setPassCount(initialPass);
    setCorrectCount(0);
    setPassUsedCount(0);
    setTabooWordsUsed([]);
    setRoundCorrectWords([]);
    setRoundPassWords([]);
    setIsRoundOver(false);
    setGameStats(prev => ({ ...prev, totalRounds: prev.totalRounds + 1 }));
    setTabooLeft(initialTaboo);
    // Takım bazlı kelime listelerini koru; sadece tur bazlı listeleri sıfırlıyoruz
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
        silentMode,
        teamAStats: teamStats.A,
        teamBStats: teamStats.B,
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
    navigation.replace('FinalResults', {
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
      // winPoints kaldırıldı
      gameMode,
      silentMode,
      allowContinue: false,
    });
  };

  const endGameToMenu = async () => {
    await saveScore();
    setShowFinalScoreModal(false);
    navigation.reset({ index: 0, routes: [{ name: 'TabuuMenu' }] });
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
    setRoundCorrectWords([]);
    setRoundPassWords([]);
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
    setRoundCorrectWords([]);
    setRoundPassWords([]);
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

  // Tabu kelimeleri artık sadece seçilen kelimenin objesinden okunur (performans)

  if (!fontLoaded) {
    return null; 
  }

  const otherTeamName = currentTeam === 'A' ? teamB : teamA;
  const turnMessage = language === 'en' ? `It's ${otherTeamName}'s turn!` : `Sıra: ${otherTeamName}`;

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
      
      {!showCountdownModal && (
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
            <View style={styles.notebookPage}>
              <Text style={styles.summaryTitle}>{translations[language].roundOver}</Text>
              {!!roundInfoText && (
                <Text style={styles.roundInfo}>{roundInfoText}</Text>
              )}
              <View style={styles.badgesRow}>
                <View style={[styles.badge, { backgroundColor: '#66BB6A' }]}>
                  <Image source={heart} style={styles.badgeIcon} />
                  <Text style={styles.badgeCount}>{correctCount}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: '#FFB74D' }]}>
                  <Image source={paperPlane} style={styles.badgeIcon} />
                  <Text style={styles.badgeCount}>{passUsedCount}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: '#EF5350' }]}>
                  <Image source={exclamationMark} style={styles.badgeIcon} />
                  <Text style={styles.badgeCount}>{tabooWordsUsed.length}</Text>
                </View>
              </View>
              
              <ScrollView 
                style={styles.wordListScrollView}
                contentContainerStyle={styles.wordListContainer}
                showsVerticalScrollIndicator={true}
              >
                {(roundCorrectWords.length > 0 || roundPassWords.length > 0 || tabooWordsUsed.length > 0) && (
                  <View style={styles.tabooList}>
                    {roundCorrectWords.length > 0 && (
                      <>
                        <Text style={[styles.tabooListTitle, { color: '#66BB6A' }]}>{translations[language].correct}</Text>
                        <View style={styles.wordsPanel}>
                          {roundCorrectWords.map((word, index) => (
                            <Text key={`c-${index}`} style={[styles.wordItem, { color: '#66BB6A' }]}>• {word}</Text>
                          ))}
                        </View>
                      </>
                    )}
                    {roundPassWords.length > 0 && (
                      <>
                        <Text style={[styles.tabooListTitle, { color: '#FFB74D' }]}>{translations[language].pass}</Text>
                        <View style={styles.wordsPanel}>
                          {roundPassWords.map((word, index) => (
                            <Text key={`p-${index}`} style={[styles.wordItem, { color: '#FFB74D' }]}>• {word}</Text>
                          ))}
                        </View>
                      </>
                    )}
                    {tabooWordsUsed.length > 0 && (
                      <>
                        <Text style={[styles.tabooListTitle, { color: '#EF5350' }]}>{translations[language].taboo}</Text>
                        <View style={styles.wordsPanel}>
                          {tabooWordsUsed.map((word, index) => (
                            <Text key={`t-${index}`} style={[styles.wordItem, styles.tabooWordSummary]}>• {word}</Text>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
                )}
              </ScrollView>
              
            <View style={styles.summaryButtons}>
              <TouchableOpacity style={[styles.nextButton, { width: '80%' }]} onPress={startNextRound} activeOpacity={0.85}>
                <View style={[styles.buttonContent, styles.nextButtonColor]}>
                  <Text style={styles.buttonText}>{translations[language].nextRound}</Text>
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
                  {translations[language].turn} {currentTeam === 'A' ? teamA : teamB}
                </Text>
              </View>
              
              <View style={styles.passTabooContainer}>
                <View style={styles.passContainer}>
                  <Ionicons name="arrow-forward" size={20} color="#FFD700" />
                  <Text style={styles.passLabel}>{translations[language].pass}</Text>
                  <Text style={styles.passCount}>{passCount}</Text>
                </View>
              {!silentMode && (
                <View style={styles.passContainer}>
                  <Ionicons name="close-circle" size={20} color="#F44336" />
                  <Text style={styles.passLabel}>{translations[language].taboo}</Text>
                  <Text style={styles.passCount}>{initialTaboo - tabooWordsUsed.length}</Text>
                </View>
              )}
              </View>
            </View>

            {/* Current Word */}
      <Animated.View 
              style={[
                styles.wordContainer,
                { transform: [{ scale: wordAnim.interpolate({
                  inputRange: [0, 1],
            outputRange: [1, 1.06]
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
            {!silentMode && (
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
            )}

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
              
              {!silentMode && (
               <TouchableOpacity style={styles.actionButton} onPress={handleTaboo} activeOpacity={0.8}>
                 <View style={[styles.buttonContent, styles.tabooButton]}>
                   <Image source={exclamationMark} style={styles.actionIcon} />
                   <Text style={styles.buttonText}>{translations[language].taboo}</Text>
                 </View>
               </TouchableOpacity>
              )}
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
      )}

      {(isPaused && !isRoundOver && !errorModal.visible && !showCountdownModal) && (
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
            <Text style={styles.pauseText}>{translations[language].paused}</Text>
            <TouchableOpacity onPress={() => setIsPaused(false)} style={styles.resumeBtn}>
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.resumeText}>{translations[language].resume}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => endGame(true)} style={styles.pauseEndBtn}>
              <Ionicons name="stop" size={22} color="#fff" />
              <Text style={styles.resumeText}>{translations[language].endGame}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showTurnModal && (
        <Modal transparent visible={true} animationType="fade">
          <View style={{ flex:1, justifyContent:'flex-end', alignItems:'center', backgroundColor:'rgba(0,0,0,0.25)' }}>
            <View style={{ backgroundColor:'#fff', borderRadius:16, padding:20, borderWidth:2, borderColor:'#8B4513', width:'85%', alignItems:'center', marginBottom: 28 }}>
              <Text style={{ fontFamily:'IndieFlower', fontSize:22, color:'#8B4513', textAlign:'center' }}>
                {turnMessage}
              </Text>
              <TouchableOpacity onPress={() => { setShowTurnModal(false); setIsPaused(false); startNextRound(); }} style={{ marginTop:10, alignSelf:'center', backgroundColor:'#7fb7ff', paddingVertical:10, paddingHorizontal:16, borderRadius:12, borderWidth:2, borderColor:'#8B4513' }}>
                <Text style={{ color:'#fff', fontFamily:'IndieFlower', fontSize:18, fontWeight:'normal' }}>{translations[language].continueGame}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      {/* Countdown modal */}
      <Modal
        transparent
        visible={showCountdownModal && !errorModal.visible}
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
      {/* Error Modal */}
      <Modal visible={errorModal.visible} transparent animationType="fade" onRequestClose={() => setErrorModal({ visible: false, title: '', message: '', shouldGoBack: false })}>
        <View style={styles.modalBackdrop} pointerEvents="auto">
          <View style={styles.modalCard}>
            <Ionicons name="alert-circle" size={42} color="#8B4513" style={{ marginBottom: 8 }} />
            <Text style={styles.modalTitle}>{errorModal.title}</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <TouchableOpacity
              onPress={() => {
                setErrorModal({ visible: false, title: '', message: '', shouldGoBack: false });
                if (errorModal.shouldGoBack) {
                  navigation.goBack();
                }
              }}
              style={styles.modalButton}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>{translations[language].ok}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAPER_BG, // Defter kağıdı rengi
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
    paddingHorizontal: getResponsivePadding(16),
    paddingTop: getResponsivePadding(48),
    maxWidth: isLargeTablet() ? 900 : '100%',
    alignSelf: 'center',
    width: '100%',
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
    flexDirection: isLargeTablet() ? 'row' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsivePadding(16),
    flexWrap: isTablet() ? 'wrap' : 'nowrap',
  },
  timerContainer: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: getResponsivePadding(8),
    paddingHorizontal: getResponsivePadding(12),
    minWidth: getResponsivePadding(110),
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
    fontSize: getResponsiveFontSize(22),
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
    color: '#8B4513',
    fontFamily: 'IndieFlower',
    marginBottom: 8,
  },
  roundInfo: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    fontFamily: 'IndieFlower',
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
    paddingHorizontal: Platform.OS === 'android' ? 8 : 10,
    paddingVertical: Platform.OS === 'android' ? 4 : 6,
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
    color: '#8B4513',
    marginLeft: 6,
    fontFamily: 'IndieFlower',
  },
  wordContainer: {
    marginBottom: 10,
  },
  wordCard: {
    padding: Platform.OS === 'android' ? 20 : 24,
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
    fontSize: getResponsiveFontSize(40),
    color: '#4A6FA5',
    textAlign: 'center',
    fontFamily: 'IndieFlower',
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    // iOS/Android aynı görünüm için hafif gölge
    textShadowColor: '#4A6FA5',
    textShadowOffset: { width: 0.6, height: 0.6 },
    textShadowRadius: 0.8,
  },
  tabooWordsContainer: {
    marginBottom: 14,
  },
  tabooCard: {
    padding: Platform.OS === 'android' ? 15 : 18,
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
    fontSize: 22,
    color: '#9C27B0',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'IndieFlower',
    letterSpacing: 1,
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    textShadowColor: '#9C27B0',
    textShadowOffset: { width: 0.6, height: 0.6 },
    textShadowRadius: 0.8,
  },
  tabooWordsList: {
    alignItems: 'center',
  },
  tabooWord: {
    fontSize: 65,
    color: '#FF0000',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica-Bold' : 'sans-serif-black',
    textDecorationLine: 'line-through',
    textTransform: 'uppercase',
    fontWeight: '900',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 3,
    textAlign: 'center',
  },
  tabooWordSummary: {
    color: '#EF5350',
    textDecorationLine: 'line-through',
    fontFamily: 'IndieFlower',
    fontSize: 18,
  },
  teamsContainer: {
    flexDirection: isLargeTablet() ? 'row' : 'row',
    justifyContent: 'space-between',
    marginBottom: getResponsivePadding(14),
    maxWidth: isLargeTablet() ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  team: {
    width: '48%',
  },
  teamCard: {
    padding: Platform.OS === 'android' ? 15 : 18,
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
    marginBottom: 8,
    color: '#333',
    fontFamily: 'IndieFlower',
  },
  teamScore: {
    fontSize: 24,
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
    flexDirection: isLargeTablet() ? 'row' : 'row',
    justifyContent: 'space-between',
    maxWidth: isLargeTablet() ? 700 : '100%',
    alignSelf: 'center',
    width: '100%',
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
    paddingVertical: Platform.OS === 'android' ? 10 : 12,
    paddingHorizontal: Platform.OS === 'android' ? 8 : 10,
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
    padding: Platform.OS === 'android' ? 25 : 30, // Adjusted padding
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  summaryTitle: {
    fontSize: 32,
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
  badgesRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, marginHorizontal: 6 },
  badgeIcon: { width: 20, height: 20, marginRight: 8, resizeMode: 'contain' },
  badgeCount: { color: '#fff', fontFamily: 'IndieFlower', fontSize: 20 },
  statText: {
    fontSize: 18, // Unify platform sizes
    color: '#8B4513',
    marginTop: 8,
    fontFamily: 'IndieFlower',
  },
  tabooList: {
    width: '100%',
    marginBottom: 25,
  },
  wordListScrollView: {
    maxHeight: 300,
    width: '100%',
  },
  wordListContainer: {
    paddingBottom: 20,
  },
  tabooListTitle: {
    fontSize: 18, // Unify platform sizes
    color: '#F44336',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'IndieFlower',
  },
  wordsPanel: { marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  wordItem: { fontFamily: 'IndieFlower', fontSize: 16, marginBottom: 6, marginRight: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.03)' },
  
  tabooWord: { color: '#EF5350' },
  tabooItem: {
    fontSize: 16, // Adjusted font size
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
  nextButtonColor: {
    backgroundColor: '#5b9bd5',
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
    backgroundColor: PAPER_BG,
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
    padding: Platform.OS === 'android' ? 25 : 30, 
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
    color: '#333',
    fontFamily: 'IndieFlower',
  },
  winnerText: {
    fontSize: 22,
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
    // Removed dark overlay to keep background clean and cheerful
    height: 0,
    width: 0,
  },
  pauseCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    paddingVertical: Platform.OS === 'android' ? 15 : 18,
    paddingHorizontal: Platform.OS === 'android' ? 18 : 22,
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
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
    paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
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
  },
  pauseEndBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF5350',
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
    paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
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
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#8B4513',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'android' ? 15 : 20,
    paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: '#8B4513',
    fontFamily: 'IndieFlower',
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'IndieFlower',
  },
  modalButton: {
    backgroundColor: '#a9d5ee',
    borderRadius: 14,
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
    paddingHorizontal: Platform.OS === 'android' ? 15 : 18,
    width: '60%',
    borderWidth: 2,
    borderColor: '#8B4513',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#8B4513',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'IndieFlower',
  },
});

// Adjust padding for Android status bar
if (Platform.OS === 'android') {
  styles.container = { ...styles.container, paddingTop: StatusBar.currentHeight || 0 };
}

export default Game;


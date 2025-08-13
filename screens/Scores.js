import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, StatusBar, Image, SafeAreaView, Modal, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import notebook from '../assets/notebook.png';
import pinwheel from '../assets/pinwheel.png';
import colosseum from '../assets/colosseum.png';
import londonEye from '../assets/london-eye.png';
import galataTower from '../assets/galata-tower.png';
import pyramids from '../assets/pyramids.png';


const translations = {
  tr: {
    scoresTitle: 'SKORLAR',
    clearScores: 'Skorları Temizle',
    confirmClearScores: 'Tüm skorları silmek istediğinizden emin misiniz?',
    cancel: 'İptal',
    delete: 'Sil',
    success: 'Başarılı',
    scoresCleared: 'Skorlar temizlendi.',
    error: 'Hata',
    failedToClearScores: 'Skorlar temizlenirken bir hata oluştu.',
    generalStats: 'Genel İstatistikler',
    gamesPlayed: 'Oynanan Oyun:',
    bestScore: 'En Yüksek Skor:',
    averageScore: 'Ortalama Skor:',
    detailedStats: 'Detaylı İstatistikler',
    totalCorrect: 'Toplam Doğru:',
    totalPass: 'Toplam Pas:',
    totalTaboo: 'Toplam Tabu:',
    lastGames: 'Son Oyunlar',
    noGamesPlayed: 'Henüz oynanmış oyun yok.',
    won: 'kazandı!',
    score: 'Skor:',
    mode: 'Mod:',
    adult: 'Yetişkin',
    child: 'Çocuk',
    failedToLoadScores: 'Skorlar yüklenemedi:',
  },
  en: {
    scoresTitle: 'SCORES',
    clearScores: 'Clear Scores',
    confirmClearScores: 'Are you sure you want to delete all scores?',
    cancel: 'Cancel',
    delete: 'Delete',
    success: 'Success',
    scoresCleared: 'Scores cleared.',
    error: 'Error',
    failedToClearScores: 'An error occurred while clearing scores.',
    generalStats: 'General Statistics',
    gamesPlayed: 'Games Played:',
    bestScore: 'Best Score:',
    averageScore: 'Average Score:',
    detailedStats: 'Detailed Statistics',
    totalCorrect: 'Total Correct:',
    totalPass: 'Total Pass:',
    totalTaboo: 'Total Taboo:',
    lastGames: 'Last Games',
    noGamesPlayed: 'No games played yet.',
    won: 'won!',
    score: 'Score:',
    mode: 'Mode:',
    adult: 'Adult',
    child: 'Child',
    failedToLoadScores: 'Failed to load scores:',
  },
};

export default function Scores() {
  const navigation = useNavigation();
  const [scores, setScores] = useState([]);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('tr');
  const [confirmModal, setConfirmModal] = useState({ visible: false });
  const [infoModal, setInfoModal] = useState({ visible: false, title: '', message: '' });

  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const loadAssetsAndSettings = async () => {
      await Font.loadAsync({
        'IndieFlower': require('../assets/IndieFlower-Regular.ttf'),
      });
      setFontLoaded(true);

      try {
        const savedSettings = await AsyncStorage.getItem('tabuuSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setCurrentLanguage(parsed.language ?? 'tr');
        }
      } catch (error) {
        console.log('Ayarlar yüklenemedi:', error);
      }
    };
    loadAssetsAndSettings();
    loadScores();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const t = translations[currentLanguage];

  const loadScores = async () => {
    try {
      const savedScores = await AsyncStorage.getItem('tabuuScores');
      if (savedScores) {
        setScores(JSON.parse(savedScores));
      }
    } catch (error) {
      console.log(t.failedToLoadScores, error);
    }
  };

  const clearScores = async () => {
    setConfirmModal({ visible: true });
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (_) {
      return '';
    }
  };

  const totalGames = scores.length;
  const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
  const averageScore = scores.length > 0 ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1) : 0;

  const overallStats = scores.reduce((acc, game) => {
    acc.totalCorrect += game.correct;
    acc.totalPass += game.pass;
    acc.totalTaboo += game.taboo;
    return acc;
  }, { totalCorrect: 0, totalPass: 0, totalTaboo: 0 });

  if (!fontLoaded) {
    return null; // Font yüklenene kadar hiçbir şey gösterme
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.linedBackground}>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={styles.line} />
        ))}
      </View>
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Doodle'lar */}
        <Image source={notebook} style={styles.notebookDoodle} />
        <Image source={pinwheel} style={styles.pinwheelDoodle} />
        <Image source={colosseum} style={styles.colosseumDoodle} />
        <Image source={londonEye} style={styles.londonEyeDoodle} />
        <Image source={galataTower} style={styles.galataTowerDoodle} />
        <Image source={pyramids} style={styles.pyramidsDoodle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8B4513" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Image source={notebook} style={styles.headerIconLeft} />
            <Ionicons name="trophy" size={32} color="#8B4513" />
            <Text style={styles.title}>{t.scoresTitle}</Text>
            <Image source={pinwheel} style={styles.headerIconRight} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Genel İstatistikler */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.generalStats}</Text>
            <View style={styles.statCard}>
              <View style={styles.statItem}>
                <Ionicons name="game-controller" size={24} color="#4CAF50" />
                <Text style={styles.statText}>{t.gamesPlayed} {totalGames}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star" size={24} color="#FFD700" />
                <Text style={styles.statText}>{t.bestScore} {bestScore}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="calculator" size={24} color="#2196F3" />
                <Text style={styles.statText}>{t.averageScore} {averageScore}</Text>
              </View>
            </View>
          </View>

          {/* Detaylı İstatistikler */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.detailedStats}</Text>
            <View style={styles.detailedStatsCard}>
              <View style={styles.detailedStatItem}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.detailedStatText}>{t.totalCorrect} {overallStats.totalCorrect}</Text>
              </View>
              <View style={styles.detailedStatItem}>
                <Ionicons name="arrow-forward" size={24} color="#FF9800" />
                <Text style={styles.detailedStatText}>{t.totalPass} {overallStats.totalPass}</Text>
              </View>
              <View style={styles.detailedStatItem}>
                <Ionicons name="close-circle" size={24} color="#F44336" />
                <Text style={styles.detailedStatText}>{t.totalTaboo} {overallStats.totalTaboo}</Text>
              </View>
            </View>
          </View>

          {/* Son Oyunlar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.lastGames}</Text>
            {scores.length === 0 ? (
              <Text style={styles.noScoresText}>{t.noGamesPlayed}</Text>
            ) : (
              scores.map((game, index) => (
                <View key={index} style={styles.gameItem}>
                  <Text style={styles.gameItemDate}>{formatDate(game.date)}</Text>
                  <Text style={styles.gameItemDetails}>{game.winner} {t.won} ({game.teamAScore} - {game.teamBScore})</Text>
                  <Text style={styles.gameItemScore}>{t.score} {game.score}</Text>
                  {game.gameMode && (
                    <Text style={styles.gameItemMode}>{t.mode}: {game.gameMode === 'adult' ? t.adult : t.child}</Text>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Skorları Temizle Butonu */}
          {scores.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearScores}>
              <View style={[styles.buttonContent, styles.clearButtonColor]}>
                <Ionicons name="trash" size={24} color="#fff" />
                <Text style={styles.clearButtonText}>{t.clearScores}</Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>

      {/* Confirm Delete Modal */}
      <Modal transparent visible={confirmModal.visible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="trash" size={36} color="#8B4513" />
            <Text style={styles.modalTitle}>{t.clearScores}</Text>
            <Text style={styles.modalMessage}>{t.confirmClearScores}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#a9d5ee' }]} onPress={() => setConfirmModal({ visible: false })}>
                <Text style={styles.modalBtnText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#EF5350' }]}
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem('tabuuScores');
                    setScores([]);
                    setConfirmModal({ visible: false });
                    setInfoModal({ visible: true, title: t.success, message: t.scoresCleared });
                  } catch (error) {
                    console.log(t.failedToClearScores, error);
                    setConfirmModal({ visible: false });
                    setInfoModal({ visible: true, title: t.error, message: t.failedToClearScores });
                  }
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.delete}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Info Modal */}
      <Modal transparent visible={infoModal.visible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="information-circle" size={36} color="#8B4513" />
            <Text style={styles.modalTitle}>{infoModal.title}</Text>
            <Text style={styles.modalMessage}>{infoModal.message}</Text>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#a9d5ee', alignSelf: 'center' }]} onPress={() => setInfoModal({ visible: false, title: '', message: '' })}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6e3', // iOS ile aynı ton
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
    paddingHorizontal: 25,
    paddingTop: 80,
    paddingBottom: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 25, // More rounded
    padding: 10, // Increased padding
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: Platform.OS === 'android' ? 30 : 32,
    color: '#8B4513',
    marginLeft: 10,
    fontFamily: 'IndieFlower',
  },
  headerIconLeft: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerIconRight: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'android' ? 21 : 22,
    color: '#8B4513',
    marginBottom: 15,
    fontFamily: 'IndieFlower',
    textAlign: 'center',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 20, // More rounded
    padding: Platform.OS === 'android' ? 20 : 25, // Adjusted padding
    marginBottom: 25, // Increased margin bottom
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statText: {
    fontSize: Platform.OS === 'android' ? 17 : 18, // Adjusted font size
    marginLeft: 12,
    color: '#333',
    fontFamily: 'IndieFlower',
  },
  detailedStatsCard: {
    backgroundColor: '#fff',
    borderRadius: 20, // More rounded
    padding: Platform.OS === 'android' ? 20 : 25, // Adjusted padding
    marginBottom: 25, // Increased margin bottom
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  detailedStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailedStatText: {
    fontSize: Platform.OS === 'android' ? 17 : 18, // Adjusted font size
    marginLeft: 12,
    color: '#333',
    fontFamily: 'IndieFlower',
  },
  gameItem: {
    backgroundColor: '#fff',
    borderRadius: 15, // More rounded
    padding: Platform.OS === 'android' ? 15 : 20, // Adjusted padding
    marginBottom: 15, // Increased margin bottom
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gameItemDate: {
    fontSize: Platform.OS === 'android' ? 14 : 14, // Adjusted font size
    color: '#888',
    marginBottom: 5,
    fontFamily: 'IndieFlower',
  },
  gameItemDetails: {
    fontSize: Platform.OS === 'android' ? 17 : 18, // Adjusted font size
    color: '#333',
    marginBottom: 5,
    fontFamily: 'IndieFlower',
  },
  gameItemScore: {
    fontSize: Platform.OS === 'android' ? 19 : 20, // Adjusted font size
    color: '#f47c20',
    fontFamily: 'IndieFlower',
  },
  gameItemMode: {
    fontSize: Platform.OS === 'android' ? 15 : 16, // Adjusted font size
    color: '#666',
    marginTop: 5,
    fontFamily: 'IndieFlower',
  },
  noScoresText: {
    textAlign: 'center',
    fontSize: Platform.OS === 'android' ? 17 : 18, // Adjusted font size
    color: '#888',
    marginTop: 30,
    fontFamily: 'IndieFlower',
  },
  clearButton: {
    marginTop: 40, // Increased margin top
    width: '80%',
    alignSelf: 'center',
    borderRadius: 25, // More rounded
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonContent: {
    paddingVertical: Platform.OS === 'android' ? 15 : 18, // Adjusted padding
    paddingHorizontal: Platform.OS === 'android' ? 12 : 15, // Adjusted padding
    alignItems: 'center',
    backgroundColor: '#EF5350', // Softer red for clear button
  },
  clearButtonText: {
    color: '#fff',
    fontSize: Platform.OS === 'android' ? 17 : 18, // Adjusted font size
    marginTop: 8,
    fontFamily: 'IndieFlower',
  },
  clearButtonColor: {
    backgroundColor: '#EF5350', // Matching softer red
  },
  notebookDoodle: {
    position: 'absolute',
    top: 100,
    left: -50,
    width: 100,
    height: 100,
    opacity: 0.1,
    transform: [{ rotate: '-10deg' }],
  },
  pinwheelDoodle: {
    position: 'absolute',
    top: 200,
    right: -30,
    width: 80,
    height: 80,
    opacity: 0.1,
    transform: [{ rotate: '15deg' }],
  },
  colosseumDoodle: {
    position: 'absolute',
    bottom: 100,
    left: 100,
    width: 120,
    height: 120,
    opacity: 0.1,
    transform: [{ rotate: '-5deg' }],
  },
  londonEyeDoodle: {
    position: 'absolute',
    top: 300,
    left: 200,
    width: 150,
    height: 150,
    opacity: 0.1,
    transform: [{ rotate: '5deg' }],
  },
  galataTowerDoodle: {
    position: 'absolute',
    bottom: 200,
    right: 200,
    width: 100,
    height: 100,
    opacity: 0.1,
    transform: [{ rotate: '10deg' }],
  },
  pyramidsDoodle: {
    position: 'absolute',
    top: 400,
    left: 300,
    width: 180,
    height: 180,
    opacity: 0.1,
    transform: [{ rotate: '-15deg' }],
  },
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
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: Platform.OS === 'android' ? 19 : 20,
    color: '#8B4513',
    fontFamily: 'IndieFlower',
    marginVertical: 6,
    textAlign: 'center'
  },
  modalMessage: {
    fontSize: Platform.OS === 'android' ? 16 : 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'IndieFlower',
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 14,
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
    paddingHorizontal: Platform.OS === 'android' ? 15 : 18,
    borderWidth: 2,
    borderColor: '#8B4513',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#8B4513',
    fontSize: Platform.OS === 'android' ? 16 : 16,
    fontFamily: 'IndieFlower',
  },
});

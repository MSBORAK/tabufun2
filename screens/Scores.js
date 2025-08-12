import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, StatusBar, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import notebook from '../assets/notebook.png';
import pinwheel from '../assets/pinwheel.png';


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
    Alert.alert(
      t.clearScores,
      t.confirmClearScores,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, onPress: async () => {
            try {
              await AsyncStorage.removeItem('tabuuScores');
              setScores([]);
              Alert.alert(t.success, t.scoresCleared);
            } catch (error) {
              console.log(t.failedToClearScores, error);
              Alert.alert(t.error, t.failedToClearScores);
            }
          }
        }
      ],
      { cancelable: false }
    );
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.linedBackground}>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={styles.line} />
        ))}
      </View>
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Doodle'lar */}
        

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
                  <Text style={styles.gameItemDate}>{new Date(game.date).toLocaleDateString()}</Text>
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
    </View>
  );
}

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
    paddingHorizontal: 25, // Increased horizontal padding
    paddingTop: 100, // Increased for doodles
    paddingBottom: 25, // Increased vertical padding
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25, // Adjusted margin
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
    fontSize: 32, // Slightly larger
    fontWeight: 'bold',
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
    fontSize: 22, // Slightly larger
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    fontFamily: 'IndieFlower',
    textAlign: 'center',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 20, // More rounded
    padding: 25, // Increased padding
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
    fontSize: 18, // Slightly larger
    marginLeft: 12,
    color: '#333',
    fontFamily: 'IndieFlower',
  },
  detailedStatsCard: {
    backgroundColor: '#fff',
    borderRadius: 20, // More rounded
    padding: 25, // Increased padding
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
    fontSize: 18, // Slightly larger
    marginLeft: 12,
    color: '#333',
    fontFamily: 'IndieFlower',
  },
  gameItem: {
    backgroundColor: '#fff',
    borderRadius: 15, // More rounded
    padding: 20, // Increased padding
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
    fontSize: 14, // Slightly larger
    color: '#888',
    marginBottom: 5,
    fontFamily: 'IndieFlower',
  },
  gameItemDetails: {
    fontSize: 18, // Slightly larger
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    fontFamily: 'IndieFlower',
  },
  gameItemScore: {
    fontSize: 20, // Slightly larger
    fontWeight: 'bold',
    color: '#f47c20',
    fontFamily: 'IndieFlower',
  },
  gameItemMode: {
    fontSize: 16, // Slightly larger
    color: '#666',
    marginTop: 5,
    fontFamily: 'IndieFlower',
  },
  noScoresText: {
    textAlign: 'center',
    fontSize: 18, // Slightly larger
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
    paddingVertical: 18, // Increased padding
    paddingHorizontal: 15, // Increased padding
    alignItems: 'center',
    backgroundColor: '#EF5350', // Softer red for clear button
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18, // Slightly larger
    marginTop: 8,
    fontFamily: 'IndieFlower',
  },
  clearButtonColor: {
    backgroundColor: '#EF5350', // Matching softer red
  },
});

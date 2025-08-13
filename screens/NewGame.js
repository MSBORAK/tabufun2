import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Animated, StatusBar, Modal, ScrollView, Image, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colosseum from '../assets/colosseum.png';
import londonEye from '../assets/london-eye.png';
import galataTower from '../assets/galata-tower.png';
import pyramids from '../assets/pyramids.png';

const { width, height } = Dimensions.get('window');

const translations = {
  tr: {
    newGame: 'YENİ OYUN',
    teamNames: 'Takım İsimleri:',
    teamA: 'A Takımı Adı',
    teamB: 'B Takımı Adı',
    vs: 'VS',
    gameMode: 'Zorluk:', 
    adultMode: 'Kolay',
    childMode: 'Orta',
    hardMode: 'Zor',
    ultraMode: 'Ultra Zor',
    customMode: 'Kendi Kartların',
    silentMode: 'Sessiz Mod',
    timeLimit: 'Süre Limiti (saniye):',
    passCount: 'Pas Hakkı Sayısı:',
    quickStart: 'Hızlı Başla',
    startGame: 'OYUNU BAŞLAT',
    error: 'Hata',
    emptyTeamNames: 'Takım isimleri boş bırakılamaz!',
    sameTeamNames: 'Takım isimleri aynı olamaz!',
    ok: 'Tamam',
  },
  en: {
    newGame: 'NEW GAME',
    teamNames: 'Team Names:',
    teamA: 'Team A Name',
    teamB: 'Team B Name',
    vs: 'VS',
    gameMode: 'Difficulty:',
    adultMode: 'Easy',
    childMode: 'Medium',
    hardMode: 'Hard',
    ultraMode: 'Ultra Hard',
    customMode: 'My Cards',
    silentMode: 'Silent Mode',
    timeLimit: 'Time Limit (seconds):',
    passCount: 'Pass Count:',
    quickStart: 'Quick Start',
    startGame: 'START GAME',
    error: 'Error',
    emptyTeamNames: 'Team names cannot be empty!',
    sameTeamNames: 'Team names cannot be the same!',
    ok: 'OK',
  },
};

export default function NewGame() {
  const navigation = useNavigation();
  const [teamA, setTeamA] = useState('A Takımı');
  const [teamB, setTeamB] = useState('B Takımı');
  const [timeLimit, setTimeLimit] = useState(60);
  const [passCount, setPassCount] = useState(3);
  const [tabooCount, setTabooCount] = useState(3);
  const [gameMode, setGameMode] = useState('easy'); // 'easy' | 'medium' | 'hard' | 'ultra'
  const [silentMode, setSilentMode] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('tr');
  const [winPoints, setWinPoints] = useState(250);
  const [maxSets, setMaxSets] = useState(1);
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });

  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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
          if (parsed.timeLimit) setTimeLimit(parsed.timeLimit);
          if (parsed.passCount !== undefined) setPassCount(parsed.passCount);
          if (parsed.tabuCount !== undefined) setTabooCount(parsed.tabuCount);
          if (parsed.winPoints !== undefined) setWinPoints(parsed.winPoints);
          if (parsed.maxSets !== undefined) setMaxSets(parsed.maxSets);
        }
      } catch (error) {
        console.log('Ayarlar yüklenemedi:', error);
      }
    };
    loadAssetsAndSettings();

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const t = translations[currentLanguage];

  const handleStartGame = () => {
    if (teamA.trim() === '' || teamB.trim() === '') {
      setErrorModal({ visible: true, title: t.error, message: t.emptyTeamNames });
      return;
    }
    if (teamA.trim().toLowerCase() === teamB.trim().toLowerCase()) {
      setErrorModal({ visible: true, title: t.error, message: t.sameTeamNames });
      return;
    }
    navigation.navigate('Game', { teamA, teamB, timeLimit, passCount, gameMode, language: currentLanguage, tabooCount, winPoints, maxSets, silentMode });
  };

  const handleQuickStart = () => {
    navigation.navigate('Game', { teamA: 'A Takımı', teamB: 'B Takımı', timeLimit: 90, passCount: 3, gameMode: 'easy', language: currentLanguage, tabooCount: 3, winPoints: 300, maxSets, silentMode });
  };

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
        {/* Doodles behind content */}
        <View style={styles.doodlesContainer} pointerEvents="none">
          <Image source={colosseum} style={styles.colosseumDoodle} />
          <Image source={londonEye} style={styles.londonEyeDoodle} />
          <Image source={galataTower} style={styles.galataTowerDoodle} />
          <Image source={pyramids} style={styles.pyramidsDoodle} />
        </View>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8B4513" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Ionicons name="dice" size={32} color="#8B4513" />
            <Text style={styles.title}>{t.newGame}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Takım İsimleri */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>{t.teamNames}</Text>
            <View style={styles.inputCard}>
              <Ionicons name="people" size={20} color="#8B4513" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.teamA}
                placeholderTextColor="#A0522D"
                value={teamA}
                onChangeText={setTeamA}
              />
            </View>
            <Text style={styles.vsText}>{t.vs}</Text>
            <View style={styles.inputCard}>
              <Ionicons name="people" size={20} color="#8B4513" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.teamB}
                placeholderTextColor="#A0522D"
                value={teamB}
                onChangeText={setTeamB}
              />
            </View>
          </View>

          {/* Oyun Modu Seçimi */}
          <View style={styles.section}>
            <Text style={styles.settingsTitle}>{t.gameMode}</Text>
            <View style={styles.modeButtonsContainer}>
              <TouchableOpacity
                style={[styles.modeButton, { width: '24%', marginHorizontal: '0.5%' }, gameMode === 'easy' && styles.activeModeButton]}
                onPress={() => setGameMode('easy')}
              >
                <Ionicons name="leaf" size={24} color={gameMode === 'easy' ? '#fff' : '#8B4513'} style={{ marginBottom: 6 }} />
                <Text style={[styles.modeButtonText, gameMode === 'easy' && styles.activeModeButtonText]}>{t.adultMode}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, { width: '24%', marginHorizontal: '0.5%' }, gameMode === 'medium' && styles.activeModeButton]}
                onPress={() => setGameMode('medium')}
              >
                <Ionicons name="book" size={24} color={gameMode === 'medium' ? '#fff' : '#8B4513'} style={{ marginBottom: 6 }} />
                <Text style={[styles.modeButtonText, gameMode === 'medium' && styles.activeModeButtonText]}>{t.childMode}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modeButton, { width: '24%', marginHorizontal: '0.5%' }, gameMode === 'hard' && styles.activeModeButton]} onPress={() => setGameMode('hard')}>
                <Ionicons name="flame" size={24} color={gameMode === 'hard' ? '#fff' : '#8B4513'} style={{ marginBottom: 6 }} />
                <Text style={[styles.modeButtonText, gameMode === 'hard' && styles.activeModeButtonText]}>{t.hardMode}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modeButton, { width: '24%', marginHorizontal: '0.5%' }, gameMode === 'ultra' && styles.activeModeButton]} onPress={() => setGameMode('ultra')}>
                <Ionicons name="skull" size={22} color={gameMode === 'ultra' ? '#fff' : '#8B4513'} style={{ marginBottom: 8 }} />
                <Text style={[styles.modeButtonText, gameMode === 'ultra' && styles.activeModeButtonText]}>Ultra Zor</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.modeButtonsContainer, { marginTop: 0 }]}>
              <TouchableOpacity style={[styles.modeButton, { width: '49%', marginHorizontal: '0.5%' }, gameMode === 'custom' && styles.activeModeButton]} onPress={() => setGameMode('custom')}>
                <Ionicons name="create" size={22} color={gameMode === 'custom' ? '#fff' : '#8B4513'} style={{ marginBottom: 6 }} />
                <Text style={[styles.modeButtonText, gameMode === 'custom' && styles.activeModeButtonText]}>{t.customMode}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modeButton, { width: '49%', marginHorizontal: '0.5%' }, silentMode && styles.activeModeButton]} onPress={() => setSilentMode(!silentMode)}>
                <Ionicons name="volume-mute" size={22} color={silentMode ? '#fff' : '#8B4513'} style={{ marginBottom: 6 }} />
                <Text style={[styles.modeButtonText, silentMode && styles.activeModeButtonText]}>{t.silentMode}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ayarlar Kısayolu */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.settingsShortcutButton}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.85}
            >
              <View style={[styles.buttonContent, styles.settingsShortcutColor]}> 
                <Ionicons name="settings" size={22} color="#8B4513" />
                <Text style={styles.settingsShortcutText}>{currentLanguage === 'tr' ? 'Oyun Ayarları' : 'Game Settings'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Başlat Butonları */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.quickStartButton} onPress={handleQuickStart} activeOpacity={0.8}>
              <View style={styles.buttonContent}>
                <Ionicons name="flash" size={24} color="#8B4513" />
                <Text style={styles.quickStartText}>{t.quickStart}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.startButton} onPress={handleStartGame} activeOpacity={0.8}>
              <View style={[styles.buttonContent, styles.startButtonColor]}>
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={styles.startButtonText}>{t.startGame}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
      {/* Güzel Hata Modali */}
      <Modal visible={errorModal.visible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="alert-circle" size={42} color="#8B4513" style={{ marginBottom: 8 }} />
            <Text style={styles.modalTitle}>{errorModal.title}</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <TouchableOpacity
              style={[styles.buttonContent, styles.settingsShortcutColor, styles.modalButton]}
              onPress={() => setErrorModal({ visible: false, title: '', message: '' })}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>{t.ok}</Text>
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
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,
    justifyContent: 'flex-start',
  },
  doodlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 25, // More rounded
    padding: 8,
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
    fontSize: Platform.OS === 'android' ? 22 : 24,
    fontWeight: 'normal',
    color: '#8B4513',
    marginLeft: 10,
    fontFamily: 'IndieFlower',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  section: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: Platform.OS === 'android' ? 16 : 18,
    fontWeight: 'normal',
    color: '#8B4513',
    marginBottom: 8,
    fontFamily: 'IndieFlower',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: Platform.OS === 'android' ? 16 : 18,
    color: '#333',
    fontFamily: 'IndieFlower',
  },
  vsText: {
    fontSize: Platform.OS === 'android' ? 22 : 24,
    fontWeight: 'normal',
    color: '#8B4513',
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'IndieFlower',
  },
  settingsTitle: {
    fontSize: Platform.OS === 'android' ? 18 : 20,
    fontWeight: 'normal',
    color: '#8B4513',
    marginBottom: 10,
    fontFamily: 'IndieFlower',
  },
  modeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modeButton: {
    width: '23%',
    paddingVertical: Platform.OS === 'android' ? 6 : 8,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  modeButtonText: {
    fontSize: Platform.OS === 'android' ? 13 : 14,
    fontWeight: 'normal',
    fontFamily: 'IndieFlower',
    color: '#8B4513',
  },
  activeModeButton: {
    backgroundColor: '#f4a460', // Soft orange for active
  },
  activeModeButtonText: {
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18, // Increased padding
    borderRadius: 18, // More rounded
    marginBottom: 18, // Increased margin bottom
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  settingLabel: {
    fontSize: 18, // Slightly larger
    color: '#333',
    fontWeight: 'normal',
    fontFamily: 'IndieFlower',
  },
  settingButtons: {
    flexDirection: 'row',
  },
  settingButton: {
    backgroundColor: '#a9d5ee', // Soft blue for buttons
    borderRadius: 12, // More rounded
    paddingVertical: 10, // Increased padding
    paddingHorizontal: 15, // Increased padding
    marginLeft: 12, // Increased margin
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  settingButtonText: {
    color: '#8B4513',
    fontWeight: 'normal',
    fontFamily: 'IndieFlower',
    fontSize: 16,
  },
  activeSettingButton: {
    backgroundColor: '#8B4513',
  },
  activeSettingButtonText: {
    color: '#fff',
  },
  passIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickStartButton: {
    width: '49%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  startButton: {
    width: '49%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonContent: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#f4a460', // Soft orange
  },
  startButtonColor: {
    backgroundColor: '#5b9bd5', // Soft blue
  },
  settingsShortcutColor: {
    backgroundColor: '#a9d5ee',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
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
    fontSize: Platform.OS === 'android' ? 18 : 20,
    color: '#8B4513',
    fontFamily: 'IndieFlower',
    marginBottom: 6,
    fontWeight: 'normal',
  },
  modalMessage: {
    fontSize: Platform.OS === 'android' ? 15 : 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'IndieFlower',
  },
  modalButton: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    width: '85%',
  },
  modalButtonText: {
    color: '#8B4513',
    fontSize: Platform.OS === 'android' ? 16 : 18,
    textAlign: 'center',
    fontFamily: 'IndieFlower',
  },
  quickStartText: {
    color: '#8B4513', // Brown text
    fontWeight: 'normal',
    fontSize: Platform.OS === 'android' ? 13 : 14,
    marginTop: 6,
    fontFamily: 'IndieFlower',
  },
  settingsShortcutText: {
    color: '#8B4513',
    fontWeight: 'normal',
    fontSize: Platform.OS === 'android' ? 15 : 16,
    marginTop: 6,
    fontFamily: 'IndieFlower',
  },
  settingsShortcutButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'normal',
    fontSize: Platform.OS === 'android' ? 16 : 18,
    marginTop: 6,
    fontFamily: 'IndieFlower',
  },
  colosseumDoodle: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 36,
    height: 36,
    opacity: 0.15,
  },
  londonEyeDoodle: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 40,
    height: 40,
    opacity: 0.15,
  },
  galataTowerDoodle: {
    position: 'absolute',
    bottom: 120,
    left: 30,
    width: 34,
    height: 34,
    opacity: 0.15,
  },
  pyramidsDoodle: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    width: 42,
    height: 42,
    opacity: 0.15,
  },
});

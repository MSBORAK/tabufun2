import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Animated, StatusBar, Alert, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import car from '../assets/car.png';
import notebook from '../assets/notebook.png';

const { width, height } = Dimensions.get('window');

const translations = {
  tr: {
    newGame: 'YENİ OYUN',
    teamNames: 'Takım İsimleri:',
    teamA: 'Takım A Adı',
    teamB: 'Takım B Adı',
    vs: 'VS',
    gameMode: 'Oyun Modu:',
    adultMode: 'Yetişkin Modu',
    childMode: 'Çocuk Modu',
    gameSettings: 'Oyun Ayarları:',
    timeLimit: 'Süre Limiti (saniye):',
    passCount: 'Pas Hakkı Sayısı:',
    quickStart: 'Hızlı Başla',
    startGame: 'OYUNU BAŞLAT',
    error: 'Hata',
    emptyTeamNames: 'Takım isimleri boş bırakılamaz!',
    sameTeamNames: 'Takım isimleri aynı olamaz!',
  },
  en: {
    newGame: 'NEW GAME',
    teamNames: 'Team Names:',
    teamA: 'Team A Name',
    teamB: 'Team B Name',
    vs: 'VS',
    gameMode: 'Game Mode:',
    adultMode: 'Adult Mode',
    childMode: 'Child Mode',
    gameSettings: 'Game Settings:',
    timeLimit: 'Time Limit (seconds):',
    passCount: 'Pass Count:',
    quickStart: 'Quick Start',
    startGame: 'START GAME',
    error: 'Error',
    emptyTeamNames: 'Team names cannot be empty!',
    sameTeamNames: 'Team names cannot be the same!',
  },
};

export default function NewGame() {
  const navigation = useNavigation();
  const [teamA, setTeamA] = useState('Takım A');
  const [teamB, setTeamB] = useState('Takım B');
  const [timeLimit, setTimeLimit] = useState(60);
  const [passCount, setPassCount] = useState(3);
  const [tabooCount, setTabooCount] = useState(3);
  const [gameMode, setGameMode] = useState('adult'); // 'adult', 'child' veya 'both'
  const [fontLoaded, setFontLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('tr');

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

  const LabelChip = ({ icon, label, onPress, pastelColor }) => {
    const scale = React.useRef(new Animated.Value(1)).current;
    const [pressed, setPressed] = React.useState(false);
    const handleIn = () => {
      setPressed(true);
      Animated.spring(scale, { toValue: 1.05, useNativeDriver: true, friction: 6 }).start();
    };
    const handleOut = () => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start(() => setPressed(false));
    };
    return (
      <Animated.View style={[styles.chip, { transform: [{ scale }], backgroundColor: pressed ? pastelColor : '#fffaf0' }] }>
        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={handleIn}
          onPressOut={handleOut}
          onPress={onPress}
          style={styles.chipInner}
        >
          <Ionicons name={icon} size={20} color="#2b2b2b" style={{ marginRight: 6 }} />
          <Text style={styles.chipText}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleStartGame = () => {
    if (teamA.trim() === '' || teamB.trim() === '') {
      Alert.alert(t.error, t.emptyTeamNames);
      return;
    }
    if (teamA.trim().toLowerCase() === teamB.trim().toLowerCase()) {
      Alert.alert(t.error, t.sameTeamNames);
      return;
    }
    navigation.navigate('Game', { teamA, teamB, timeLimit, passCount, gameMode, language: currentLanguage, tabooCount });
  };

  const handleQuickStart = () => {
    navigation.navigate('Game', { teamA: 'Takım A', teamB: 'Takım B', timeLimit, passCount, gameMode: 'adult', language: currentLanguage, tabooCount });
  };

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

        {/* Kısa erişim Sticker Chip'leri */}
        <View style={styles.chipsRow}>
          <LabelChip
            icon="settings-outline"
            label={t.gameSettings}
            onPress={() => navigation.navigate('Settings')}
            pastelColor="#fdebd0"
          />
          <LabelChip
            icon="trophy-outline"
            label={translations[currentLanguage].scores || 'Skorlar'}
            onPress={() => navigation.navigate('Scores')}
            pastelColor="#fff9cc"
          />
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
                style={[styles.modeButton, gameMode === 'adult' && styles.activeModeButton]}
                onPress={() => setGameMode('adult')}
              >
                <Image source={car} style={styles.modeIcon} />
                <Text style={[styles.modeButtonText, gameMode === 'adult' && styles.activeModeButtonText]}>{t.adultMode}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, gameMode === 'child' && styles.activeModeButton]}
                onPress={() => setGameMode('child')}
              >
                <Image source={notebook} style={styles.modeIcon} />
                <Text style={[styles.modeButtonText, gameMode === 'child' && styles.activeModeButtonText]}>{t.childMode}</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 60,
    paddingBottom: 12,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    marginLeft: 10,
    fontFamily: 'IndieFlower',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  section: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
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
    fontSize: 18,
    color: '#333',
    fontFamily: 'IndieFlower',
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'IndieFlower',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 10,
    fontFamily: 'IndieFlower',
  },
  modeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'IndieFlower',
    color: '#8B4513',
  },
  activeModeButton: {
    backgroundColor: '#f4a460', // Soft orange for active
  },
  activeModeButtonText: {
    color: '#fff',
  },
  modeIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
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
    fontWeight: '500',
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
    fontWeight: 'bold',
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
    justifyContent: 'space-around',
    marginTop: 16,
  },
  quickStartButton: {
    width: '48%',
    borderRadius: 25, // More rounded
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    alignSelf: 'center',
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: '#8B4513',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chipText: {
    fontFamily: 'IndieFlower',
    fontSize: 18,
    color: '#2b2b2b',
  },
  startButton: {
    width: '48%',
    borderRadius: 25, // More rounded
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
  quickStartText: {
    color: '#8B4513', // Brown text
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 6,
    fontFamily: 'IndieFlower',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 6,
    fontFamily: 'IndieFlower',
  },
});

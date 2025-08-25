import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Platform, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SoundManager from '../utils/sounds';
import AdManager from '../utils/ads';

const { width } = Dimensions.get('window');
const isTabletDevice = width >= 768;
import book from '../assets/book.png';
import heart from '../assets/heart.png';
import starfish from '../assets/starfish.png';
import pinwheel from '../assets/pinwheel.png';
import camera from '../assets/photo-camera.png';
import paperPlane from '../assets/paper-plane.png';
import exclamationMark from '../assets/exclamation-mark.png';
import car from '../assets/car.png';
import eiffelTower from '../assets/eiffel-tower.png';
import snorkel from '../assets/snorkel.png';
import colosseum from '../assets/colosseum.png';
import londonEye from '../assets/london-eye.png';
import galataTower from '../assets/galata-tower.png';
import pyramids from '../assets/pyramids.png';

const translations = {
  tr: {
    title: 'TabuFun',
    startGame: 'Oyuna Başla',
    rules: 'Kılavuz',
    settings: 'Ayarlar',
    scores: 'Skorlar',
  },
  en: {
    title: 'TabooFun',
    startGame: 'Start Game',
    rules: 'Guide',
    settings: 'Settings',
    scores: 'Scores',
  },
};

export default function TabuuMenu() {
  const navigation = useNavigation();
  const [fontLoaded, setFontLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('tr');

  const loadLanguage = async () => {
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

  useEffect(() => {
    const loadAssetsAndSettings = async () => {
      await Font.loadAsync({
        'IndieFlower': require('../assets/IndieFlower-Regular.ttf'),
      });
      setFontLoaded(true);
      await loadLanguage();
      await SoundManager.init();
    };
    loadAssetsAndSettings();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadLanguage();
    }, [])
  );

  if (!fontLoaded) {
    return null; // Font yüklenene kadar hiçbir şey gösterme
  }

  const t = translations[currentLanguage];

  const OutlinedTitle = ({ text }) => (
    <View style={styles.titleWrapper}>
      <Text style={[styles.titleBase, styles.titleOutline, { left: -2, top: 0 }]}>{text}</Text>
      <Text style={[styles.titleBase, styles.titleOutline, { left: 2, top: 0 }]}>{text}</Text>
      <Text style={[styles.titleBase, styles.titleOutline, { left: 0, top: -2 }]}>{text}</Text>
      <Text style={[styles.titleBase, styles.titleOutline, { left: 0, top: 2 }]}>{text}</Text>
      <Text style={[styles.titleBase, styles.titleFill]}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.linedBackground}>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={styles.line} />
        ))}
      </View>
      {/* Doodles: başlıktan bağımsız, boş alanlara dağılmış */}
      <Image source={heart} style={styles.heartDoodle} />
      <Image source={pinwheel} style={styles.pinwheelDoodle} />
      <Image source={camera} style={styles.cameraDoodle} />
      <Image source={paperPlane} style={styles.paperPlaneDoodle} />
      <Image source={starfish} style={styles.starfishDoodle} />
      <Image source={exclamationMark} style={styles.exclamationDoodle} />
      <Image source={car} style={styles.carDoodle} />
      <Image source={eiffelTower} style={styles.eiffelDoodle} />
      <Image source={snorkel} style={styles.snorkelDoodle} />
      <Image source={colosseum} style={styles.colosseumDoodle} />
      <Image source={londonEye} style={styles.londonEyeDoodle} />
      <Image source={galataTower} style={styles.galataTowerDoodle} />
      <Image source={pyramids} style={styles.pyramidsDoodle} />
      <View style={styles.content}>
        {/* Başlık ve İkonlar */}
        <View style={styles.header}>
          <OutlinedTitle text={t.title} />
        </View>

        {/* Menü Butonları - iPad için iki sütun layout */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={[styles.menuButton, styles.btnBlue]} onPress={() => { SoundManager.playPage(); navigation.navigate('NewGame'); }} activeOpacity={0.85}>
            <Ionicons name="game-controller" size={isTabletDevice ? 28 : 20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.menuButtonText}>{t.startGame}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuButton, styles.btnGreen]} onPress={() => { SoundManager.playPage(); navigation.navigate('Scores'); }} activeOpacity={0.85}>
            <Ionicons name="trophy" size={isTabletDevice ? 28 : 20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.menuButtonText}>{t.scores}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuButton, styles.btnCyan]} onPress={() => { SoundManager.playPage(); navigation.navigate('MyWords'); }} activeOpacity={0.85}>
            <Ionicons name="create" size={isTabletDevice ? 28 : 20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.menuButtonText}>{currentLanguage === 'tr' ? 'Kendi Kartların' : 'My Cards'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuButton, styles.btnOrange]} onPress={() => { SoundManager.playPage(); navigation.navigate('Settings'); }} activeOpacity={0.85}>
            <Ionicons name="settings" size={isTabletDevice ? 28 : 20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.menuButtonText}>{t.settings}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuButton, styles.btnPurple]} onPress={() => { SoundManager.playPage(); navigation.navigate('Help'); }} activeOpacity={0.85}>
            <Ionicons name="help-circle" size={isTabletDevice ? 28 : 20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.menuButtonText}>{t.rules}</Text>
          </TouchableOpacity>
        </View>

      </View>
      
      {/* Banner Reklam */}
      <View style={styles.bannerAdContainer}>
        <AdManager.BannerAd style={styles.bannerAd} />
      </View>
    </View>
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
    alignItems: 'center',
    paddingHorizontal: isTabletDevice ? 40 : 20,
    paddingTop: isTabletDevice ? 80 : 120,
    maxWidth: isTabletDevice ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
    position: 'relative',
  },
  menuContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  clockDoodle: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  titleWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  titleBase: {
    fontFamily: 'IndieFlower',
    fontSize: isTabletDevice ? 90 : (Platform.OS === 'android' ? 60 : 70),
    letterSpacing: 2,
    position: 'absolute',
    textTransform: 'uppercase',
    // Ensure normal weight for IndieFlower
  },
  titleFill: {
    color: '#f47c20',
    position: 'relative',
  },
  titleOutline: {
    color: '#2b2b2b',
  },
  button: {
    width: 260,
    paddingVertical: 18,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#2b2b2b',
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  orange: {
    backgroundColor: '#f47c20',
  },
  blue: {
    backgroundColor: '#4A6FA5',
  },
  buttonText: {
    fontFamily: 'IndieFlower',
    fontSize: 26,
    color: '#fff',
    letterSpacing: 1,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: isTabletDevice ? '70%' : '85%',
    paddingVertical: isTabletDevice ? 20 : 16,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#8B4513',
    marginBottom: 10,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  menuButtonText: { 
    color: '#fff', 
    fontFamily: 'IndieFlower', 
    fontSize: isTabletDevice ? 26 : (Platform.OS === 'android' ? 21 : 22),
    textAlign: 'center',
  },
  btnBlue: { backgroundColor: '#4A6FA5' },
  btnOrange: { backgroundColor: '#f47c20' },
  btnGreen: { backgroundColor: '#66BB6A' },
  btnPurple: { backgroundColor: '#9C27B0' },
  btnCyan: { backgroundColor: '#5b9bd5' },
  heartDoodle: { position: 'absolute', top: 180, left: 10, width: 32, height: 32, opacity: 0.15 },
  starfishDoodle: { position: 'absolute', bottom: 20, right: 10, width: 40, height: 40, opacity: 0.15 },
  pinwheelDoodle: { position: 'absolute', top: 250, left: '85%', width: 36, height: 36, opacity: 0.15, transform: [{ rotate: '30deg' }]},
  cameraDoodle: { position: 'absolute', top: 150, right: 20, width: 32, height: 32, opacity: 0.15 },
  paperPlaneDoodle: { position: 'absolute', bottom: 40, left: 15, width: 40, height: 40, opacity: 0.15, transform: [{ rotate: '-20deg' }]},
  numberOneDoodle: {
    position: 'absolute',
    top: 330,
    left: 20,
    width: 26,
    height: 26,
    opacity: 0.2,
  },
  numberTwoDoodle: {
    position: 'absolute',
    top: 370,
    right: 24,
    width: 28,
    height: 28,
    opacity: 0.2,
  },
  numberThreeDoodle: {
    position: 'absolute',
    bottom: 110,
    left: '58%',
    width: 28,
    height: 28,
    opacity: 0.2,
  },
  rightArrowDoodle: {
    position: 'absolute',
    bottom: 70,
    right: 30,
    width: 40,
    height: 40,
    opacity: 0.2,
  },
  notebookDoodle: {
    position: 'absolute',
    top: 300,
    left: '58%',
    width: 34,
    height: 34,
    opacity: 0.2,
  },
  exclamationDoodle: { position: 'absolute', top: 200, left: 70, width: 24, height: 24, opacity: 0.15 },
  carDoodle: { position: 'absolute', bottom: 60, left: '30%', width: 38, height: 38, opacity: 0.15 },
  eiffelDoodle: { position: 'absolute', top: 230, left: 150, width: 28, height: 28, opacity: 0.15 },
  snorkelDoodle: { position: 'absolute', bottom: 180, right: 100, width: 28, height: 28, opacity: 0.15 },
  colosseumDoodle: { position: 'absolute', top: 80, left: '45%', width: 32, height: 32, opacity: 0.15 },
  londonEyeDoodle: { position: 'absolute', bottom: 220, left: 30, width: 36, height: 36, opacity: 0.15 },
  galataTowerDoodle: { position: 'absolute', top: 120, right: 40, width: 30, height: 30, opacity: 0.15 },
  pyramidsDoodle: { position: 'absolute', bottom: 100, right: '40%', width: 34, height: 34, opacity: 0.15 },
  bookIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    paddingVertical: 5,
  },
  bannerAd: {
    width: '100%',
    height: 50,
  },
});


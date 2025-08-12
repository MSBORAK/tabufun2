import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import book from '../assets/book.png';
import heart from '../assets/heart.png';
import starfish from '../assets/starfish.png';
import pinwheel from '../assets/pinwheel.png';
import camera from '../assets/photo-camera.png';
import paperPlane from '../assets/paper-plane.png';
import number1 from '../assets/number-1.png';
import number2 from '../assets/number-2.png';
import number3 from '../assets/numbre-3.png';
import rightArrowOutline from '../assets/right-arrow-outline.png';
import notebook from '../assets/notebook.png';
import exclamationMark from '../assets/exclamation-mark.png';
import car from '../assets/car.png';
import eiffelTower from '../assets/eiffel-tower.png';
import snorkel from '../assets/snorkel.png';

const translations = {
  tr: {
    title: 'Tabu',
    startGame: 'Oyuna Başla',
    rules: 'Kurallar',
    settings: 'Ayarlar',
    scores: 'Skorlar',
  },
  en: {
    title: 'Taboo',
    startGame: 'Start Game',
    rules: 'Rules',
    settings: 'Settings',
    scores: 'Scores',
  },
};

export default function TabuuMenu() {
  const navigation = useNavigation();
  const [fontLoaded, setFontLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('tr');

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
  }, []);

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
      <Animated.View style={[styles.chip, { transform: [{ scale }] , backgroundColor: pressed ? pastelColor : '#fffaf0' }] }>
        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={handleIn}
          onPressOut={handleOut}
          onPress={onPress}
          style={styles.chipInner}
        >
          <Ionicons name={icon} size={20} color="#2b2b2b" style={{ marginRight: 6 }} />
          <Text style={styles.settingsLabelText}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
      <Image source={number1} style={styles.numberOneDoodle} />
      <Image source={number2} style={styles.numberTwoDoodle} />
      <Image source={number3} style={styles.numberThreeDoodle} />
      <Image source={rightArrowOutline} style={styles.rightArrowDoodle} />
      <Image source={notebook} style={styles.notebookDoodle} />
      <Image source={exclamationMark} style={styles.exclamationDoodle} />
      <Image source={car} style={styles.carDoodle} />
      <Image source={eiffelTower} style={styles.eiffelDoodle} />
      <Image source={snorkel} style={styles.snorkelDoodle} />
      <View style={styles.content}>
        {/* Başlık ve İkonlar */}
        <View style={styles.header}>
          <OutlinedTitle text={t.title} />
        </View>

        {/* Menü Butonları */}
        <TouchableOpacity style={[styles.button, styles.orange]} onPress={() => navigation.navigate('NewGame')} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{t.startGame}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.blue]} onPress={() => navigation.navigate('Help')} activeOpacity={0.85}>
          <Image source={book} style={styles.bookIcon} />
          <Text style={styles.buttonText}>{t.rules}</Text>
        </TouchableOpacity>
        
        {/* Ayarlar & Skorlar Sticker Chip'leri (yan yana) */}
        <View style={styles.chipsRow}>
          <LabelChip
            icon="settings-outline"
            label={t.settings}
            onPress={() => navigation.navigate('Settings')}
            pastelColor="#fdebd0" // açık turuncu
          />
          <LabelChip
            icon="trophy-outline"
            label={t.scores}
            onPress={() => navigation.navigate('Scores')}
            pastelColor="#fff9cc" // açık sarı
          />
        </View>

      </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 100, // biraz daha yukarı
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
    position: 'relative',
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
    fontSize: 72,
    letterSpacing: 2,
    position: 'absolute',
    textTransform: 'uppercase',
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
  settingsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  settingsLabelText: {
    fontFamily: 'IndieFlower',
    fontSize: 22,
    color: '#2b2b2b',
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    marginTop: 8,
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
  heartDoodle: {
    position: 'absolute',
    top: 160,
    left: 10,
    width: 40,
    height: 40,
    opacity: 0.28,
  },
  starfishDoodle: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 50,
    height: 50,
    opacity: 0.28,
  },
  pinwheelDoodle: {
    position: 'absolute',
    top: 220,
    left: '82%',
    width: 44,
    height: 44,
    opacity: 0.23,
    transform: [{ rotate: '45deg' }],
  },
  cameraDoodle: {
    position: 'absolute',
    top: 140,
    right: 10,
    width: 40,
    height: 40,
    opacity: 0.25,
  },
  paperPlaneDoodle: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 50,
    height: 50,
    opacity: 0.25,
    transform: [{ rotate: '-10deg' }],
  },
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
  exclamationDoodle: {
    position: 'absolute',
    top: 250,
    left: 90,
    width: 20,
    height: 20,
    opacity: 0.2,
  },
  carDoodle: {
    position: 'absolute',
    bottom: 40,
    left: '38%',
    width: 46,
    height: 46,
    opacity: 0.22,
  },
  eiffelDoodle: {
    position: 'absolute',
    top: 210,
    left: 140,
    width: 34,
    height: 34,
    opacity: 0.22,
  },
  snorkelDoodle: {
    position: 'absolute',
    bottom: 150,
    right: 120,
    width: 34,
    height: 34,
    opacity: 0.22,
  },
  bookIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
});


import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import book from '../assets/book.png';
import heart from '../assets/heart.png';
import starfish from '../assets/starfish.png';
import pinwheel from '../assets/pinwheel.png';

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

  return (
    <View style={styles.container}>
      <View style={styles.linedBackground}>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={styles.line} />
        ))}
      </View>
      <View style={styles.content}>
        {/* Başlık ve İkonlar */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Image source={heart} style={styles.heartDoodle} />
          <Image source={starfish} style={styles.starfishDoodle} />
          <Image source={pinwheel} style={styles.pinwheelDoodle} />
        </View>

        {/* Menü Butonları */}
        <TouchableOpacity style={[styles.button, styles.orange]} onPress={() => navigation.navigate('NewGame')}>
          <Text style={styles.buttonText}>{t.startGame}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.blue]} onPress={() => navigation.navigate('Help')}>
          <Image source={book} style={styles.bookIcon} />
          <Text style={styles.buttonText}>{t.rules}</Text>
        </TouchableOpacity>
        
        {/* Ayarlar */}
        <TouchableOpacity style={styles.settingsRow} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="#444" style={{ marginRight: 8 }} />
          <Text style={styles.settingsText}>{t.settings}</Text>
        </TouchableOpacity>
        
        {/* Skorlar Butonu */}
        <TouchableOpacity style={styles.scoresButton} onPress={() => navigation.navigate('Scores')}>
          <Ionicons name="trophy-outline" size={24} color="#444" style={{ marginRight: 8 }} />
          <Text style={styles.scoresButtonText}>{t.scores}</Text>
        </TouchableOpacity>

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
    paddingTop: 80, // Updated from 60 to give more space
  },
  header: {
    // flexDirection: 'row', // Kaldırıldı
    alignItems: 'center',
    marginBottom: 50,
    position: 'relative',
  },
  title: {
    fontFamily: 'IndieFlower',
    fontSize: 64,
    color: '#f47c20',
    marginBottom: 10,
    textShadowColor: '#fff',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
    letterSpacing: 2,
  },
  button: {
    width: 240, // Slightly wider buttons
    paddingVertical: 18, // Slightly more vertical padding
    borderRadius: 20, // More rounded corners
    borderWidth: 2,
    borderColor: '#8B4513', // Darker brown border
    marginBottom: 20, // Increased margin bottom
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 }, // Stronger shadow for depth
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  orange: {
    backgroundColor: '#f4a460', // Softer orange
  },
  blue: {
    backgroundColor: '#a9d5ee', // Softer blue
  },
  buttonText: {
    fontFamily: 'IndieFlower',
    fontSize: 26, // Slightly larger font size
    color: '#8B4513', // Brown text color for notebook feel
    letterSpacing: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15, // Increased margin top
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B4513',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  settingsText: {
    fontFamily: 'IndieFlower',
    fontSize: 24,
    color: '#8B4513',
  },
  scoresButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15, // Increased margin top
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B4513',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  scoresButtonText: {
    fontFamily: 'IndieFlower',
    fontSize: 24,
    color: '#8B4513',
  },
  heartDoodle: {
    position: 'absolute',
    top: -20,
    left: -30,
    width: 50,
    height: 50,
    opacity: 0.3,
  },
  starfishDoodle: {
    position: 'absolute',
    bottom: -20,
    right: -30,
    width: 50,
    height: 50,
    opacity: 0.3,
  },
  pinwheelDoodle: {
    position: 'absolute',
    top: 100,
    left: '50%',
    width: 70,
    height: 70,
    opacity: 0.3,
    transform: [{ rotate: '45deg' }],
  },
  bookIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
});


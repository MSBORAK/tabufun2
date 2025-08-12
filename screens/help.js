import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import book from '../assets/book.png';

const Help = () => {
  const navigation = useNavigation();
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

  const translations = {
    tr: {
      helpTitle: 'OYUN KILAVUZU',
      setupSubtitle: '3 Kolay Adımda Oyun Kurulumu:',
      step1: "Ana Menü'den Yeni Oyuna Tıkla",
      step2: "Takımların isimlerini yaz", 
      step3: "Oyuna başla ve eğlen!",
      understood: "Anladım",
    },
    en: {
      helpTitle: 'GAME GUIDE',
      setupSubtitle: 'Game Setup in 3 Easy Steps:',
      step1: "Click New Game from Main Menu",
      step2: "Enter team names", 
      step3: "Start the game and have fun!",
      understood: "Understood",
    },
  };
  const t = translations[currentLanguage];

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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8B4513" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Image source={book} style={styles.headerBookIcon} />
            <Ionicons name="help-circle" size={32} color="#8B4513" />
            <Text style={styles.title}>{t.helpTitle}</Text>
          </View>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.subtitle}>{t.setupSubtitle}</Text>
          
          <View style={styles.steps}>
            {[t.step1, t.step2, t.step3].map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>{t.understood}</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 25, 
    paddingTop: 80, 
    paddingBottom: 25, 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25, 
  },
  backButton: {
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 25, 
    padding: 10, 
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
  headerBookIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  title: {
    fontSize: 32, 
    fontWeight: 'bold',
    color: '#8B4513',
    marginLeft: 10,
    fontFamily: 'IndieFlower',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#8B4513',
    fontFamily: 'IndieFlower',
  },
  steps: {
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#a9d5ee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f4a460',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  stepNumberText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'IndieFlower',
  },
  stepText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
    fontFamily: 'IndieFlower',
  },
  closeButton: {
    backgroundColor: '#5b9bd5', // Soft blue
    paddingVertical: 18, // Increased padding
    borderRadius: 15,
    alignItems: 'center', 
    marginTop: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButtonText: {
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: 'bold',
    fontFamily: 'IndieFlower',
  },
});

export default Help;
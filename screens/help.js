import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView, Image, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import book from '../assets/book.png';
import colosseum from '../assets/colosseum.png';
import londonEye from '../assets/london-eye.png';
import galataTower from '../assets/galata-tower.png';
import pyramids from '../assets/pyramids.png';

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
      gameRules: 'OYUN KURALLARI',
      objectOfGame: 'Oyunun Amacı:',
      objectOfGameText: 'Oyuncuların ana kelimeyi, yasaklı kelimeleri kullanmadan kendi takım arkadaşlarına anlatmasıdır. En çok puanı toplayan takım kazanır.',
      scoring: 'Puanlama:',
      scoringCorrect: 'Doğru Tahmin: Her doğru anlatılan kelime için 10 puan kazanılır.',
      scoringPass: 'Pas Hakkı: Her takımın tur başına sınırlı pas hakkı vardır. Pas geçilen kelime için puan alınmaz.',
      scoringTaboo: 'Tabu Kelime Cezası: Yasaklı kelimelerden biri kullanılırsa, o kelime için ceza puanı uygulanır (varsayılan: -10 puan). Art arda 3 tabu kelime kullanılırsa, ekstra puan cezası uygulanır.',
      gameModes: 'Oyun Modları:',
      gameModesText: 'Farklı zorluk seviyeleri (Kolay, Orta, Zor, Ultra Zor) ve özel modlar (Sessiz Mod, Kendi Kartların) arasından seçim yapabilirsiniz. Her mod, oyun deneyiminizi değiştiren benzersiz kelime setleri ve kurallar sunar.',
      comboBonus: 'Seri Bonusu:',
      comboBonusText: 'Ayarlarda aktif edilirse, art arda 3 doğru tahmin yapıldığında ekstra puan kazanırsınız.',
      silentMode: 'Sessiz Mod:',
      silentModeText: 'Bu mod aktif edildiğinde, oyun sırasında yasaklı kelimeler gösterilmez ve titreşimler kapatılır. Anlatırken sadece ana kelimeye odaklanabilirsiniz.',
      quickStartTitle: 'Hızlı Başlatma Nasıl Çalışır?',
      quickStartText: 'Hızlı Başlat tuşu, oyunun varsayılan ayarlarla (Takım A: A Takımı, Takım B: B Takımı, Süre Limiti: 90 saniye, Pas Hakkı: 3, Tabu Hakkı: 3, Kolay Mod) hemen başlamasını sağlar. Hızlıca oyuna girmek isteyenler için idealdir.',
      settings: 'Ayarlar:',
      settingsText: 'Oyun Ayarları ekranında süre limitini, pas hakkı sayısını, tabu hakkı sayısını, seri sayısını ve kazanma puanını özelleştirebilirsiniz. Ayrıca ceza puanı, seri bonusu gibi özellikleri açıp kapatabilirsiniz.',
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.linedBackground}>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={styles.line} />
        ))}
      </View>
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Image source={colosseum} style={styles.colosseumDoodle} />
        <Image source={londonEye} style={styles.londonEyeDoodle} />
        <Image source={galataTower} style={styles.galataTowerDoodle} />
        <Image source={pyramids} style={styles.pyramidsDoodle} />
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.gameRules}</Text>
            <View style={styles.card}>
              <Text style={styles.sectionSubtitle}>{t.objectOfGame}</Text>
              <Text style={styles.sectionText}>{t.objectOfGameText}</Text>
            </View>
            
            <View style={styles.card}>
              <Text style={styles.sectionSubtitle}>{t.scoring}</Text>
              <Text style={styles.sectionText}>{t.scoringCorrect}</Text>
              <Text style={styles.sectionText}>{t.scoringPass}</Text>
              <Text style={styles.sectionText}>{t.scoringTaboo}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionSubtitle}>{t.gameModes}</Text>
              <Text style={styles.sectionText}>{t.gameModesText}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionSubtitle}>{t.comboBonus}</Text>
              <Text style={styles.sectionText}>{t.comboBonusText}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionSubtitle}>{t.silentMode}</Text>
              <Text style={styles.sectionText}>{t.silentModeText}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionSubtitle}>{t.settings}</Text>
              <Text style={styles.sectionText}>{t.settingsText}</Text>
            </View>
          </View>

          <Text style={styles.quickStartTitle}>{t.quickStartTitle}</Text>
          <View style={styles.card}>
            <Text style={styles.sectionText}>{t.quickStartText}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>{t.understood}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
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
    fontSize: Platform.OS === 'android' ? 30 : 32, 
    fontWeight: 'normal',
    color: '#8B4513',
    marginLeft: 10,
    fontFamily: 'IndieFlower',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: Platform.OS === 'android' ? 18 : 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#8B4513',
    fontFamily: 'IndieFlower',
    fontWeight: 'normal',
  },
  steps: {
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: Platform.OS === 'android' ? 12 : 15,
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
    fontWeight: 'normal',
    fontSize: Platform.OS === 'android' ? 15 : 16,
    fontFamily: 'IndieFlower',
  },
  stepText: {
    fontSize: Platform.OS === 'android' ? 16 : 18,
    color: '#333',
    flex: 1,
    fontFamily: 'IndieFlower',
  },
  closeButton: {
    backgroundColor: '#5b9bd5', // Soft blue
    paddingVertical: Platform.OS === 'android' ? 15 : 18, // Adjusted padding
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
    fontSize: Platform.OS === 'android' ? 20 : 22, 
    fontWeight: 'normal',
    fontFamily: 'IndieFlower',
  },
  colosseumDoodle: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 38,
    height: 38,
    opacity: 0.15,
  },
  londonEyeDoodle: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    width: 42,
    height: 42,
    opacity: 0.15,
  },
  galataTowerDoodle: {
    position: 'absolute',
    top: 250,
    right: 10,
    width: 36,
    height: 36,
    opacity: 0.15,
  },
  pyramidsDoodle: {
    position: 'absolute',
    bottom: 150,
    left: 40,
    width: 40,
    height: 40,
    opacity: 0.15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'android' ? 22 : 24,
    fontWeight: 'normal',
    color: '#8B4513',
    marginBottom: 15,
    fontFamily: 'IndieFlower',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: Platform.OS === 'android' ? 15 : 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#a9d5ee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionSubtitle: {
    fontSize: Platform.OS === 'android' ? 16 : 18,
    fontWeight: 'normal',
    color: '#8B4513',
    marginBottom: 10,
    fontFamily: 'IndieFlower',
  },
  sectionText: {
    fontSize: Platform.OS === 'android' ? 14 : 16,
    color: '#333',
    lineHeight: 22,
    fontFamily: 'IndieFlower',
  },
  quickStartTitle: {
    fontSize: Platform.OS === 'android' ? 20 : 22,
    fontWeight: 'normal',
    color: '#8B4513',
    marginBottom: 15,
    fontFamily: 'IndieFlower',
  },
});

export default Help;
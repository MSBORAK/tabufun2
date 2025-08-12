// screens/Settings.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import notebook from '../assets/notebook.png';
import rightArrowOutline from '../assets/right-arrow-outline.png';
import colosseum from '../assets/colosseum.png';
import londonEye from '../assets/london-eye.png';
import galataTower from '../assets/galata-tower.png';
import pyramids from '../assets/pyramids.png';

const Settings = ({ navigation }) => {
  const [timeLimit, setTimeLimit] = useState(180);
  const [tabuCount, setTabuCount] = useState(3);
  const [winPoints, setWinPoints] = useState(250);
  const [passCount, setPassCount] = useState(3);
  const [language, setLanguage] = useState('tr'); // 'tr' veya 'en'
  const [maxSets, setMaxSets] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Uygulama açıldığında ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('tabuuSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setTimeLimit(parsed.timeLimit ?? 180);
          setTabuCount(parsed.tabuCount ?? 3);
          setWinPoints(parsed.winPoints ?? 250);
          setPassCount(parsed.passCount ?? 3);
          setLanguage(parsed.language ?? 'tr'); // Dil ayarını yükle
          setMaxSets(parsed.maxSets ?? 1);
          setSoundEnabled(parsed.soundEnabled ?? true);
        }
      } catch (error) {
        console.log('Ayarlar yüklenemedi:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      const settingsData = { timeLimit, tabuCount, winPoints, passCount, language, maxSets, soundEnabled }; // Dili de kaydet
      await AsyncStorage.setItem('tabuuSettings', JSON.stringify(settingsData));
      console.log('Ayarlar kaydedildi:', settingsData);
    } catch (error) {
      console.log('Ayarlar kaydedilemedi:', error);
    }
    navigation.goBack();
  };

  const t = {
    tr: {
      settingsTitle: "Tabuu Ayarları",
      time: "Süre:",
      passRights: "Pas Hakkı:",
      tabooCount: "Tabu:",
      winPoints: "Kazanma Puanı:",
      maxSets: "Set Sayısı:",
      sound: "Ses:",
      on: "Açık",
      off: "Kapalı",
      language: "Dil:",
      turkish: "Türkçe",
      english: "English",
      saveSettings: "Ayarları Kaydet",
    },
    en: {
      settingsTitle: "Taboo Settings",
      time: "Time:",
      passRights: "Pass Rights:",
      tabooCount: "Taboo:",
      winPoints: "Win Points:",
      language: "Language:",
      turkish: "Turkish",
      english: "English",
      saveSettings: "Save Settings",
      maxSets: "Sets:",
      sound: "Sound:",
      on: "On",
      off: "Off",
    },
  }[language];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.linedBackground}>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={styles.line} />
        ))}
      </View>
      <View style={styles.content}>
      <Image source={colosseum} style={styles.colosseumDoodle} />
      <Image source={londonEye} style={styles.londonEyeDoodle} />
      <Image source={galataTower} style={styles.galataTowerDoodle} />
      <Image source={pyramids} style={styles.pyramidsDoodle} />
      <View style={styles.header}>
        <Image source={notebook} style={styles.headerNotebookIcon} />
        <Ionicons name="settings-outline" size={28} color="#8B4513" />
        <Text style={styles.title}>{t.settingsTitle}</Text>
      </View>

      {/* Süre */}
      <SettingRow
        label={t.time}
        value={`${timeLimit} sn`}
        decrease={() => setTimeLimit(Math.max(30, timeLimit - 30))}
        increase={() => setTimeLimit(Math.min(180, timeLimit + 30))}
        disableDecrease={timeLimit <= 30}
        disableIncrease={timeLimit >= 180}
        showArrowIcons={true}
      />

      {/* Pas hakkı */}
      <SettingRow
        label={t.passRights}
        value={passCount}
        decrease={() => setPassCount(Math.max(0, passCount - 1))}
        increase={() => setPassCount(Math.min(6, passCount + 1))}
        disableDecrease={passCount <= 0}
        disableIncrease={passCount >= 6}
        showArrowIcons={true}
      />

      {/* Tabu sayısı */}
      <SettingRow
        label={t.tabooCount}
        value={tabuCount}
        decrease={() => setTabuCount(Math.max(0, tabuCount - 1))}
        increase={() => setTabuCount(Math.min(6, tabuCount + 1))}
        disableDecrease={tabuCount <= 0}
        disableIncrease={tabuCount >= 6}
        showArrowIcons={true}
      />

      {/* Kazanma puanı */}
      <SettingRow
        label={t.winPoints}
        value={winPoints}
        decrease={() => setWinPoints(Math.max(25, winPoints - 25))}
        increase={() => setWinPoints(Math.min(300, winPoints + 25))}
        disableDecrease={winPoints <= 25}
        disableIncrease={winPoints >= 300}
        showArrowIcons={true}
      />

      {/* Set sayısı */}
      <SettingRow
        label={t.maxSets}
        value={maxSets}
        decrease={() => setMaxSets(Math.max(1, maxSets - 1))}
        increase={() => setMaxSets(Math.min(10, maxSets + 1))}
        disableDecrease={maxSets <= 1}
        disableIncrease={maxSets >= 10}
        showArrowIcons={true}
      />

      {/* Ses Aç/Kapat */}
      <SettingRow
        label={t.sound}
        value={soundEnabled ? t.on : t.off}
        decrease={() => setSoundEnabled(prev => !prev)}
        increase={() => setSoundEnabled(prev => !prev)}
        disableDecrease={false}
        disableIncrease={false}
        showArrowIcons={true}
      />

      {/* Dil Seçimi */}
      <View style={styles.languageSection}>
        <Text style={styles.languageLabel}>{t.language}</Text>
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[styles.languageButton, language === 'tr' && styles.activeLanguageButton]}
            onPress={() => setLanguage('tr')}
          >
            <Text style={[styles.languageButtonText, language === 'tr' && styles.activeLanguageButtonText]}>{t.turkish}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, language === 'en' && styles.activeLanguageButton]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.languageButtonText, language === 'en' && styles.activeLanguageButtonText]}>{t.english}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{t.saveSettings}</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Tekrar eden satırlar için küçük bir component
const SettingRow = ({ label, value, decrease, increase, disableDecrease, disableIncrease, showArrowIcons }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <View style={styles.valueContainer}>
      <TouchableOpacity style={[styles.arrowButton, styles.decreaseButton, disableDecrease && styles.arrowButtonDisabled]} onPress={decrease} disabled={disableDecrease}>
        {showArrowIcons ? (
          <Image source={rightArrowOutline} style={[styles.arrowIcon, { transform: [{ rotateY: '180deg' }] }, disableDecrease && styles.arrowIconDisabled]} />
        ) : (
          <Ionicons name="chevron-back" size={24} color={disableDecrease ? "#ccc" : "#fff"} />
        )}
      </TouchableOpacity>
      <Text style={styles.settingValue}>{value}</Text>
      <TouchableOpacity style={[styles.arrowButton, styles.increaseButton, disableIncrease && styles.arrowButtonDisabled]} onPress={increase} disabled={disableIncrease}>
        {showArrowIcons ? (
          <Image source={rightArrowOutline} style={[styles.arrowIcon, disableIncrease && styles.arrowIconDisabled]} />
        ) : (
          <Ionicons name="chevron-forward" size={24} color={disableIncrease ? "#ccc" : "#fff"} />
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fdf6e3', 
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
    backgroundColor: '#e0e0e0',
    marginVertical: 18,
    width: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, 
    marginTop: Platform.OS === 'ios' ? 8 : 48,
  },
  headerNotebookIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  title: { 
    fontSize: 28,
    fontWeight: 'bold', 
    color: '#8B4513', 
    marginLeft: 10,
    fontFamily: 'IndieFlower',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#8B4513',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  settingLabel: { 
    fontSize: 18,
    color: '#8B4513', 
    fontWeight: '500',
    fontFamily: 'IndieFlower',
  },
  valueContainer: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { 
    fontSize: 20,
    fontWeight: '600', 
    color: '#4A6FA5', 
    marginHorizontal: 12,
    minWidth: 52, 
    textAlign: 'center',
    fontFamily: 'IndieFlower',
  },
  arrowButton: { padding: 8, borderRadius: 10 },
  decreaseButton: { backgroundColor: '#a9d5ee', borderWidth: 1, borderColor: '#8B4513' },
  increaseButton: { backgroundColor: '#a9d5ee', borderWidth: 1, borderColor: '#8B4513' },
  arrowButtonDisabled: { backgroundColor: '#e0e0e0' },
  arrowIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
  },
  arrowIconDisabled: { tintColor: '#ccc' },
  saveButton: { 
    backgroundColor: '#5b9bd5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center', 
    marginTop: 24,
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: { 
    color: '#fff', 
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'IndieFlower',
  },
  languageSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#8B4513',
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  languageLabel: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'IndieFlower',
  },
  languageButtons: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#a9d5ee',
  },
  languageButtonText: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: 'bold',
    fontFamily: 'IndieFlower',
  },
  activeLanguageButton: {
    backgroundColor: '#8B4513',
  },
  activeLanguageButtonText: {
    color: '#fff',
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
});

export default Settings;

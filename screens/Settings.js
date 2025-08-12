// screens/Settings.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import notebook from '../assets/notebook.png';
import rightArrowOutline from '../assets/right-arrow-outline.png';

const Settings = ({ navigation }) => {
  const [timeLimit, setTimeLimit] = useState(180);
  const [tabuCount, setTabuCount] = useState(3);
  const [winPoints, setWinPoints] = useState(250);
  const [passCount, setPassCount] = useState(3);
  const [language, setLanguage] = useState('tr'); // 'tr' veya 'en'

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
        }
      } catch (error) {
        console.log('Ayarlar yüklenemedi:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      const settingsData = { timeLimit, tabuCount, winPoints, passCount, language }; // Dili de kaydet
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
    },
  }[language];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={notebook} style={styles.headerNotebookIcon} />
        <Ionicons name="settings-outline" size={32} color="#8B4513" />
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
  );
};

// Tekrar eden satırlar için küçük bir component
const SettingRow = ({ label, value, decrease, increase, disableDecrease, disableIncrease, showArrowIcons }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <View style={styles.valueContainer}>
      <TouchableOpacity style={styles.arrowButton} onPress={decrease}>
        {showArrowIcons ? <Image source={rightArrowOutline} style={[styles.arrowIcon, { transform: [{ rotateY: '180deg' }] }]} /> : <Ionicons name="chevron-back" size={24} color={disableDecrease ? "#ccc" : "#8B4513"} />}
      </TouchableOpacity>
      <Text style={styles.settingValue}>{value}</Text>
      <TouchableOpacity style={styles.arrowButton} onPress={increase}>
        {showArrowIcons ? <Image source={rightArrowOutline} style={styles.arrowIcon} /> : <Ionicons name="chevron-forward" size={24} color={disableIncrease ? "#ccc" : "#8B4513"} />}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fdf6e3', 
    padding: 25, // Increased padding
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 30, 
    marginTop: 30, // Increased margin
  },
  headerNotebookIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  title: { 
    fontSize: 34, // Larger title
    fontWeight: 'bold', 
    color: '#8B4513', 
    marginLeft: 15, // Increased margin
    fontFamily: 'IndieFlower',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20, // Increased padding
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // Softer border color
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLabel: { 
    fontSize: 20, // Larger font size
    color: '#333', 
    fontWeight: '500',
    fontFamily: 'IndieFlower',
  },
  valueContainer: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { 
    fontSize: 22, // Larger font size
    fontWeight: '600', 
    color: '#4A6FA5', 
    marginHorizontal: 18, // Increased margin
    minWidth: 60, 
    textAlign: 'center',
    fontFamily: 'IndieFlower',
  },
  arrowButton: { padding: 10, borderRadius: 10, backgroundColor: '#a9d5ee' }, // Styled button
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: '#8B4513',
  },
  saveButton: { 
    backgroundColor: '#5b9bd5', // Soft blue
    padding: 20, // Increased padding
    borderRadius: 15, // More rounded
    alignItems: 'center', 
    marginTop: 40, // Increased margin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  saveButtonText: { 
    color: '#fff', 
    fontSize: 22, // Larger font size
    fontWeight: 'bold',
    fontFamily: 'IndieFlower',
  },
  languageSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20, // Increased padding
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 30, // Increased margin
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageLabel: {
    fontSize: 20, // Larger font size
    color: '#333',
    fontWeight: '500',
    fontFamily: 'IndieFlower',
  },
  languageButtons: {
    flexDirection: 'row',
    borderRadius: 12, // More rounded
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  languageButton: {
    paddingVertical: 10, // Increased padding
    paddingHorizontal: 20, // Increased padding
    backgroundColor: '#a9d5ee', // Soft blue for buttons
  },
  languageButtonText: {
    fontSize: 18, // Larger font size
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
});

export default Settings;

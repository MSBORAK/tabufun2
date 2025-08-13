// screens/Settings.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import colosseum from '../assets/colosseum.png';
import londonEye from '../assets/london-eye.png';
import galataTower from '../assets/galata-tower.png';
import pyramids from '../assets/pyramids.png';

const Settings = ({ navigation }) => {
  const [timeLimit, setTimeLimit] = useState(180);
  const [tabuCount, setTabuCount] = useState(3);
  const [passCount, setPassCount] = useState(3);
  const [language, setLanguage] = useState('tr');
  const [maxSets, setMaxSets] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  // advanced settings
  const [penaltyEnabled, setPenaltyEnabled] = useState(true);
  const [penaltyPoints, setPenaltyPoints] = useState(20);
  const [comboEnabled, setComboEnabled] = useState(true);
  const [combo3, setCombo3] = useState(20);
  const [combo5, setCombo5] = useState(15); // deprecated
  const [randomTimeEnabled, setRandomTimeEnabled] = useState(false); // removed UI
  const [randomTimeMin, setRandomTimeMin] = useState(45);
  const [randomTimeMax, setRandomTimeMax] = useState(90);
  const [themes, setThemes] = useState(['general']); // removed UI
  const [surpriseEnabled, setSurpriseEnabled] = useState(false); // removed UI
  const [surpriseChance, setSurpriseChance] = useState(10);
  const [autoRounds, setAutoRounds] = useState(true); // removed UI

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('tabuuSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setTimeLimit(parsed.timeLimit ?? 180);
          setTabuCount(parsed.tabuCount ?? 3);
          setPassCount(parsed.passCount ?? 3);
          setLanguage(parsed.language ?? 'tr');
          setMaxSets(parsed.maxSets ?? 1);
          setSoundEnabled(parsed.soundEnabled ?? true);
          setPenaltyEnabled(parsed.penaltyEnabled ?? true);
          setPenaltyPoints(parsed.penaltyPoints ?? 20);
          setComboEnabled(parsed.comboEnabled ?? true);
          setCombo3(parsed.combo3 ?? 20);
          setCombo5(parsed.combo5 ?? 15);
          // keep reading legacy keys to avoid crashes but UI is removed
          setRandomTimeEnabled(parsed.randomTimeEnabled ?? false);
          setRandomTimeMin(parsed.randomTimeMin ?? 45);
          setRandomTimeMax(parsed.randomTimeMax ?? 90);
          setThemes(parsed.themes ?? ['general']);
          setSurpriseEnabled(parsed.surpriseEnabled ?? false);
          setSurpriseChance(parsed.surpriseChance ?? 10);
          setAutoRounds(parsed.autoRounds ?? true);
        }
      } catch (error) {
        console.log('Ayarlar yüklenemedi:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      const settingsData = { timeLimit, tabuCount, passCount, language, maxSets, soundEnabled, penaltyEnabled, penaltyPoints, comboEnabled, combo3, combo5, randomTimeEnabled, randomTimeMin, randomTimeMax, themes, surpriseEnabled, surpriseChance, autoRounds };
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
      maxSets: "Tur Sayısı:",
      sound: "Ses:",
      on: "Açık",
      off: "Kapalı",
      language: "Dil:",
      turkish: "Türkçe",
      english: "English",
      saveSettings: "Ayarları Kaydet",
      penalty: "Ceza",
      penaltyPoints: "Ceza Puanı",
      comboBonus: "Seri Bonusu",
      threeCorrectBonus: "3 doğru bonus",
    },
    en: {
      settingsTitle: "Taboo Settings",
      time: "Time:",
      passRights: "Pass Rights:",
      tabooCount: "Taboo:",
      language: "Language:",
      turkish: "Turkish",
      english: "English",
      saveSettings: "Save Settings",
      maxSets: "Rounds:",
      sound: "Sound:",
      on: "On",
      off: "Off",
      penalty: "Penalty",
      penaltyPoints: "Penalty Points",
      comboBonus: "Combo Bonus",
      threeCorrectBonus: "3 correct bonus",
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
      <ScrollView contentContainerStyle={styles.content}>
        {/* Arka plan doodle'lar */}
        <Image source={colosseum} style={styles.colosseumDoodle} />
        <Image source={londonEye} style={styles.londonEyeDoodle} />
        <Image source={galataTower} style={styles.galataTowerDoodle} />
        <Image source={pyramids} style={styles.pyramidsDoodle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8B4513" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="settings-outline" size={24} color="#8B4513" style={{ marginRight: 6 }} />
            <Text style={styles.title}>{t.settingsTitle}</Text>
          </View>
        </View>

        {/* Ayar satırları */}
        <SettingRow
          label={t.time}
          value={`${timeLimit} ${language === 'tr' ? 'sn' : 'sec'}`}
          decrease={() => setTimeLimit(Math.max(30, timeLimit - 30))}
          increase={() => setTimeLimit(Math.min(180, timeLimit + 30))}
          disableDecrease={timeLimit <= 30}
          disableIncrease={timeLimit >= 180}
          showArrowIcons={true}
        />

        <SettingRow
          label={t.passRights}
          value={passCount}
          decrease={() => setPassCount(Math.max(0, passCount - 1))}
          increase={() => setPassCount(Math.min(6, passCount + 1))}
          disableDecrease={passCount <= 0}
          disableIncrease={passCount >= 6}
          showArrowIcons={true}
        />

        <SettingRow
          label={t.tabooCount}
          value={tabuCount}
          decrease={() => setTabuCount(Math.max(0, tabuCount - 1))}
          increase={() => setTabuCount(Math.min(6, tabuCount + 1))}
          disableDecrease={tabuCount <= 0}
          disableIncrease={tabuCount >= 6}
          showArrowIcons={true}
        />



        <SettingRow
          label={t.maxSets}
          value={maxSets}
          decrease={() => setMaxSets(Math.max(1, maxSets - 1))}
          increase={() => setMaxSets(Math.min(10, maxSets + 1))}
          disableDecrease={maxSets <= 1}
          disableIncrease={maxSets >= 10}
          showArrowIcons={true}
        />

        {/* Penalty points only */}
        {/* Penalty toggle + points */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t.penalty}</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setPenaltyEnabled(!penaltyEnabled)}
            style={[styles.toggle, penaltyEnabled ? styles.toggleOn : styles.toggleOff]}
          >
            <Text style={[styles.toggleText, penaltyEnabled ? styles.toggleTextOn : styles.toggleTextOff]}>{penaltyEnabled ? t.on : t.off}</Text>
            <View style={[styles.toggleKnob, penaltyEnabled ? styles.toggleKnobOn : styles.toggleKnobOff]} />
          </TouchableOpacity>
        </View>
        {penaltyEnabled && (
          <SettingRow label={t.penaltyPoints} value={penaltyPoints} decrease={() => setPenaltyPoints(Math.max(20, penaltyPoints - 10))} increase={() => setPenaltyPoints(Math.min(50, penaltyPoints + 10))} disableDecrease={penaltyPoints <= 20} disableIncrease={penaltyPoints >= 50} showArrowIcons={true} />
        )}

        {/* Combo bonus */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t.comboBonus}</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setComboEnabled(!comboEnabled)}
            style={[styles.toggle, comboEnabled ? styles.toggleOn : styles.toggleOff]}
          >
            <Text style={[styles.toggleText, comboEnabled ? styles.toggleTextOn : styles.toggleTextOff]}>{comboEnabled ? t.on : t.off}</Text>
            <View style={[styles.toggleKnob, comboEnabled ? styles.toggleKnobOn : styles.toggleKnobOff]} />
          </TouchableOpacity>
        </View>
        {comboEnabled && (
          <SettingRow label={t.threeCorrectBonus} value={`+${combo3}`} decrease={() => setCombo3(Math.max(20, combo3 - 10))} increase={() => setCombo3(Math.min(50, combo3 + 10))} disableDecrease={combo3 <= 20} disableIncrease={combo3 >= 50} showArrowIcons={true} />
        )}

        {/* Random time removed */}

        {/* Theme selection removed */}

        {/* Surprise card removed */}

        {/* Auto rounds removed */}

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t.sound}</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSoundEnabled(!soundEnabled)}
            style={[styles.toggle, soundEnabled ? styles.toggleOn : styles.toggleOff]}
          >
            <Text style={[styles.toggleText, soundEnabled ? styles.toggleTextOn : styles.toggleTextOff]}>{soundEnabled ? t.on : t.off}</Text>
            <View style={[styles.toggleKnob, soundEnabled ? styles.toggleKnobOn : styles.toggleKnobOff]} />
          </TouchableOpacity>
        </View>

        {/* Dil seçimi */}
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

        {/* Kaydet butonu */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t.saveSettings}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingRow = ({ label, value, decrease, increase, disableDecrease, disableIncrease, showArrowIcons }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <View style={styles.valueContainer}>
      <TouchableOpacity style={[styles.arrowButton, styles.decreaseButton, disableDecrease && styles.arrowButtonDisabled]} onPress={decrease} disabled={disableDecrease}>
        {showArrowIcons ? (
          <Ionicons name="chevron-back" size={20} color={disableDecrease ? "#aaa" : "#8B4513"} />
        ) : (
          <Ionicons name="chevron-back" size={20} color={disableDecrease ? "#aaa" : "#8B4513"} />
        )}
      </TouchableOpacity>
      <Text style={styles.settingValue}>{value}</Text>
      <TouchableOpacity style={[styles.arrowButton, styles.increaseButton, disableIncrease && styles.arrowButtonDisabled]} onPress={increase} disabled={disableIncrease}>
        {showArrowIcons ? (
          <Ionicons name="chevron-forward" size={20} color={disableIncrease ? "#aaa" : "#8B4513"} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={disableIncrease ? "#aaa" : "#8B4513"} />
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf6e3' },
  linedBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingTop: 80 },
  line: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 18, width: '100%' },
  content: { flexGrow: 1, paddingHorizontal: 10, paddingTop: Platform.OS === 'android' ? 36 : 18, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: Platform.OS === 'ios' ? 8 : 20, width: '100%' },
  backButton: { 
    position: 'absolute', 
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 25, 
    padding: 8, 
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3, 
  },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  headerIcon: { marginRight: 8 },
  title: { fontSize: 20, color: '#8B4513', fontFamily: 'IndieFlower' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Platform.OS === 'android' ? 8 : 6, borderWidth: 2, borderColor: '#8B4513', backgroundColor: '#fff', borderRadius: 10, marginBottom: 6, paddingHorizontal: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  settingLabel: { fontSize: Platform.OS === 'android' ? 16 : 15, color: '#8B4513', fontFamily: 'IndieFlower' },
  valueContainer: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: Platform.OS === 'android' ? 16 : 15, color: '#4A6FA5', marginHorizontal: 6, minWidth: 40, textAlign: 'center', fontFamily: 'IndieFlower' },
  arrowButton: { padding: Platform.OS === 'android' ? 8 : 6, borderRadius: 10 },
  decreaseButton: { backgroundColor: '#a9d5ee', borderWidth: 1, borderColor: '#8B4513' },
  increaseButton: { backgroundColor: '#a9d5ee', borderWidth: 1, borderColor: '#8B4513' },
  arrowButtonDisabled: { backgroundColor: '#e0e0e0' },
  arrowIcon: { width: 18, height: 18, tintColor: '#fff' },
  arrowIconDisabled: { tintColor: '#ccc' },
  saveButton: { backgroundColor: '#a9d5ee', padding: 10, borderRadius: 12, alignItems: 'center', marginTop: 12, borderWidth: 2, borderColor: '#8B4513', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  saveButtonText: { color: '#fff', fontSize: Platform.OS === 'android' ? 16 : 15, fontFamily: 'IndieFlower' },
  languageSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Platform.OS === 'android' ? 10 : 8, borderWidth: 2, borderColor: '#8B4513', marginTop: 10, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  languageLabel: { fontSize: Platform.OS === 'android' ? 14 : 13, color: '#333', fontFamily: 'IndieFlower' },
  languageButtons: { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: '#8B4513' },
  languageButton: { paddingVertical: Platform.OS === 'android' ? 6 : 4, paddingHorizontal: Platform.OS === 'android' ? 10 : 8, backgroundColor: '#a9d5ee' },
  languageButtonText: { fontSize: Platform.OS === 'android' ? 13 : 12, color: '#8B4513', fontFamily: 'IndieFlower' },
  activeLanguageButton: { backgroundColor: '#8B4513' },
  activeLanguageButtonText: { color: '#fff' },
  toggle: { width: 76, height: 30, borderRadius: 16, borderWidth: 2, borderColor: '#8B4513', justifyContent: 'center', paddingHorizontal: 8 },
  toggleOn: { backgroundColor: '#5b9bd5' },
  toggleOff: { backgroundColor: '#c9c9c9' },
  toggleText: { position: 'absolute', alignSelf: 'center', fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 13 : 11 },
  toggleTextOn: { color: '#fff' },
  toggleTextOff: { color: '#fff' },
  toggleKnob: { position: 'absolute', width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', borderWidth: 2, borderColor: '#8B4513', top: 2 },
  toggleKnobOn: { right: 2 },
  toggleKnobOff: { left: 2 },
  colosseumDoodle: { position: 'absolute', top: 50, left: 20, width: 38, height: 38, opacity: 0.15 },
  londonEyeDoodle: { position: 'absolute', bottom: 80, right: 30, width: 42, height: 42, opacity: 0.15 },
  galataTowerDoodle: { position: 'absolute', top: 250, right: 10, width: 36, height: 36, opacity: 0.15 },
  pyramidsDoodle: { position: 'absolute', bottom: 150, left: 40, width: 40, height: 40, opacity: 0.15 },
});

export default Settings;

// screens/Settings.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = ({ navigation }) => {
  const [timeLimit, setTimeLimit] = useState(180);
  const [tabuCount, setTabuCount] = useState(3);
  const [winPoints, setWinPoints] = useState(250);
  const [passCount, setPassCount] = useState(3);

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
        }
      } catch (error) {
        console.log('Ayarlar yüklenemedi:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      const settingsData = { timeLimit, tabuCount, winPoints, passCount };
      await AsyncStorage.setItem('tabuuSettings', JSON.stringify(settingsData));
      console.log('Ayarlar kaydedildi:', settingsData);
    } catch (error) {
      console.log('Ayarlar kaydedilemedi:', error);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={28} color="#4A6FA5" />
        <Text style={styles.title}>Tabuu Ayarları</Text>
      </View>

      {/* Süre */}
      <SettingRow
        label="Süre:"
        value={`${timeLimit} sn`}
        decrease={() => setTimeLimit(Math.max(30, timeLimit - 30))}
        increase={() => setTimeLimit(Math.min(180, timeLimit + 30))}
        disableDecrease={timeLimit <= 30}
        disableIncrease={timeLimit >= 180}
      />

      {/* Pas hakkı */}
      <SettingRow
        label="Pas Hakkı:"
        value={passCount}
        decrease={() => setPassCount(Math.max(0, passCount - 1))}
        increase={() => setPassCount(Math.min(6, passCount + 1))}
        disableDecrease={passCount <= 0}
        disableIncrease={passCount >= 6}
      />

      {/* Tabu sayısı */}
      <SettingRow
        label="Tabu:"
        value={tabuCount}
        decrease={() => setTabuCount(Math.max(0, tabuCount - 1))}
        increase={() => setTabuCount(Math.min(6, tabuCount + 1))}
        disableDecrease={tabuCount <= 0}
        disableIncrease={tabuCount >= 6}
      />

      {/* Kazanma puanı */}
      <SettingRow
        label="Kazanma Puanı:"
        value={winPoints}
        decrease={() => setWinPoints(Math.max(25, winPoints - 25))}
        increase={() => setWinPoints(Math.min(300, winPoints + 25))}
        disableDecrease={winPoints <= 25}
        disableIncrease={winPoints >= 300}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Ayarları Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
};

// Tekrar eden satırlar için küçük bir component
const SettingRow = ({ label, value, decrease, increase, disableDecrease, disableIncrease }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <View style={styles.valueContainer}>
      <TouchableOpacity style={styles.arrowButton} onPress={decrease}>
        <Ionicons name="chevron-back" size={20} color={disableDecrease ? "#ccc" : "#4A6FA5"} />
      </TouchableOpacity>
      <Text style={styles.settingValue}>{value}</Text>
      <TouchableOpacity style={styles.arrowButton} onPress={increase}>
        <Ionicons name="chevron-forward" size={20} color={disableIncrease ? "#ccc" : "#4A6FA5"} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f1ea', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4A6FA5', marginLeft: 10 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  settingLabel: { fontSize: 18, color: '#333', fontWeight: '500' },
  valueContainer: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: 18, fontWeight: '600', color: '#4A6FA5', marginHorizontal: 15, minWidth: 50, textAlign: 'center' },
  arrowButton: { padding: 8 },
  saveButton: { backgroundColor: '#4A6FA5', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});

export default Settings;

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Animated, StatusBar, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function NewGame() {
  const navigation = useNavigation();
  const [teamA, setTeamA] = useState('Takım A');
  const [teamB, setTeamB] = useState('Takım B');
  const [timeLimit, setTimeLimit] = useState(60);
  const [passCount, setPassCount] = useState(3);

  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
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

  const handleStartGame = () => {
    if (teamA.trim() === '' || teamB.trim() === '') {
      Alert.alert('Hata', 'Takım isimleri boş bırakılamaz!');
      return;
    }
    if (teamA.trim().toLowerCase() === teamB.trim().toLowerCase()) {
      Alert.alert('Hata', 'Takım isimleri aynı olamaz!');
      return;
    }
    navigation.navigate('Game', { teamA, teamB, timeLimit, passCount });
  };

  const handleQuickStart = () => {
    navigation.navigate('Game', { teamA: 'Takım A', teamB: 'Takım B', timeLimit: 60, passCount: 3 });
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Ionicons name="dice" size={32} color="#fff" />
            <Text style={styles.title}>YENİ OYUN</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Takım İsimleri */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Takım İsimleri:</Text>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.inputCard}
            >
              <Ionicons name="people" size={20} color="#764ba2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Takım A Adı"
                placeholderTextColor="#A0522D"
                value={teamA}
                onChangeText={setTeamA}
              />
            </LinearGradient>
            <Text style={styles.vsText}>VS</Text>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.inputCard}
            >
              <Ionicons name="people" size={20} color="#764ba2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Takım B Adı"
                placeholderTextColor="#A0522D"
                value={teamB}
                onChangeText={setTeamB}
              />
            </LinearGradient>
          </View>

          {/* Oyun Ayarları */}
          <View style={styles.section}>
            <Text style={styles.settingsTitle}>Oyun Ayarları:</Text>
            
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.settingItem}
            >
              <Text style={styles.settingLabel}>Süre Limiti (saniye):</Text>
              <View style={styles.settingButtons}>
                {[30, 60, 90, 120].map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.settingButton, timeLimit === time && styles.activeSettingButton]}
                    onPress={() => setTimeLimit(time)}
                  >
                    <Text style={[styles.settingButtonText, timeLimit === time && styles.activeSettingButtonText]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>

            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.settingItem}
            >
              <Text style={styles.settingLabel}>Pas Hakkı Sayısı:</Text>
              <View style={styles.settingButtons}>
                {[0, 1, 2, 3, 4, 5].map(pass => (
                  <TouchableOpacity
                    key={pass}
                    style={[styles.settingButton, passCount === pass && styles.activeSettingButton]}
                    onPress={() => setPassCount(pass)}
                  >
                    <Text style={[styles.settingButtonText, passCount === pass && styles.activeSettingButtonText]}>{pass}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Başlat Butonları */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.quickStartButton} onPress={handleQuickStart} activeOpacity={0.8}>
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.buttonGradient}
              >
                <Ionicons name="flash" size={24} color="#fff" />
                <Text style={styles.quickStartText}>Hızlı Başla</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.startButton} onPress={handleStartGame} activeOpacity={0.8}>
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.buttonGradient}
              >
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={styles.startButtonText}>OYUNU BAŞLAT</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
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
    color: '#fff',
    marginLeft: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#333',
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingButtons: {
    flexDirection: 'row',
  },
  settingButton: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  settingButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  activeSettingButton: {
    backgroundColor: '#667eea',
  },
  activeSettingButtonText: {
    color: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  quickStartButton: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  quickStartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 5,
  },
});

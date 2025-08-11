import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NewGame = ({ navigation }) => {
  const [teamA, setTeamA] = useState('A Takım');
  const [teamB, setTeamB] = useState('B Takım');
  const [settings, setSettings] = useState({
    timeLimit: 180,
    tabuCount: 3,
    winPoints: 250,
    passCount: 3
  });

  // Uygulama açıldığında ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('tabuuSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.log("Ayarlar yüklenemedi:", error);
      }
    };
    loadSettings();
  }, []);

  const startGame = () => {
    navigation.navigate('Game', {
      teamA,
      teamB,
      ...settings // ayarları da parametre olarak gönder
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="game-controller" size={36} color="#4A6FA5" />
        <Text style={styles.title}>TABU</Text>
      </View>

      {/* Team Inputs */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>1. TAKIM</Text>
          <TextInput
            style={styles.input}
            value={teamA}
            onChangeText={setTeamA}
            placeholder="Takım Adı Girin"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>2. TAKIM</Text>
          <TextInput
            style={styles.input}
            value={teamB}
            onChangeText={setTeamB}
            placeholder="Takım Adı Girin"
            placeholderTextColor="#aaa"
          />
        </View>
      </View>

      {/* Start Button */}
      <TouchableOpacity 
        style={styles.startButton}
        onPress={startGame}
      >
        <Text style={styles.startButtonText}>OYUNA BAŞLA</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f1ea',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A6FA5',
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 40,
  },
  inputWrapper: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  startButton: {
    backgroundColor: '#4A6FA5',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default NewGame;

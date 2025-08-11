import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function TabuuMenu() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.titleOrange}>TaB</Text>
        <Text style={styles.titlePurple}>UU</Text>
      </Text>

      <View style={styles.menuGrid}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#3498db' }]}
          onPress={() => navigation.navigate('NewGame')}
        >
          <Text style={styles.buttonText}>YENİ OYUN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#27ae60' }]}
          onPress={() => navigation.navigate('Scores')}
        >
          <Text style={styles.buttonText}>SKORLAR</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#f39c12' }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.buttonText}>AYARLAR</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#e74c3c' }]}
          onPress={() => navigation.navigate('Help')}
        >
          <Text style={styles.buttonText}>YARDIM</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%', 
    height: '100%',
    backgroundColor: '#f4f1ea',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  titleOrange: {
    color: '#f39c12',
    textShadowColor: '#d35400',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titlePurple: {
    color: '#8e44ad',
    textShadowColor: '#6c3483',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  menuGrid: {
    width: width * 0.8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
    height: 100,
    borderRadius: 15,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

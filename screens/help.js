import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Help = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="help-circle" size={24} color="#4A6FA5" />
          <Text style={styles.title}>OYUN KILAVUZU</Text>
        </View>
        
        <Text style={styles.subtitle}>3 Kolay Adımda Oyun Kurulumu:</Text>
        
        <View style={styles.steps}>
          {[
            "Ana Menü'den Yeni Oyuna Tıkla",
            "Takımların isimlerini yaz", 
            "Oyuna başla ve eğlen!"
          ].map((step, index) => (
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
          <Text style={styles.closeButtonText}>Anladım</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f4f1ea',
    justifyContent: 'center',
    padding: 20, // Ekran kenarlarından boşluk ekledim
  },
  container: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A6FA5',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
    fontWeight: '500',
  },
  steps: {
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A6FA5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#4A6FA5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Help;
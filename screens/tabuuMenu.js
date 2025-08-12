import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function TabuuMenu() {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const menuItems = [
    {
      title: 'YENİ OYUN',
      icon: 'play-circle',
      color: ['#667eea', '#764ba2'],
      screen: 'NewGame',
      description: 'Yeni bir Tabu oyunu başlat'
    },
    {
      title: 'SKORLAR',
      icon: 'trophy',
      color: ['#f093fb', '#f5576c'],
      screen: 'Scores',
      description: 'En yüksek skorları gör'
    },
    {
      title: 'AYARLAR',
      icon: 'settings',
      color: ['#4facfe', '#00f2fe'],
      screen: 'Settings',
      description: 'Oyun ayarlarını düzenle'
    },
    {
      title: 'YARDIM',
      icon: 'help-circle',
      color: ['#43e97b', '#38f9d7'],
      screen: 'Help',
      description: 'Nasıl oynanır?'
    },
  ];

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo ve Başlık */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="game-controller" size={60} color="#fff" />
          </View>
          <Text style={styles.title}>
            <Text style={styles.titleHighlight}>TAB</Text>
            <Text style={styles.titleNormal}>UU</Text>
          </Text>
          <Text style={styles.subtitle}>Klasik Kelime Oyunu</Text>
        </View>

        {/* Menü Butonları */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Animated.View
              key={item.title}
              style={[
                styles.menuItemWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={item.color}
                  style={styles.menuItemGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={item.icon} size={32} color="#fff" style={styles.menuIcon} />
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Alt Bilgi */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Tabuu - Profesyonel Tabu Oyunu</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

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
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  titleHighlight: {
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titleNormal: {
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  menuItemWrapper: {
    marginBottom: 20,
  },
  menuItem: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItemGradient: {
    paddingVertical: 25,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  menuIcon: {
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '300',
  },
});

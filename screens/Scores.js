import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const Scores = ({ navigation }) => {
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalCorrect: 0,
    totalPass: 0,
    totalTaboo: 0,
    bestScore: 0,
    averageScore: 0
  });

  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadScores();
    startAnimations();
  }, []);

  const startAnimations = () => {
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
  };

  const loadScores = async () => {
    try {
      const savedScores = await AsyncStorage.getItem('tabuuScores');
      if (savedScores) {
        const parsedScores = JSON.parse(savedScores);
        setScores(parsedScores);
        calculateStats(parsedScores);
      }
    } catch (error) {
      console.log("Skorlar yüklenemedi:", error);
    }
  };

  const calculateStats = (scoreData) => {
    if (scoreData.length === 0) return;

    const totalGames = scoreData.length;
    const totalCorrect = scoreData.reduce((sum, game) => sum + (game.correct || 0), 0);
    const totalPass = scoreData.reduce((sum, game) => sum + (game.pass || 0), 0);
    const totalTaboo = scoreData.reduce((sum, game) => sum + (game.taboo || 0), 0);
    const bestScore = Math.max(...scoreData.map(game => game.score || 0));
    const averageScore = Math.round(scoreData.reduce((sum, game) => sum + (game.score || 0), 0) / totalGames);

    setStats({
      totalGames,
      totalCorrect,
      totalPass,
      totalTaboo,
      bestScore,
      averageScore
    });
  };

  const clearScores = async () => {
    try {
      await AsyncStorage.removeItem('tabuuScores');
      setScores([]);
      setStats({
        totalGames: 0,
        totalCorrect: 0,
        totalPass: 0,
        totalTaboo: 0,
        bestScore: 0,
        averageScore: 0
      });
    } catch (error) {
      console.log("Skorlar silinemedi:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Ionicons name="trophy" size={40} color="#FFD700" />
            <Text style={styles.title}>SKORLAR</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.statCardGradient}
            >
              <Ionicons name="game-controller" size={24} color="#667eea" />
              <Text style={styles.statNumber}>{stats.totalGames}</Text>
              <Text style={styles.statLabel}>Toplam Oyun</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.statCardGradient}
            >
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.statNumber}>{stats.bestScore}</Text>
              <Text style={styles.statLabel}>En Yüksek Skor</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.statCardGradient}
            >
              <Ionicons name="analytics" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.averageScore}</Text>
              <Text style={styles.statLabel}>Ortalama Skor</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Detailed Stats */}
        <View style={styles.detailedStats}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={styles.detailedStatsCard}
          >
            <Text style={styles.detailedStatsTitle}>DETAYLI İSTATİSTİKLER</Text>
            
            <View style={styles.statRow}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.statRowText}>Doğru Kelimeler: {stats.totalCorrect}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Ionicons name="arrow-forward" size={20} color="#FF9800" />
              <Text style={styles.statRowText}>Kullanılan Pas: {stats.totalPass}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Ionicons name="close-circle" size={20} color="#F44336" />
              <Text style={styles.statRowText}>Tabu Yapılan: {stats.totalTaboo}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Recent Games */}
        <View style={styles.recentGames}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SON OYUNLAR</Text>
            {scores.length > 0 && (
              <TouchableOpacity onPress={clearScores} style={styles.clearButton}>
                <Ionicons name="trash" size={20} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.scoresList} showsVerticalScrollIndicator={false}>
            {scores.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={60} color="rgba(255,255,255,0.5)" />
                <Text style={styles.emptyStateText}>Henüz oyun oynamadınız</Text>
                <Text style={styles.emptyStateSubtext}>İlk oyununuzu oynayın ve skorunuzu görün!</Text>
              </View>
            ) : (
              scores.slice(0, 10).map((score, index) => (
                <View key={index} style={styles.scoreItem}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']}
                    style={styles.scoreCard}
                  >
                    <View style={styles.scoreHeader}>
                      <Text style={styles.scoreDate}>{formatDate(score.date)}</Text>
                      <Text style={styles.scoreValue}>{score.score || 0} puan</Text>
                    </View>
                    
                    <View style={styles.scoreDetails}>
                      <View style={styles.scoreDetail}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.scoreDetailText}>{score.correct || 0}</Text>
                      </View>
                      <View style={styles.scoreDetail}>
                        <Ionicons name="arrow-forward" size={16} color="#FF9800" />
                        <Text style={styles.scoreDetailText}>{score.pass || 0}</Text>
                      </View>
                      <View style={styles.scoreDetail}>
                        <Ionicons name="close-circle" size={16} color="#F44336" />
                        <Text style={styles.scoreDetailText}>{score.taboo || 0}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ))
            )}
          </ScrollView>
        </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '30%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statCardGradient: {
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  detailedStats: {
    marginBottom: 20,
  },
  detailedStatsCard: {
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  detailedStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statRowText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    fontWeight: '500',
  },
  recentGames: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  clearButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoresList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 20,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 10,
    textAlign: 'center',
  },
  scoreItem: {
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreCard: {
    padding: 15,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreDate: {
    fontSize: 12,
    color: '#666',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreDetailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
    fontWeight: '500',
  },
});

export default Scores;

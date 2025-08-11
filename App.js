import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { useWords } from './screens/useWords';

export default function App() {
  const { words, loading } = useWords();

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!words.length) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Kelime bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const first = words[0];

  return (
    <SafeAreaView style={styles.center}>
      <Text style={styles.main}>{first.main_word}</Text>
      {first.taboos.map((t, i) => (
        <Text key={i}>• {t}</Text>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  main: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 }
});

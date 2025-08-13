import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Modal, SafeAreaView, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const STORAGE_KEY = 'userWords';
const categories = [
  { key: 'general', label: 'Genel karışık' },
];

export default function MyWords({ navigation }) {
  const [words, setWords] = useState([]);
  const [modal, setModal] = useState(false);
  const [mainWord, setMainWord] = useState('');
  const [taboos, setTaboos] = useState(['', '', '', '', '']);
  const [category, setCategory] = useState('general');
  const [currentLanguage, setCurrentLanguage] = useState('tr');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setWords(JSON.parse(raw));
      } catch (e) {
        // noop
      }
    })();
  }, []);

  // Dil ayarını odaklanınca tekrar yükle
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const savedSettings = await AsyncStorage.getItem('tabuuSettings');
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setCurrentLanguage(parsed.language ?? 'tr');
          }
        } catch {}
      })();
    }, [])
  );

  const translations = {
    tr: {
      title: 'Kendi Kartların',
      emptyTitle: 'Henüz eklenmiş kelime yok.',
      emptyHelper: 'Sağ alttan + ile ana kelime ve yasakları ekle. Kaydettiklerin oyunda otomatik kullanılır.',
      newCard: 'Yeni Kart',
      mainWord: 'Ana Kelime',
      taboo: 'Yasak',
      cancel: 'İptal',
      save: 'Kaydet',
    },
    en: {
      title: 'My Cards',
      emptyTitle: 'No words added yet.',
      emptyHelper: 'Use the + button to add the main word and forbidden words. Saved cards are used automatically in the game.',
      newCard: 'New Card',
      mainWord: 'Main Word',
      taboo: 'Taboo',
      cancel: 'Cancel',
      save: 'Save',
    },
  }[currentLanguage];

  const saveAll = async (next) => {
    setWords(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const resetForm = () => {
    setMainWord('');
    setTaboos(['', '', '', '', '']);
    setCategory('general');
  };

  const addWord = async () => {
    const cleanTaboos = taboos.map(t => t.trim()).filter(Boolean);
    const mw = mainWord.trim();
    if (!mw || cleanTaboos.length === 0) return;
    const item = {
      id: Date.now().toString(),
      word: mw,
      english_word: mw,
      taboo: cleanTaboos,
      english_taboo: cleanTaboos,
      mode: 'both',
      category,
      source: 'user',
    };
    const next = [item, ...words];
    await saveAll(next);
    resetForm();
    setModal(false);
  };

  const removeWord = async (id) => {
    const next = words.filter(w => w.id !== id);
    await saveAll(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#8B4513" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        data={words}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={{ paddingTop: 12 }}>
            <Text style={styles.empty}>{translations.emptyTitle}</Text>
            <Text style={styles.helper}>{translations.emptyHelper}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemWord}>{item.word}</Text>
              <Text style={styles.itemTaboos}>{item.taboo.join(', ')}</Text>
            </View>
            <TouchableOpacity onPress={() => removeWord(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal transparent visible={modal} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{translations.newCard}</Text>
            <TextInput value={mainWord} onChangeText={setMainWord} placeholder={translations.mainWord} placeholderTextColor="#A0522D" style={styles.input} />
            {taboos.map((t, i) => (
              <TextInput key={i} value={t} onChangeText={(val) => {
                const next = [...taboos]; next[i] = val; setTaboos(next);
              }} placeholder={`${translations.taboo} ${i + 1}`} placeholderTextColor="#A0522D" style={styles.input} />
            ))}
            {/* Tema seçenekleri kaldırıldı; tüm kartlar genel karışık */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#a9d5ee' }]} onPress={() => { resetForm(); setModal(false); }}>
                <Text style={styles.modalBtnText}>{translations.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#66BB6A' }]} onPress={addWord}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{translations.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Platform.OS === 'android' ? '#fff9ef' : '#fdf6e3', paddingTop: Platform.OS === 'android' ? 16 : 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#8B4513', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 21 : 23, color: '#8B4513', fontWeight: 'normal', marginTop: 2 },
  empty: { fontFamily: 'IndieFlower', color: '#8B4513', textAlign: 'center', marginTop: 40, fontSize: Platform.OS === 'android' ? 16 : 18, fontWeight: 'normal' },
  helper: { fontFamily: 'IndieFlower', color: '#8B4513', textAlign: 'center', marginTop: 6, fontSize: Platform.OS === 'android' ? 13 : 14, fontWeight: 'normal' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: '#8B4513', borderRadius: 14, padding: Platform.OS === 'android' ? 10 : 12, marginVertical: 6 },
  itemWord: { fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 18 : 20, color: '#4A6FA5', fontWeight: 'normal' },
  itemTaboos: { fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 14 : 16, color: '#F44336', fontWeight: 'normal' },
  deleteBtn: { backgroundColor: '#EF5350', borderRadius: 10, padding: Platform.OS === 'android' ? 6 : 8, borderWidth: 2, borderColor: '#8B4513', marginLeft: 10 },
  fab: { position: 'absolute', right: 16, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#5b9bd5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#8B4513', elevation: 6 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 18, borderWidth: 2, borderColor: '#8B4513', padding: Platform.OS === 'android' ? 14 : 16 },
  modalTitle: { fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 18 : 20, color: '#8B4513', marginBottom: 8, textAlign: 'center', fontWeight: 'normal' },
  input: { borderWidth: 2, borderColor: '#8B4513', borderRadius: 12, paddingVertical: Platform.OS === 'android' ? 6 : 8, paddingHorizontal: 12, backgroundColor: '#fff', fontFamily: 'IndieFlower', fontSize: Platform.OS === 'android' ? 15 : 16, color: '#333', marginBottom: 8, fontWeight: 'normal' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  catChip: { borderWidth: 2, borderColor: '#8B4513', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#fff', marginRight: 6, marginBottom: 6 },
  catChipActive: { backgroundColor: '#a9d5ee' },
  catText: { fontFamily: 'IndieFlower', color: '#8B4513', fontWeight: 'normal' },
  catTextActive: { color: '#fff' },
  modalBtn: { flex: 1, borderRadius: 12, paddingVertical: Platform.OS === 'android' ? 8 : 10, borderWidth: 2, borderColor: '#8B4513', alignItems: 'center', marginHorizontal: 6 },
  modalBtnText: { fontFamily: 'IndieFlower', color: '#8B4513', fontSize: Platform.OS === 'android' ? 15 : 16, fontWeight: 'normal' },
});



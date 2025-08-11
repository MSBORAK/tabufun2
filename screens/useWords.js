import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseClient';
import bundledWords from '../assets/words.json';

const STORAGE_KEY = 'TABU_WORDS';

export function useWords() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const net = await NetInfo.fetch();

      if (net.isConnected) {
        const { data, error } = await supabase.from('words').select('*');
        if (!error && data.length) {
          const normalized = data.map(d => ({
            id: d.id,
            main_word: d.main_word,
            taboos: [d.taboo_1, d.taboo_2, d.taboo_3, d.taboo_4, d.taboo_5].filter(Boolean)
          }));
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          if (mounted) setWords(normalized);
        } else {
          const local = await AsyncStorage.getItem(STORAGE_KEY);
          if (local) setWords(JSON.parse(local));
          else setWords(bundledWords);
        }
      } else {
        const local = await AsyncStorage.getItem(STORAGE_KEY);
        if (local) setWords(JSON.parse(local));
        else setWords(bundledWords);
      }
      setLoading(false);
    }

    load();
    return () => { mounted = false; };
  }, []);

  return { words, loading };
}

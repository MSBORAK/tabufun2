import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SoundManagerImpl {
  constructor() {
    this.enabled = true;
    this.initialized = false;
    this.sounds = {};
  }

  async init() {
    if (this.initialized) return;
    try {
      const saved = await AsyncStorage.getItem('tabuuSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.enabled = parsed.soundEnabled ?? true;
      }
    } catch {}
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
    } catch {}
    await this._ensureLoaded('correct', require('../assets/dogru.mp3'));
    await this._ensureLoaded('pass', require('../assets/pas.mp3'));
    await this._ensureLoaded('taboo', require('../assets/Tabu.mp3'));
    await this._ensureLoaded('page', require('../assets/sayfa atlama.mp3'));
    await this._ensureLoaded('bgm', require('../assets/oyun müsic.mp3'));
    this.initialized = true;
  }

  async _ensureLoaded(key, moduleRef) {
    if (this.sounds[key]) return;
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(moduleRef);
      this.sounds[key] = sound;
    } catch {}
  }

  setEnabled(flag) {
    this.enabled = !!flag;
  }

  async playKey(key) {
    if (!this.enabled) return;
    const sound = this.sounds[key];
    if (!sound) return;
    try {
      await sound.replayAsync();
    } catch {
      try {
        await sound.stopAsync();
        await sound.playAsync();
      } catch {}
    }
  }

  playPass() { return this.playKey('pass'); }
  playTaboo() { return this.playKey('taboo'); }
  playPage() { return this.playKey('page'); }
  playCorrect() { return this.playKey('correct'); }

  async startBGM(volume = 0.1) {
    const sound = this.sounds['bgm'];
    if (!sound) return;
    try {
      await sound.setIsLoopingAsync(true);
      await sound.setVolumeAsync(volume);
      if (this.enabled) {
        await sound.playAsync();
      }
    } catch {}
  }

  async stopBGM() {
    const sound = this.sounds['bgm'];
    if (!sound) return;
    try {
      await sound.stopAsync();
    } catch {}
  }
}

const SoundManager = new SoundManagerImpl();
export default SoundManager;
export { SoundManager };



import React from 'react';
import { Platform } from 'react-native';
import mobileAds, { 
  BannerAd, 
  BannerAdSize, 
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType 
} from 'react-native-google-mobile-ads';

class AdManager {
  constructor() {
    this.isInitialized = false;
    this.testMode = __DEV__; // Development modunda test reklamları
    this.interstitialAd = null;
    this.rewardedAd = null;
    
    // GERÇEK ADMOB UNIT ID'LERİ
    this.adUnitIds = {
      banner: this.testMode 
        ? TestIds.BANNER
        : (Platform.OS === 'ios' ? 'ca-app-pub-9626188317897618/9642087030' : 'ca-app-pub-9626188317897618/3753102582'),
      
      interstitial: this.testMode
        ? TestIds.INTERSTITIAL
        : (Platform.OS === 'ios' ? 'ca-app-pub-9626188317897618/4816818534' : 'ca-app-pub-9626188317897618/9486174363'),
      
      rewarded: this.testMode
        ? TestIds.REWARDED
        : (Platform.OS === 'ios' ? 'ca-app-pub-9626188317897618/4816818534' : 'ca-app-pub-9626188317897618/9486174363')
    };
  }

  async init() {
    try {
      // Google Mobile Ads SDK'sını başlat
      await mobileAds().initialize();
      
      // Interstitial reklamı hazırla
      this.interstitialAd = InterstitialAd.createForAdRequest(this.adUnitIds.interstitial);
      this.loadInterstitial();
      
      // Rewarded reklamı hazırla
      this.rewardedAd = RewardedAd.createForAdRequest(this.adUnitIds.rewarded);
      this.loadRewarded();
      
      this.isInitialized = true;
      console.log('✅ Google Mobile Ads initialized successfully');
    } catch (error) {
      console.warn('⚠️ Google Mobile Ads initialization failed:', error);
    }
  }

  // Banner Reklam Component
  BannerAd = ({ style = {} }) => {
    if (!this.isInitialized) return null;
    
    return (
      <BannerAd
        unitId={this.adUnitIds.banner}
        size={BannerAdSize.SMART_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.warn('Banner ad failed to load:', error);
        }}
        style={style}
      />
    );
  };

  // Interstitial Reklam (Oyun sonu, level geçişi)
  loadInterstitial() {
    if (!this.interstitialAd) return;
    
    try {
      const unsubscribe = this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('Interstitial ad loaded');
        unsubscribe();
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Interstitial ad closed');
        // Yeni reklam yükle
        this.interstitialAd = InterstitialAd.createForAdRequest(this.adUnitIds.interstitial);
        this.loadInterstitial();
      });

      this.interstitialAd.load();
    } catch (error) {
      console.warn('Interstitial load error:', error);
    }
  }

  async showInterstitial() {
    try {
      if (this.interstitialAd && this.interstitialAd.loaded) {
        await this.interstitialAd.show();
        return true;
      } else {
        console.log('Interstitial ad not ready');
        return false;
      }
    } catch (error) {
      console.warn('Interstitial show error:', error);
      return false;
    }
  }

  // Rewarded Reklam (Extra ipucu, bonus puan)
  loadRewarded() {
    if (!this.rewardedAd) return;
    
    try {
      const unsubscribe = this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('Rewarded ad loaded');
        unsubscribe();
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        console.log('User earned reward:', reward);
      });

      this.rewardedAd.load();
    } catch (error) {
      console.warn('Rewarded load error:', error);
    }
  }

  async showRewarded() {
    return new Promise(async (resolve) => {
      try {
        if (!this.rewardedAd || !this.rewardedAd.loaded) {
          resolve(false);
          return;
        }

        // Ödül listener'ı
        const rewardListener = this.rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD, 
          (reward) => {
            console.log('🎁 User earned reward:', reward);
            resolve(true);
          }
        );

        const closeListener = this.rewardedAd.addAdEventListener(
          AdEventType.CLOSED, 
          () => {
            console.log('❌ Rewarded ad closed');
            rewardListener();
            closeListener();
            // Yeni reklam yükle
            this.rewardedAd = RewardedAd.createForAdRequest(this.adUnitIds.rewarded);
            this.loadRewarded();
            resolve(false);
          }
        );

        await this.rewardedAd.show();
        
      } catch (error) {
        console.warn('Rewarded show error:', error);
        resolve(false);
      }
    });
  }

  // Yardımcı fonksiyonlar
  shouldShowInterstitial() {
    // Her 3 oyunda bir göster
    const gameCount = parseInt(global.gameCount || 0);
    return gameCount > 0 && gameCount % 3 === 0;
  }

  incrementGameCount() {
    global.gameCount = (global.gameCount || 0) + 1;
  }
}

export default new AdManager();
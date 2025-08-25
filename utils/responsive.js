import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isTablet = () => {
  // iPad 13" gibi büyük ekranlar için kontrol
  return width >= 768 || height >= 1024;
};

export const isLargeTablet = () => {
  // iPad Pro 13" ve üzeri için özel kontrol
  return (width >= 1024 && height >= 1366) || (width >= 1366 && height >= 1024);
};

export const getResponsiveSize = (phoneSize, tabletSize, largeTabletSize) => {
  if (isLargeTablet()) {
    return largeTabletSize || tabletSize || phoneSize;
  }
  if (isTablet()) {
    return tabletSize || phoneSize;
  }
  return phoneSize;
};

export const getResponsiveFontSize = (size) => {
  const multiplier = isLargeTablet() ? 1.4 : isTablet() ? 1.2 : 1;
  return size * multiplier;
};

export const getResponsivePadding = (size) => {
  const multiplier = isLargeTablet() ? 1.6 : isTablet() ? 1.3 : 1;
  return size * multiplier;
};

export const getResponsiveMargin = (size) => {
  const multiplier = isLargeTablet() ? 1.5 : isTablet() ? 1.2 : 1;
  return size * multiplier;
};

export const getResponsiveIconSize = (size) => {
  const multiplier = isLargeTablet() ? 1.6 : isTablet() ? 1.3 : 1;
  return size * multiplier;
};

export const getResponsiveWidth = (percentage) => {
  // iPad'de daha optimal genişlik kullanımı
  if (isLargeTablet()) {
    return Math.min(width * (percentage / 100), 600); // Maksimum 600px
  }
  if (isTablet()) {
    return Math.min(width * (percentage / 100), 500); // Maksimum 500px
  }
  return width * (percentage / 100);
};

export const getResponsiveHeight = (percentage) => {
  return height * (percentage / 100);
};

export const getDeviceType = () => {
  if (isLargeTablet()) return 'largeTablet';
  if (isTablet()) return 'tablet';
  return 'phone';
};

export const responsiveStyles = {
  // Yazı boyutları
  titleFont: getResponsiveFontSize(Platform.OS === 'android' ? 60 : 70),
  subtitleFont: getResponsiveFontSize(24),
  bodyFont: getResponsiveFontSize(18),
  buttonFont: getResponsiveFontSize(16),
  
  // Padding ve margin değerleri
  containerPadding: getResponsivePadding(16),
  cardPadding: getResponsivePadding(20),
  buttonPadding: getResponsivePadding(12),
  
  // Button boyutları
  buttonHeight: getResponsiveSize(50, 60, 70),
  iconSize: getResponsiveIconSize(24),
  
  // Layout için
  maxContentWidth: getResponsiveWidth(90),
  
  // Specific için iPad adjustments
  gameCardWidth: isLargeTablet() ? '45%' : isTablet() ? '48%' : '85%',
  menuButtonWidth: isLargeTablet() ? '60%' : isTablet() ? '70%' : '85%',
};

export default {
  isTablet,
  isLargeTablet,
  getResponsiveSize,
  getResponsiveFontSize,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveIconSize,
  getResponsiveWidth,
  getResponsiveHeight,
  getDeviceType,
  responsiveStyles,
};

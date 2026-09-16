// App theme for React Native (light and dark)
import { AppColors } from '../constants/appColors';

export const lightTheme = {
  dark: false,
  colors: {
    primary: AppColors.primary,
    background: AppColors.lightBackground,
    card: '#fff',
    text: AppColors.textPrimaryLight,
    border: '#e0e0e0',
    notification: AppColors.accent,
    success: AppColors.success,
    warning: AppColors.warning,
    error: AppColors.error,
    info: AppColors.info,
  },
  cardStyle: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  inputStyle: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 18,
    borderWidth: 0,
    padding: 12,
  },
  appBar: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: AppColors.primary,
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: -0.5,
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: AppColors.primary,
    background: AppColors.darkBackground,
    card: 'rgba(15,23,42,0.6)',
    text: AppColors.textPrimaryDark,
    border: 'rgba(255,255,255,0.05)',
    notification: AppColors.accent,
    success: AppColors.success,
    warning: AppColors.warning,
    error: AppColors.error,
    info: AppColors.info,
  },
  cardStyle: {
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputStyle: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    borderWidth: 0,
    padding: 12,
  },
  appBar: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    color: '#fff',
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: -0.5,
  },
};

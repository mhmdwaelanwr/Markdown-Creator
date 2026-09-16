// Toast helper for React Native
import { ToastAndroid, Platform, Alert } from 'react-native';

export function showToast(message, isError = false) {
  if (Platform.OS === 'android') {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
  } else {
    Alert.alert(isError ? 'Error' : 'Success', message);
  }
}

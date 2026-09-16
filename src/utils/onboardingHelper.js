// OnboardingHelper for React Native
import { PreferenceKeys, PreferencesService } from '../services/preferencesService';

export async function shouldShowOnboarding() {
  const hasSeen = await PreferencesService.getBool(PreferenceKeys.hasSeenOnboarding, false);
  return !hasSeen;
}

export async function markOnboardingComplete() {
  await PreferencesService.setBool(PreferenceKeys.hasSeenOnboarding, true);
  return true;
}

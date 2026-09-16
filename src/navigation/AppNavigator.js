import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import EditorScreen from '../screens/EditorScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import ProjectsLibraryScreen from '../screens/ProjectsLibraryScreen';
import GalleryScreen from '../screens/GalleryScreen';
import SocialPreviewScreen from '../screens/SocialPreviewScreen';
import GitHubActionsGeneratorScreen from '../screens/GitHubActionsGeneratorScreen';
import FundingGeneratorScreen from '../screens/FundingGeneratorScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Editor"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Editor" component={EditorScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ProjectsLibrary" component={ProjectsLibraryScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="SocialPreview" component={SocialPreviewScreen} />
        <Stack.Screen name="GitHubActions" component={GitHubActionsGeneratorScreen} />
        <Stack.Screen name="FundingGenerator" component={FundingGeneratorScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

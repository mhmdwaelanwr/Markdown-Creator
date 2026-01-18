// Markdown Creator - The ultimate documentation tool.
// Development by: Mohamed Anwar (mhmdwaelanwr)

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';

import 'package:markdown_creator/l10n/app_localizations.dart';
import 'package:markdown_creator/providers/project_provider.dart';
import 'package:markdown_creator/providers/library_provider.dart';
import 'package:markdown_creator/screens/home_screen.dart';
import 'package:markdown_creator/core/theme/app_theme.dart';

// IMPORTANT: After running 'flutterfire configure', this file will be generated.
// We use a conditional check to avoid build errors if the file is missing.
import 'package:markdown_creator/services/auth_service.dart';

void main() async {
  // Use runZonedGuarded for production-grade error catching
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();
    
    // Set preferred orientations for better UI control
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);

    bool firebaseInitialized = false;
    try {
      // Check for custom firebase_options.dart presence in future steps
      // For now, we use the standard initialization
      await Firebase.initializeApp();
      firebaseInitialized = true;
      debugPrint('🚀 Firebase Engine: Operational');
    } catch (e) {
      debugPrint('⚠️ Firebase Engine: Offline Mode ($e)');
    }

    runApp(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => ProjectProvider()),
          ChangeNotifierProvider(
            create: (_) => LibraryProvider(isFirebaseAvailable: firebaseInitialized),
          ),
          Provider(create: (_) => AuthService()),
        ],
        child: const MyApp(),
      ),
    );
  }, (error, stack) {
    debugPrint('❌ Critical System Error: $error');
    debugPrint(stack.toString());
  });
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ProjectProvider>(
      builder: (context, provider, child) {
        return MaterialApp(
          title: 'Markdown Creator Pro',
          debugShowCheckedModeBanner: false,
          
          // Localization Setup
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: AppLocalizations.supportedLocales,
          locale: provider.locale,
          
          // Theming
          themeMode: provider.themeMode,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          
          // Navigation
          initialRoute: '/',
          onGenerateRoute: (settings) {
            if (settings.name == '/') {
              return MaterialPageRoute(builder: (_) => const HomeScreen());
            }
            return null;
          },
        );
      },
    );
  }
}

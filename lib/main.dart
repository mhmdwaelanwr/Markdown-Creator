// Markdown Creator Pro - The Ultimate Tech Doc Suite
// Developed by: Mohamed Anwar (mhmdwaelanwr)

import 'dart:async';
import 'dart:io'; // Added for platform check
import 'package:flutter/foundation.dart'; // Added for kIsWeb
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
import 'package:markdown_creator/services/auth_service.dart';

void main() {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();
    
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);

    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    bool firebaseInitialized = false;
    try {
      if (!kIsWeb && Platform.isWindows) {
        // Windows needs explicit options if firebase_options.dart is missing
        // You should run 'flutterfire configure' to generate the real options
        await Firebase.initializeApp(
          options: const FirebaseOptions(
            apiKey: 'YOUR_API_KEY', // Placeholder
            appId: 'YOUR_APP_ID',   // Placeholder
            messagingSenderId: 'YOUR_SENDER_ID',
            projectId: 'YOUR_PROJECT_ID',
          ),
        );
      } else {
        await Firebase.initializeApp();
      }
      firebaseInitialized = true;
      debugPrint('🛡️ Firebase Engine: ACTIVE');
    } catch (e) {
      debugPrint('⚠️ Firebase Engine: OFFLINE MODE ($e)');
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
        child: const MarkdownCreatorApp(),
      ),
    );
  }, (error, stack) {
    debugPrint('❌ Global Crash Guard: $error');
  });
}

class MarkdownCreatorApp extends StatelessWidget {
  const MarkdownCreatorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ProjectProvider>(
      builder: (context, provider, child) {
        return MaterialApp(
          title: 'Markdown Creator Pro',
          debugShowCheckedModeBanner: false,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: AppLocalizations.supportedLocales,
          locale: provider.locale,
          themeMode: provider.themeMode,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          initialRoute: '/',
          routes: {
            '/': (context) => const HomeScreen(),
          },
        );
      },
    );
  }
}

// Markdown Creator
// Development by: Mohamed Anwar (mhmdwaelanwr)

import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';

// IMPORTANT: After running 'flutterfire configure', uncomment the line below:
// import 'package:markdown_creator/firebase_options.dart'; 

import 'package:markdown_creator/l10n/app_localizations.dart';
import 'package:markdown_creator/providers/project_provider.dart';
import 'package:markdown_creator/providers/library_provider.dart';
import 'package:markdown_creator/screens/home_screen.dart';
import 'package:markdown_creator/core/theme/app_theme.dart';

void main() {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    bool firebaseInitialized = false;
    try {
      // Attempt safe initialization
      await Firebase.initializeApp();
      firebaseInitialized = true;
      debugPrint('Firebase Core: Connected');
    } catch (e) {
      debugPrint('Firebase Core: Running in Offline Mode ($e)');
    }

    runApp(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => ProjectProvider()),
          ChangeNotifierProvider(create: (_) => LibraryProvider(isFirebaseAvailable: firebaseInitialized)),
        ],
        child: const MyApp(),
      ),
    );
  }, (error, stack) {
    debugPrint('Global System Error: $error');
  });
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ProjectProvider>(
      builder: (context, provider, child) {
        return MaterialApp(
          title: 'Markdown Creator',
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

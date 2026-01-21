// Markdown Creator Pro - The Ultimate Tech Doc Suite
// Developed by: Mohamed Anwar (mhmdwaelanwr)

import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
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

// سيتم إنشاء هذا الملف تلقائياً عند تشغيل flutterfire configure
// إذا لم يظهر لك خطأ تحت هذا السطر، فالتطبيق سيعمل بشكل كامل
import 'package:markdown_creator/firebase_options.dart';

void main() {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();
    
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);

    // تحسين مظهر شريط الحالة
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ));

    bool firebaseInitialized = false;
    try {
      // استخدام DefaultFirebaseOptions.currentPlatform هو الحل الصحيح لكل المنصات
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      firebaseInitialized = true;
      debugPrint('🛡️ Firebase Engine: ACTIVE');
    } catch (e) {
      debugPrint('⚠️ Firebase Engine: OFFLINE MODE ($e)');
      // إذا فشل الاتصال، يمكننا المحاولة مرة أخرى بدون خيارات لبعض المنصات
      if (!firebaseInitialized) {
        try {
          await Firebase.initializeApp();
          firebaseInitialized = true;
        } catch (_) {}
      }
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
    debugPrint(stack.toString());
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

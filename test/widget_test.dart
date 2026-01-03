// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:readme_creator/main.dart';
import 'package:readme_creator/providers/project_provider.dart';
import 'package:readme_creator/providers/library_provider.dart';

void main() {
  testWidgets('App loads and shows title', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => ProjectProvider()),
          ChangeNotifierProvider(create: (_) => LibraryProvider()),
        ],
        child: const MyApp(),
      ),
    );

    // Verify that our title is present.
    expect(find.text('Advanced Readme Creator'), findsOneWidget);
    // Components is now in a Tab, so it should still be found.
    expect(find.text('Components'), findsOneWidget);
  });
}

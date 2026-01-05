import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:tutorial_coach_mark/tutorial_coach_mark.dart';
import 'package:google_fonts/google_fonts.dart';

class OnboardingHelper {
  static Future<void> showOnboarding({
    required BuildContext context,
    required GlobalKey componentsKey,
    required GlobalKey canvasKey,
    required GlobalKey settingsKey,
    required GlobalKey exportKey,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final hasSeenOnboarding = prefs.getBool('hasSeenOnboarding') ?? false;

    if (hasSeenOnboarding) return;

    if (!context.mounted) return;

    final targets = _createTargets(
      context: context,
      componentsKey: componentsKey,
      canvasKey: canvasKey,
      settingsKey: settingsKey,
      exportKey: exportKey,
    );

    TutorialCoachMark(
      targets: targets,
      colorShadow: Colors.black,
      textSkip: "SKIP",
      paddingFocus: 10,
      opacityShadow: 0.8,
      textStyleSkip: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
      onFinish: () {
        prefs.setBool('hasSeenOnboarding', true);
      },
      onSkip: () {
        prefs.setBool('hasSeenOnboarding', true);
        return true;
      },
    ).show(context: context);
  }

  static void restartOnboarding({
    required BuildContext context,
    required GlobalKey componentsKey,
    required GlobalKey canvasKey,
    required GlobalKey settingsKey,
    required GlobalKey exportKey,
  }) {
    final targets = _createTargets(
      context: context,
      componentsKey: componentsKey,
      canvasKey: canvasKey,
      settingsKey: settingsKey,
      exportKey: exportKey,
    );

    TutorialCoachMark(
      targets: targets,
      colorShadow: Colors.black,
      textSkip: "SKIP",
      paddingFocus: 10,
      opacityShadow: 0.8,
      textStyleSkip: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
    ).show(context: context);
  }

  static List<TargetFocus> _createTargets({
    required BuildContext context,
    required GlobalKey componentsKey,
    required GlobalKey canvasKey,
    required GlobalKey settingsKey,
    required GlobalKey exportKey,
  }) {
    const textColor = Colors.white;

    return [
      TargetFocus(
        identify: "components",
        keyTarget: componentsKey,
        alignSkip: Alignment.topRight,
        shape: ShapeLightFocus.RRect,
        radius: 10,
        contents: [
          TargetContent(
            align: ContentAlign.right,
            builder: (context, controller) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "1. Components Panel",
                    style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: textColor, fontSize: 24),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "Drag and drop these components onto the canvas to build your README.",
                    style: GoogleFonts.inter(color: textColor, fontSize: 16),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () => controller.next(),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.black),
                    child: const Text("Next"),
                  ),
                ],
              );
            },
          ),
        ],
      ),
      TargetFocus(
        identify: "canvas",
        keyTarget: canvasKey,
        alignSkip: Alignment.topRight,
        shape: ShapeLightFocus.RRect,
        radius: 10,
        contents: [
          TargetContent(
            align: ContentAlign.bottom,
            builder: (context, controller) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "2. Editor Canvas",
                    style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: textColor, fontSize: 24),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "This is your workspace. Reorder items here. Click an item to edit its properties.",
                    style: GoogleFonts.inter(color: textColor, fontSize: 16),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      TextButton(
                        onPressed: () => controller.previous(),
                        style: TextButton.styleFrom(foregroundColor: Colors.white),
                        child: const Text("Previous"),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        onPressed: () => controller.next(),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.black),
                        child: const Text("Next"),
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
        ],
      ),
      TargetFocus(
        identify: "settings",
        keyTarget: settingsKey,
        alignSkip: Alignment.topRight,
        shape: ShapeLightFocus.RRect,
        radius: 10,
        contents: [
          TargetContent(
            align: ContentAlign.left,
            builder: (context, controller) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "3. Settings & Preview",
                    style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: textColor, fontSize: 24),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "Edit the selected component's properties here. Switch tabs to see the live Markdown preview.",
                    style: GoogleFonts.inter(color: textColor, fontSize: 16),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      TextButton(
                        onPressed: () => controller.previous(),
                        style: TextButton.styleFrom(foregroundColor: Colors.white),
                        child: const Text("Previous"),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        onPressed: () => controller.next(),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.black),
                        child: const Text("Next"),
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
        ],
      ),
      TargetFocus(
        identify: "export",
        keyTarget: exportKey,
        alignSkip: Alignment.topRight,
        shape: ShapeLightFocus.Circle,
        contents: [
          TargetContent(
            align: ContentAlign.bottom,
            builder: (context, controller) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "4. Export Project",
                    style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: textColor, fontSize: 24),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "When you are done, click here to download your README.md and other files.",
                    style: GoogleFonts.inter(color: textColor, fontSize: 16),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      TextButton(
                        onPressed: () => controller.previous(),
                        style: TextButton.styleFrom(foregroundColor: Colors.white),
                        child: const Text("Previous"),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        onPressed: () => controller.next(),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.black),
                        child: const Text("Finish"),
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
        ],
      ),
    ];
  }
}

import 'dart:math';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:flutter/foundation.dart';

class AIService {
  static Future<String> improveText(String text, {String? apiKey}) async {
    if (apiKey != null && apiKey.isNotEmpty) {
      try {
        final model = GenerativeModel(model: 'gemini-1.5-flash', apiKey: apiKey);
        final content = [Content.text('Improve the following text for a README file, making it more professional, concise, and engaging:\n\n$text')];
        final response = await model.generateContent(content);
        return response.text ?? text;
      } catch (e) {
        debugPrint('Gemini API Error: $e');
        return '$text (Error: ${e.toString().replaceAll('GenerativeAIException: ', '')})';
      }
    }

    // Mock fallback
    await Future.delayed(const Duration(milliseconds: 800));
    if (text.isEmpty) return 'Generated content based on context...';
    return '$text (AI Enhanced)';
  }

  static Future<String> generateDescription(String topic, {String? apiKey}) async {
    if (apiKey != null && apiKey.isNotEmpty) {
      try {
        final model = GenerativeModel(model: 'gemini-1.5-flash', apiKey: apiKey);
        final content = [Content.text('Generate a short, engaging project description for a project about: $topic. Include emojis where appropriate.')];
        final response = await model.generateContent(content);
        return response.text ?? 'Could not generate description.';
      } catch (e) {
        debugPrint('Gemini API Error: $e');
        return 'Error: ${e.toString().replaceAll('GenerativeAIException: ', '')}';
      }
    }

    await Future.delayed(const Duration(milliseconds: 800));
    return 'A comprehensive solution for $topic built with modern technologies.';
  }

  static Future<String> fixGrammar(String text, {String? apiKey}) async {
    if (apiKey != null && apiKey.isNotEmpty) {
      try {
        final model = GenerativeModel(model: 'gemini-1.5-flash', apiKey: apiKey);
        final content = [Content.text('Fix grammar and spelling in the following text. Preserve markdown formatting:\n\n$text')];
        final response = await model.generateContent(content);
        return response.text ?? text;
      } catch (e) {
        debugPrint('Gemini API Error: $e');
        return text;
      }
    }

    await Future.delayed(const Duration(milliseconds: 500));
    String fixed = text.trim();
    if (fixed.isNotEmpty) {
      fixed = fixed[0].toUpperCase() + fixed.substring(1);
      if (!fixed.endsWith('.') && !fixed.endsWith('!') && !fixed.endsWith('?')) fixed += '.';
    }
    return fixed;
  }

  static Future<String> generateReadmeFromStructure(String structure, {String? apiKey}) async {
    if (apiKey != null && apiKey.isNotEmpty) {
      try {
        final model = GenerativeModel(model: 'gemini-1.5-flash', apiKey: apiKey);
        final prompt = '''
You are an expert developer tool designed to generate comprehensive README.md files.
Analyze the following codebase structure and generate a professional, detailed README.md file in Markdown format.

Include:
1. Project Title and Description.
2. Key Features.
3. Tech Stack.
4. Quick Start / Installation.
5. Project Structure.
6. How to Contribute.

Output ONLY the raw Markdown content.

Structure:
$structure
''';
        final content = [Content.text(prompt)];
        final response = await model.generateContent(content);
        return response.text ?? '# Generated README';
      } catch (e) {
        debugPrint('Gemini API Error: $e');
        return '# Error: ${e.toString()}';
      }
    }
    return '# Mock README\n\nProvide an API Key to use AI generation.';
  }
}

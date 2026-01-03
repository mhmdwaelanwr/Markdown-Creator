import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class GitHubService {
  static const String _baseUrl = 'https://api.github.com';

  Future<Map<String, dynamic>?> fetchRepoDetails(String owner, String repo, {String? token}) async {
    final url = Uri.parse('$_baseUrl/repos/$owner/$repo');
    final headers = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'token $token';
    }

    try {
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        debugPrint('GitHub API Error: ${response.statusCode} ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('GitHub API Exception: $e');
      return null;
    }
  }

  Future<List<Map<String, dynamic>>?> fetchContributors(String owner, String repo, {String? token}) async {
    final url = Uri.parse('$_baseUrl/repos/$owner/$repo/contributors');
    final headers = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'token $token';
    }

    try {
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        debugPrint('GitHub API Error: ${response.statusCode} ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('GitHub API Exception: $e');
      return null;
    }
  }
}

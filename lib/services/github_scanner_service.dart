import 'package:path/path.dart' as path;
import 'github_service.dart';

class GitHubScannerService {
  static const List<String> _ignoredDirectories = [
    '.git',
    '.idea',
    '.vscode',
    'build',
    'dist',
    'node_modules',
    'android',
    'ios',
    'windows',
    'linux',
    'macos',
    'web',
    'coverage',
    '__pycache__',
    'venv',
    'env',
    '.dart_tool',
  ];

  static const List<String> _ignoredExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
    '.mp4', '.mov', '.avi',
    '.mp3', '.wav',
    '.pdf', '.doc', '.docx',
    '.zip', '.tar', '.gz', '.rar',
    '.exe', '.dll', '.so', '.dylib', '.bin',
    '.class', '.o', '.obj',
    '.lock', '.log',
    '.ttf', '.otf', '.woff', '.woff2',
    '.db', '.sqlite', '.sqlite3',
  ];

  final GitHubService _githubService = GitHubService();

  Future<String> scanRepo(String repoUrl, {String? token}) async {
    final (owner, repo) = _parseRepoUrl(repoUrl);
    if (owner == null || repo == null) {
      throw Exception('Invalid GitHub URL');
    }

    final tree = await _githubService.fetchRepoTree(owner, repo, token: token);
    if (tree == null) {
      throw Exception('Failed to fetch repository tree. Check URL or token permissions.');
    }

    final buffer = StringBuffer();
    buffer.writeln('Project Codebase Context (GitHub: $owner/$repo):');
    buffer.writeln('================================================\n');

    // Filter files
    final filesToFetch = tree.where((node) {
      if (node['type'] != 'blob') return false; // Only files
      final filePath = node['path'] as String;
      return !_shouldIgnore(filePath);
    }).toList();

    // Limit to avoid hitting API limits or context window too hard
    // Let's say max 50 files for now, prioritizing root and src
    // Or just fetch all but handle errors.
    // Better to fetch important ones.
    // For now, let's try to fetch up to 30 files to be safe with rate limits if no token.

    int fetchedCount = 0;
    const int maxFiles = 40;

    for (final node in filesToFetch) {
      if (fetchedCount >= maxFiles) {
        buffer.writeln('\n(Truncated: Max file limit reached)');
        break;
      }

      final filePath = node['path'] as String;

      // Skip lock files explicitly if missed by extension check
      if (filePath.endsWith('lock.json') || filePath.endsWith('.lock')) continue;

      try {
        final content = await _githubService.fetchFileContent(owner, repo, filePath, token: token);
        if (content != null) {
          // Basic binary check (if content contains null bytes)
          if (content.contains('\u0000')) continue;

          buffer.writeln('File: $filePath');
          buffer.writeln('---START---');
          buffer.writeln(content);
          buffer.writeln('---END---\n');
          fetchedCount++;
        }
      } catch (e) {
        // Ignore fetch errors
      }
    }

    return buffer.toString();
  }

  (String?, String?) _parseRepoUrl(String url) {
    final uri = Uri.tryParse(url);
    if (uri == null) return (null, null);

    final segments = uri.pathSegments;
    if (segments.length >= 2) {
      return (segments[0], segments[1]);
    }
    return (null, null);
  }

  bool _shouldIgnore(String filePath) {
    final parts = path.split(filePath);

    // Check directories
    for (final part in parts) {
      if (_ignoredDirectories.contains(part)) return true;
      if (part.startsWith('.') && part != '.gitignore') return true; // Ignore hidden files/folders generally, except gitignore
    }

    // Check extension
    final ext = path.extension(filePath).toLowerCase();
    if (_ignoredExtensions.contains(ext)) return true;

    return false;
  }
}


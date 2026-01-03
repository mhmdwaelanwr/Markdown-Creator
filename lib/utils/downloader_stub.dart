import 'package:flutter/foundation.dart';

void downloadFile(String content, String filename) {
  debugPrint('Download not supported on this platform yet. Filename: $filename\nContent:\n$content');
}

void downloadZip(List<int> bytes, String filename) {
  debugPrint('Download ZIP not supported on this platform yet. Filename: $filename');
}


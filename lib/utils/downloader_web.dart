// ignore: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html' as html;
import 'dart:convert';

Future<void> downloadFile(String content, String filename) async {
  final bytes = utf8.encode(content);
  _downloadBytes(bytes, filename);
}

Future<void> downloadZip(List<int> bytes, String filename) async {
  _downloadBytes(bytes, filename);
}

void _downloadBytes(List<int> bytes, String filename) {
  final blob = html.Blob([bytes]);
  final url = html.Url.createObjectUrlFromBlob(blob);
  html.AnchorElement(href: url)
    ..setAttribute("download", filename)
    ..click();
  html.Url.revokeObjectUrl(url);
}


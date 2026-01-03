import 'downloader_stub.dart'
    if (dart.library.html) 'downloader_web.dart';

void downloadReadme(String content) => downloadFile(content, 'README.md');

void downloadZipFile(List<int> bytes, String filename) => downloadZip(bytes, filename);

void downloadJsonFile(String content, String filename) => downloadFile(content, filename);


import 'package:flutter/material.dart';
import '../services/giphy_service.dart';

class GiphyPickerDialog extends StatefulWidget {
  const GiphyPickerDialog({super.key});

  @override
  State<GiphyPickerDialog> createState() => _GiphyPickerDialogState();
}

class _GiphyPickerDialogState extends State<GiphyPickerDialog> {
  final GiphyService _giphyService = GiphyService();
  final TextEditingController _searchController = TextEditingController();
  List<String> _gifs = [];
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTrending();
  }

  Future<void> _loadTrending() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final gifs = await _giphyService.getTrendingGifs();
      setState(() {
        _gifs = gifs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _search(String query) async {
    if (query.isEmpty) {
      _loadTrending();
      return;
    }
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final gifs = await _giphyService.searchGifs(query);
      setState(() {
        _gifs = gifs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Select GIF from GIPHY'),
      content: SizedBox(
        width: 600,
        height: 500,
        child: Column(
          children: [
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                labelText: 'Search GIFs',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _loadTrending();
                  },
                ),
                border: const OutlineInputBorder(),
              ),
              onSubmitted: _search,
            ),
            const SizedBox(height: 16),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _error != null
                      ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
                      : _gifs.isEmpty
                          ? const Center(child: Text('No GIFs found'))
                          : GridView.builder(
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 3,
                                crossAxisSpacing: 8,
                                mainAxisSpacing: 8,
                              ),
                              itemCount: _gifs.length,
                              itemBuilder: (context, index) {
                                final url = _gifs[index];
                                return InkWell(
                                  onTap: () => Navigator.pop(context, url),
                                  child: Image.network(
                                    url,
                                    fit: BoxFit.cover,
                                    loadingBuilder: (context, child, loadingProgress) {
                                      if (loadingProgress == null) return child;
                                      return const Center(child: CircularProgressIndicator(strokeWidth: 2));
                                    },
                                  ),
                                );
                              },
                            ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
      ],
    );
  }
}


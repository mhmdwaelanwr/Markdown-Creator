import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/library_provider.dart';
import '../providers/project_provider.dart';

class ProjectsLibraryScreen extends StatefulWidget {
  const ProjectsLibraryScreen({super.key});

  @override
  State<ProjectsLibraryScreen> createState() => _ProjectsLibraryScreenState();
}

class _ProjectsLibraryScreenState extends State<ProjectsLibraryScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final libraryProvider = Provider.of<LibraryProvider>(context);
    final projectProvider = Provider.of<ProjectProvider>(context, listen: false);

    final filteredProjects = libraryProvider.projects.where((project) {
      final matchesName = project.name.toLowerCase().contains(_searchQuery);
      final matchesDesc = project.description.toLowerCase().contains(_searchQuery);
      final matchesTags = project.tags.any((tag) => tag.toLowerCase().contains(_searchQuery));
      return matchesName || matchesDesc || matchesTags;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Projects Library'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                labelText: 'Search projects (name, description, tags)',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                        },
                      )
                    : null,
                border: const OutlineInputBorder(),
              ),
            ),
          ),
          Expanded(
            child: filteredProjects.isEmpty
                ? const Center(child: Text('No projects found.'))
                : ListView.builder(
                    itemCount: filteredProjects.length,
                    itemBuilder: (context, index) {
                      final project = filteredProjects[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: ListTile(
                          title: Text(project.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (project.description.isNotEmpty)
                                Text(project.description, maxLines: 2, overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 4),
                              Wrap(
                                spacing: 4,
                                children: project.tags.map((tag) => ActionChip(
                                  label: Text(tag, style: const TextStyle(fontSize: 10)),
                                  padding: EdgeInsets.zero,
                                  visualDensity: VisualDensity.compact,
                                  onPressed: () {
                                    _searchController.text = tag;
                                  },
                                )).toList(),
                              ),
                              Text(
                                'Last modified: ${project.lastModified.toString().split('.')[0]}',
                                style: const TextStyle(fontSize: 10, color: Colors.grey),
                              ),
                            ],
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit),
                                tooltip: 'Load Project',
                                onPressed: () {
                                  showDialog(
                                    context: context,
                                    builder: (context) => AlertDialog(
                                      title: const Text('Load Project?'),
                                      content: const Text('Current workspace will be replaced. Make sure to save changes first.'),
                                      actions: [
                                        TextButton(
                                          onPressed: () => Navigator.pop(context),
                                          child: const Text('Cancel'),
                                        ),
                                        TextButton(
                                          onPressed: () {
                                            projectProvider.importFromJson(project.jsonContent);
                                            Navigator.pop(context); // Close dialog
                                            Navigator.pop(context); // Close library screen
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(content: Text('Loaded project: ${project.name}')),
                                            );
                                          },
                                          child: const Text('Load'),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, color: Colors.red),
                                tooltip: 'Delete Project',
                                onPressed: () {
                                  showDialog(
                                    context: context,
                                    builder: (context) => AlertDialog(
                                      title: const Text('Delete Project?'),
                                      content: Text('Are you sure you want to delete "${project.name}"?'),
                                      actions: [
                                        TextButton(
                                          onPressed: () => Navigator.pop(context),
                                          child: const Text('Cancel'),
                                        ),
                                        TextButton(
                                          onPressed: () {
                                            libraryProvider.deleteProject(project.id);
                                            Navigator.pop(context);
                                          },
                                          child: const Text('Delete', style: TextStyle(color: Colors.red)),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}


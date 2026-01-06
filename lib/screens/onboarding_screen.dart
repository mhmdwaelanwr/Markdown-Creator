import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/project_provider.dart';
import '../utils/templates.dart';
import '../models/readme_element.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _step = 0;
  String? _goal; // 'project' or 'profile'

  // Project fields
  final _projectNameController = TextEditingController();
  final _projectDescController = TextEditingController();

  // Profile fields
  final _usernameController = TextEditingController();
  final _roleController = TextEditingController();

  @override
  void dispose() {
    _projectNameController.dispose();
    _projectDescController.dispose();
    _usernameController.dispose();
    _roleController.dispose();
    super.dispose();
  }

  void _finish() {
    final provider = Provider.of<ProjectProvider>(context, listen: false);
    provider.clearElements();

    if (_goal == 'project') {
      // Use "Full Project" or "Minimal" as base, but customized
      final template = Templates.all.firstWhere((t) => t.name == 'Full Project');

      // Deep copy elements to avoid modifying the template itself
      // Since we don't have a deep copy method, we'll just use the template logic but replace placeholders
      // Actually, let's just use the template and then update variables

      provider.loadTemplate(template);

      // Update variables
      provider.updateVariable('PROJECT_NAME', _projectNameController.text.isNotEmpty ? _projectNameController.text : 'My Project');

      // If description is provided, try to find the description paragraph and update it
      if (_projectDescController.text.isNotEmpty) {
        // This is a bit hacky, but effective for onboarding
        for (var element in provider.elements) {
          if (element is ParagraphElement && element.text.contains('A complete solution for')) {
            element.text = _projectDescController.text;
            break;
          }
        }
      }

    } else {
      // Profile
      final template = Templates.all.firstWhere((t) => t.name == 'Developer Profile');
      provider.loadTemplate(template);

      final username = _usernameController.text.isNotEmpty ? _usernameController.text : 'username';
      provider.updateVariable('GITHUB_USERNAME', username);

      if (_roleController.text.isNotEmpty) {
         for (var element in provider.elements) {
          if (element is ParagraphElement && element.text.contains('passionate developer')) {
            element.text = 'I\'m a ${_roleController.text} from ...';
            break;
          }
        }
      }
    }

    Navigator.of(context).pop(); // Close onboarding
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 600,
        height: 500,
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Text(
              'Welcome to Readme Creator! 🚀',
              style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Let\'s get you set up in seconds.',
              style: GoogleFonts.inter(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 32),
            Expanded(
              child: _step == 0 ? _buildStep1() : _buildStep2(),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (_step > 0)
                  TextButton(
                    onPressed: () => setState(() => _step--),
                    child: const Text('Back'),
                  )
                else
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Skip'),
                  ),
                ElevatedButton(
                  onPressed: () {
                    if (_step == 0) {
                      if (_goal != null) setState(() => _step++);
                    } else {
                      _finish();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  ),
                  child: Text(_step == 0 ? 'Next' : 'Finish'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep1() {
    return SingleChildScrollView(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('What are you building today?', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w500)),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildOptionCard(
                icon: Icons.folder_special,
                title: 'Project README',
                description: 'Documentation for your software, library, or app.',
                value: 'project',
              ),
              const SizedBox(width: 24),
              _buildOptionCard(
                icon: Icons.person,
                title: 'GitHub Profile',
                description: 'A personal profile to showcase your skills and stats.',
                value: 'profile',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOptionCard({required IconData icon, required String title, required String description, required String value}) {
    final isSelected = _goal == value;
    return InkWell(
      onTap: () => setState(() => _goal = value),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 220,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isSelected ? Theme.of(context).colorScheme.primaryContainer : Theme.of(context).cardColor,
          border: Border.all(
            color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey.withAlpha(50),
            width: 2,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, size: 48, color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey),
            const SizedBox(height: 16),
            Text(title, style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Text(
              description,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep2() {
    return SingleChildScrollView(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (_goal == 'project') ...[
            Text('Tell us about your project', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w500)),
            const SizedBox(height: 24),
            TextField(
              controller: _projectNameController,
              decoration: const InputDecoration(
                labelText: 'Project Name',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.title),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _projectDescController,
              decoration: const InputDecoration(
                labelText: 'Short Description',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.description),
              ),
              maxLines: 2,
            ),
          ] else ...[
            Text('Tell us about yourself', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w500)),
            const SizedBox(height: 24),
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(
                labelText: 'GitHub Username',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _roleController,
              decoration: const InputDecoration(
                labelText: 'Role / Title (e.g. Full Stack Developer)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.work),
              ),
            ),
          ],
        ],
      ),
    );
  }
}


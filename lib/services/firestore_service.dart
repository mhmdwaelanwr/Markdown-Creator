import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/saved_project.dart';
import '../models/snippet.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Collection Reference - Scoped to the current user's UID
  CollectionReference get _projectsRef => _db.collection('users').doc(_auth.currentUser?.uid).collection('projects');
  CollectionReference get _snippetsRef => _db.collection('users').doc(_auth.currentUser?.uid).collection('snippets');

  // --- Projects Logic ---

  Future<void> saveProject(SavedProject project) async {
    if (_auth.currentUser == null) return;
    await _projectsRef.doc(project.id).set(project.toJson());
  }

  Stream<List<SavedProject>> getProjects() {
    if (_auth.currentUser == null) return Stream.value([]);
    return _projectsRef.orderBy('lastModified', descending: true).snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => SavedProject.fromJson(doc.data() as Map<String, dynamic>)).toList();
    });
  }

  Future<void> deleteProject(String id) async {
    if (_auth.currentUser == null) return;
    await _projectsRef.doc(id).delete();
  }

  // --- Snippets Logic ---

  Future<void> saveSnippet(Snippet snippet) async {
    if (_auth.currentUser == null) return;
    await _snippetsRef.doc(snippet.id).set(snippet.toJson());
  }

  Stream<List<Snippet>> getSnippets() {
    if (_auth.currentUser == null) return Stream.value([]);
    return _snippetsRef.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => Snippet.fromJson(doc.data() as Map<String, dynamic>)).toList();
    });
  }

  Future<void> deleteSnippet(String id) async {
    if (_auth.currentUser == null) return;
    await _snippetsRef.doc(id).delete();
  }
}

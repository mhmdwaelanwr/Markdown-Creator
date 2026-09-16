import { getAuth, getFirestore, firestoreFieldValue } from '../platform/firebase';

class FirestoreService {
  // --- App Configuration (Admin) ---
  getAppConfig(callback) {
    return getFirestore()
      .collection('settings')
      .doc('app_config')
      .onSnapshot(documentSnapshot => {
        callback(documentSnapshot.data() || {});
      });
  }

  async updateAppConfig(data) {
    await getFirestore()
      .collection('settings')
      .doc('app_config')
      .set(data, { merge: true });
  }

  // --- User Management ---
  async updateUserStatus(uid, updates) {
    await getFirestore().collection('users').doc(uid).update(updates);
  }

  // --- Templates ---
  getPublicTemplates(callback) {
    return getFirestore()
      .collection('public_templates')
      .onSnapshot(querySnapshot => {
        const templates = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(templates);
      });
  }

  async savePublicTemplate(name, description, elements, category = 'General') {
    await getFirestore().collection('public_templates').add({
      name,
      description,
      elements,
      category,
      createdAt: firestoreFieldValue.serverTimestamp(),
    });
  }

  async deleteTemplate(id) {
    await getFirestore().collection('public_templates').doc(id).delete();
  }

  // --- Personal Collections ---
  async saveProject(project) {
    const user = getAuth().currentUser;
    if (!user) return;
    await getFirestore()
      .collection('users')
      .doc(user.uid)
      .collection('projects')
      .doc(project.id)
      .set(project);
  }

  getProjects(callback) {
    const user = getAuth().currentUser;
    if (!user) return () => {};
    return getFirestore()
      .collection('users')
      .doc(user.uid)
      .collection('projects')
      .orderBy('lastModified', 'desc')
      .onSnapshot(querySnapshot => {
        const projects = querySnapshot.docs.map(doc => doc.data());
        callback(projects);
      });
  }
}

export default new FirestoreService();

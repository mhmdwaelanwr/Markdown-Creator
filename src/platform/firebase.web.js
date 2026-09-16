import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebaseConfig from '../config/firebaseConfig.web';

const noop = () => {};
const hasConfig = Boolean(firebaseConfig?.apiKey && firebaseConfig?.projectId);
const missingConfigMessage = 'Firebase web config is missing. Update src/config/firebaseConfig.web.js.';

const unsupported = (feature) => async () => {
  throw new Error(`${feature} is unavailable. ${missingConfigMessage}`);
};

const warnWrite = (action) => async () => {
  console.warn(`${action} is unavailable. ${missingConfigMessage}`);
};

const createDocSnapshot = (data = {}) => ({ data: () => data });
const createQuerySnapshot = (docs = []) => ({ docs });

const createStubAuth = () => ({
  currentUser: null,
  onAuthStateChanged: (callback) => {
    if (typeof callback === 'function') callback(null);
    return noop;
  },
  signInWithCredential: unsupported('Firebase Auth signInWithCredential'),
  signInWithEmailAndPassword: unsupported('Firebase Auth signInWithEmailAndPassword'),
  createUserWithEmailAndPassword: unsupported('Firebase Auth createUserWithEmailAndPassword'),
  signOut: async () => {},
});

const createStubFirestore = () => {
  const onSnapshotEmpty = (callback, type) => {
    if (typeof callback === 'function') {
      callback(type === 'doc' ? createDocSnapshot({}) : createQuerySnapshot([]));
    }
    return noop;
  };

  const docRef = () => ({
    onSnapshot: (callback) => onSnapshotEmpty(callback, 'doc'),
    set: warnWrite('Firestore set'),
    update: warnWrite('Firestore update'),
    delete: warnWrite('Firestore delete'),
  });

  const queryRef = () => ({
    onSnapshot: (callback) => onSnapshotEmpty(callback, 'query'),
  });

  const collectionRef = () => ({
    doc: () => docRef(),
    add: warnWrite('Firestore add'),
    onSnapshot: (callback) => onSnapshotEmpty(callback, 'query'),
    orderBy: () => queryRef(),
  });

  return {
    collection: () => collectionRef(),
  };
};

const stubAuth = createStubAuth();
const stubFirestore = createStubFirestore();

const ensureApp = () => {
  if (!hasConfig) return null;
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  return firebase.app();
};

const getAuth = () => {
  const app = ensureApp();
  if (!app) return stubAuth;
  return firebase.auth(app);
};

const getFirestore = () => {
  const app = ensureApp();
  if (!app) return stubFirestore;
  return firebase.firestore(app);
};

const webAuth = {
  signInWithGoogle: async () => {
    if (!hasConfig) throw new Error(missingConfigMessage);
    const auth = getAuth();
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      return await auth.signInWithPopup(provider);
    } catch (error) {
      if (
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        console.warn('Popup blocked, switching to redirect sign-in.');
        await auth.signInWithRedirect(provider);
        return null;
      }
      throw error;
    }
  },
  signInWithApple: async () => {
    if (!hasConfig) throw new Error(missingConfigMessage);
    const auth = getAuth();
    const provider = new firebase.auth.OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    try {
      return await auth.signInWithPopup(provider);
    } catch (error) {
      if (
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        console.warn('Popup blocked, switching to redirect sign-in.');
        await auth.signInWithRedirect(provider);
        return null;
      }
      throw error;
    }
  },
};

const authProviders = {
  googleCredential: () => {
    throw new Error('Use webAuth.signInWithGoogle on web.');
  },
  appleCredential: () => {
    throw new Error('Use webAuth.signInWithApple on web.');
  },
};

const firestoreFieldValue = hasConfig
  ? firebase.firestore.FieldValue
  : { serverTimestamp: () => null };

export const isWeb = true;
export { getAuth, getFirestore, authProviders, firestoreFieldValue, webAuth };

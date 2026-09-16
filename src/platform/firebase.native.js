import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const getAuth = () => auth();
const getFirestore = () => firestore();

const authProviders = {
  googleCredential: (idToken) => auth.GoogleAuthProvider.credential(idToken),
  appleCredential: (identityToken, nonce) => auth.AppleAuthProvider.credential(identityToken, nonce),
};

const firestoreFieldValue = firestore.FieldValue;

const webAuth = {
  signInWithGoogle: async () => {
    throw new Error('Web Google Sign-In is not available on native.');
  },
  signInWithApple: async () => {
    throw new Error('Web Apple Sign-In is not available on native.');
  },
};

export const isWeb = false;
export { getAuth, getFirestore, authProviders, firestoreFieldValue, webAuth };

import { getAuth, authProviders, isWeb, webAuth } from '../platform/firebase';
import { GoogleSignin, appleAuth } from '../platform/signin';

class AuthService {
  static adminEmail = "mhmdwaelanwr@gmail.com";

  constructor() {
    if (!isWeb) {
      GoogleSignin.configure({
        webClientId: '', // Requires configuration
      });
    }
  }

  get currentUser() {
    return getAuth().currentUser;
  }

  get isAdmin() {
    return this.currentUser?.email === AuthService.adminEmail;
  }

  onAuthStateChanged(callback) {
    return getAuth().onAuthStateChanged(callback);
  }

  async signInWithGoogle() {
    try {
      if (isWeb) {
        return await webAuth.signInWithGoogle();
      }
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = authProviders.googleCredential(idToken);
      return getAuth().signInWithCredential(googleCredential);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return null;
    }
  }

  async signInWithApple() {
    try {
      if (isWeb) {
        return await webAuth.signInWithApple();
      }
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = authProviders.appleCredential(identityToken, nonce);
      return getAuth().signInWithCredential(appleCredential);
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      return null;
    }
  }

  async signInWithEmail(email, password) {
    return getAuth().signInWithEmailAndPassword(email, password);
  }

  async signUpWithEmail(email, password) {
    return getAuth().createUserWithEmailAndPassword(email, password);
  }

  async signOut() {
    try {
      if (!isWeb && (await GoogleSignin.isSignedIn())) await GoogleSignin.signOut();
      await getAuth().signOut();
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  }
}

export default new AuthService();

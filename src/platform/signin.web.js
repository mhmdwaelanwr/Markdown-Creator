const unsupported = (feature) => async () => {
  throw new Error(`${feature} is not supported on web.`);
};

const GoogleSignin = {
  configure: () => {},
  signIn: unsupported('Google Sign-In'),
  isSignedIn: async () => false,
  signOut: async () => {},
};

const appleAuth = {
  performRequest: unsupported('Apple Sign-In'),
  Operation: { LOGIN: 'LOGIN' },
  Scope: { EMAIL: 'EMAIL', FULL_NAME: 'FULL_NAME' },
};

export { GoogleSignin, appleAuth };
export const isWeb = true;

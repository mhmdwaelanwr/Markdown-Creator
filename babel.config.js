module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  overrides: [
    {
      test: /\.(ts|tsx)$/,
      presets: [['@babel/preset-typescript', { isTSX: true, allExtensions: true }]],
    },
  ],
  plugins: ['react-native-reanimated/plugin'],
};

module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-?|react-native|@react-native|@react-navigation|@react-native-community|lucide-react-native|nativewind|clsx|tailwind-merge|@react-native-async-storage|react-native-css-interop)/)',
  ],
};

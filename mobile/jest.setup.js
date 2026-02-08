/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');

    // The mock for `call` immediately calls the callback which is incorrect
    // So we override it with a no-op
    Reanimated.default.call = () => { };

    return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => {
    return {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
    };
}, { virtual: true });

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('nativewind', () => ({
    styled: (Component) => Component,
    verifyInstallation: jest.fn(),
}));

jest.mock('react-native-css-interop', () => ({
    cssInterop: jest.fn(),
    remapProps: jest.fn(),
}));

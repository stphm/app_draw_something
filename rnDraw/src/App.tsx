import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AuthProvider} from './context/AuthContext';
import Routes from './navigation/Routes';

export default function (): JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

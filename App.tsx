import React from 'react';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/AppNavigator.tsx';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppNavigator />
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

export default App;

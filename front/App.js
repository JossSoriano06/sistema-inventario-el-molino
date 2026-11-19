import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

import {
  configurarNotificaciones,
} from './src/services/notificacionesService';

export default function App() {

  useEffect(() => {
    configurarNotificaciones();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

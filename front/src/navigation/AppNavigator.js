import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import TabsPrincipal from './TabsPrincipal';
import Login from '../screens/auth/Login';
import NuevoProducto from '../screens/productos/NuevoProducto';
import EditarProducto from '../screens/productos/EditarProducto';
import RegistrarMovimiento from '../screens/inventario/RegistrarMovimiento';
import HistorialInventario from '../screens/inventario/HistorialInventario';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { sesion, cargando } = useAuth();

  // Mientras se revisa si hay una sesión guardada
  if (cargando) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FDF6F0',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#8B4A2B" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {sesion ? (
        // Con sesión iniciada
        <>
          <Stack.Screen name="Principal" component={TabsPrincipal} />
          <Stack.Screen name="EditarProducto" component={EditarProducto} />
          <Stack.Screen name="NuevoProducto" component={NuevoProducto} />
          <Stack.Screen
            name="RegistrarMovimiento"
            component={RegistrarMovimiento}
          />
          <Stack.Screen
            name="HistorialInventario"
            component={HistorialInventario}
          />
        </>
      ) : (
        // Sin sesión: solo se puede ver el login
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

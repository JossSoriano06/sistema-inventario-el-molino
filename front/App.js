import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './login';
import Productos from './Productos';
import NuevoProducto from './NuevoProducto';
import EditarProducto from './EditarProducto';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <NavigationContainer>

      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >

        <Stack.Screen
          name="Login"
          component={Login}
        />

        <Stack.Screen
          name="Productos"
          component={Productos}
        />

        <Stack.Screen
          name="EditarProducto"
          component={EditarProducto}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="NuevoProducto"
          component={NuevoProducto}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}
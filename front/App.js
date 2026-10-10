import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Login from './login';
import Productos from './Productos';
import NuevoProducto from './NuevoProducto';
import EditarProducto from './EditarProducto';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Pantallas provisionales para los módulos que desarrollaremos después
function PantallaProvisional({ titulo, icono }) {
  return (
    <View style={styles.provisional}>
      <MaterialCommunityIcons
        name={icono}
        size={58}
        color="#8B4A2B"
      />

      <Text style={styles.tituloProvisional}>{titulo}</Text>

      <Text style={styles.descripcion}>
        Este módulo estará disponible próximamente.
      </Text>
    </View>
  );
}

// Footer con las opciones principales
function NavegacionPrincipal() {
  return (
    <Tab.Navigator
      initialRouteName="Productos"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8B4A2B',
        tabBarInactiveTintColor: '#A99B90',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 66,
          paddingTop: 7,
          paddingBottom: 7,
          borderTopColor: '#EADDD2',
          borderTopWidth: 1,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              size={size}
              color={color}
            />
          ),
        }}
      >
        {() => (
          <PantallaProvisional
            titulo="Inicio"
            icono="view-dashboard-outline"
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Productos"
        component={Productos}
        options={{
          tabBarLabel: 'Productos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Inventario"
        options={{
          tabBarLabel: 'Inventario',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={size}
              color={color}
            />
          ),
        }}
      >
        {() => (
          <PantallaProvisional
            titulo="Inventario"
            icono="clipboard-list-outline"
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Ventas"
        options={{
          tabBarLabel: 'Ventas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      >
        {() => (
          <PantallaProvisional
            titulo="Ventas"
            icono="cart-outline"
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

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
          name="Principal"
          component={NavegacionPrincipal}
        />

        <Stack.Screen
          name="EditarProducto"
          component={EditarProducto}
        />

        <Stack.Screen
          name="NuevoProducto"
          component={NuevoProducto}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  provisional: {
    flex: 1,
    backgroundColor: '#FDF6F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  tituloProvisional: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#8B4A2B',
    marginTop: 16,
  },
  descripcion: {
    color: '#89796D',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
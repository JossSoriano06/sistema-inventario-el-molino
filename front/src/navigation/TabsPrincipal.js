import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import PantallaProvisional from '../components/PantallaProvisional';
import Productos from '../screens/productos/Productos';
import Inventario from '../screens/inventario/Inventario';

const Tab = createBottomTabNavigator();

// Footer con las opciones principales
export default function TabsPrincipal() {
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
        component={Inventario}
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
      />

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

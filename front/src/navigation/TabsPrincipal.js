
import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

import Dashboard from '../screens/dashboard/Dashboard';
import Productos from '../screens/productos/Productos';
import Inventario from '../screens/inventario/Inventario';
import Ventas from '../screens/ventas/Ventas';

const Tab = createBottomTabNavigator();

export default function TabsPrincipal() {
  const { sesion } = useAuth();

  const esAdministrador = sesion?.rol === 'ADMIN';

  return (
    <Tab.Navigator
      initialRouteName={esAdministrador ? 'Inicio' : 'Productos'}
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

      {/* Dashboard exclusivo del administrador */}
      {esAdministrador && (
        <Tab.Screen
          name="Inicio"
          component={Dashboard}
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
        />
      )}

      {/* Productos */}
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

      {/* Inventario */}
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

      {/* Ventas */}
      <Tab.Screen
        name="Ventas"
        component={Ventas}
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
      />

    </Tab.Navigator>
  );
}

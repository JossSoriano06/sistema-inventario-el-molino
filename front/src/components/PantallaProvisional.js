import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Pantalla provisional para los módulos que se desarrollarán después
export default function PantallaProvisional({ titulo, icono }) {
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

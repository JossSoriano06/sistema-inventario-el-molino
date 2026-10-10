
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { registrarProducto } from './service/productoService';

export default function NuevoProducto({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [imagen, setImagen] = useState(null);
  const [guardando, setGuardando] = useState(false);

  async function seleccionarImagen() {
    const permiso =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert(
        'Permiso necesario',
        'Permite acceder a la galería para elegir una fotografía.'
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0].uri);
    }
  }

  async function guardarProducto() {
    const precioNumero = Number(precio);
    const stockNumero = Number(stock);

    if (!nombre.trim() || !categoria.trim() ||
        precio.trim() === '' || stock.trim() === '') {
      Alert.alert('Campos obligatorios', 'Completa todos los campos.');
      return;
    }

    if (!Number.isFinite(precioNumero) || precioNumero <= 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio mayor que cero.');
      return;
    }

    if (!Number.isInteger(stockNumero) || stockNumero < 0) {
      Alert.alert('Stock inválido', 'Ingresa una cantidad entera igual o mayor que cero.');
      return;
    }

    try {
      setGuardando(true);

      await registrarProducto({
        nombre: nombre.trim(),
        categoria: categoria.trim(),
        precio: precioNumero,
        stock: stockNumero,
        imagenUrl: null,
      });

      Alert.alert(
        'Producto registrado',
        'El producto se guardó correctamente en la base de datos.',
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo guardar el producto. Verifica que el backend esté funcionando.'
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.botonVolver}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.titulo}>Nuevo producto</Text>
      </View>

      <Text style={styles.descripcion}>
        Registra un producto para la Pastelería El Molino.
      </Text>

      <TouchableOpacity
        style={styles.selectorImagen}
        onPress={seleccionarImagen}
      >
        {imagen ? (
          <Image source={{ uri: imagen }} style={styles.foto} />
        ) : (
          <>
            <Ionicons name="camera-outline" size={42} color="#8B4A2B" />
            <Text style={styles.textoImagen}>Seleccionar fotografía</Text>
            <Text style={styles.subtextoImagen}>
              Elige una imagen de tu galería
            </Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.etiqueta}>Nombre del producto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Torta de Chocolate"
        placeholderTextColor="#A8886D"
        value={nombre}
        onChangeText={setNombre}
        maxLength={100}
      />

      <Text style={styles.etiqueta}>Categoría</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Tortas"
        placeholderTextColor="#A8886D"
        value={categoria}
        onChangeText={setCategoria}
        maxLength={60}
      />

      <Text style={styles.etiqueta}>Precio (S/)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 35.00"
        placeholderTextColor="#A8886D"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="decimal-pad"
      />

      <Text style={styles.etiqueta}>Stock inicial</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 10"
        placeholderTextColor="#A8886D"
        value={stock}
        onChangeText={setStock}
        keyboardType="number-pad"
      />

      <TouchableOpacity
        style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
        onPress={guardarProducto}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.textoGuardar}>Guardar producto</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6F0',
  },
  contenido: {
    paddingBottom: 30,
  },
  header: {
    minHeight: 65,
    backgroundColor: '#8B4A2B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  botonVolver: {
    padding: 8,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  descripcion: {
    color: '#6F5A4A',
    fontSize: 14,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 14,
  },
  selectorImagen: {
    height: 170,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DCC4B0',
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: '#F7E9DE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  foto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textoImagen: {
    color: '#8B4A2B',
    fontWeight: 'bold',
    marginTop: 8,
  },
  subtextoImagen: {
    color: '#8B7564',
    fontSize: 12,
    marginTop: 4,
  },
  etiqueta: {
    color: '#4F3424',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAD9C9',
    borderRadius: 11,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: '#4F3424',
  },
  botonGuardar: {
    backgroundColor: '#8B4A2B',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  textoGuardar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

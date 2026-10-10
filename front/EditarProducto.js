
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { actualizarProducto } from './service/productoService';

export default function EditarProducto({ navigation, route }) {
  const producto = route.params?.producto;

  const [nombre, setNombre] = useState(producto?.nombre ?? '');
  const [categoria, setCategoria] = useState(producto?.categoria ?? '');
  const [precio, setPrecio] = useState(
    producto?.precio != null ? String(producto.precio) : ''
  );
  const [stock, setStock] = useState(
    producto?.stock != null ? String(producto.stock) : ''
  );
  const [guardando, setGuardando] = useState(false);

  async function guardarCambios() {
    const precioNumero = Number(precio);
    const stockNumero = Number(stock);

    if (!nombre.trim() || !categoria.trim() ||
        precio.trim() === '' || stock.trim() === '') {
      Alert.alert('Campos obligatorios', 'Completa todos los campos.');
      return;
    }

    if (!Number.isFinite(precioNumero) || precioNumero <= 0) {
      Alert.alert('Precio inválido', 'El precio debe ser mayor que cero.');
      return;
    }

    if (!Number.isInteger(stockNumero) || stockNumero < 0) {
      Alert.alert('Stock inválido', 'El stock debe ser un entero igual o mayor que cero.');
      return;
    }

    try {
      setGuardando(true);

      await actualizarProducto(producto.id, {
        nombre: nombre.trim(),
        categoria: categoria.trim(),
        precio: precioNumero,
        stock: stockNumero,
        imagenUrl: producto.imagenUrl ?? null,
      });

      Alert.alert(
        'Cambios guardados',
        'El producto se actualizó correctamente.',
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo actualizar el producto. Verifica la conexión con el backend.'
      );
    } finally {
      setGuardando(false);
    }
  }

  if (!producto) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No se recibió el producto que deseas editar.</Text>
        <TouchableOpacity
          style={styles.boton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.textoBoton}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
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
          style={styles.volver}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titulo}>Editar producto</Text>
      </View>

      <Text style={styles.descripcion}>
        Modifica los datos del producto seleccionado.
      </Text>

      <Text style={styles.etiqueta}>Nombre del producto</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre del producto"
        maxLength={100}
      />

      <Text style={styles.etiqueta}>Categoría</Text>
      <TextInput
        style={styles.input}
        value={categoria}
        onChangeText={setCategoria}
        placeholder="Categoría"
        maxLength={60}
      />

      <Text style={styles.etiqueta}>Precio (S/)</Text>
      <TextInput
        style={styles.input}
        value={precio}
        onChangeText={setPrecio}
        keyboardType="decimal-pad"
        placeholder="Ej. 35.00"
      />

      <Text style={styles.etiqueta}>Stock</Text>
      <TextInput
        style={styles.input}
        value={stock}
        onChangeText={setStock}
        keyboardType="number-pad"
        placeholder="Cantidad disponible"
      />

      <TouchableOpacity
        style={[styles.boton, guardando && styles.deshabilitado]}
        onPress={guardarCambios}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.textoBoton}>Guardar cambios</Text>
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
  volver: {
    padding: 8,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  descripcion: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 18,
    color: '#6F5A4A',
  },
  etiqueta: {
    color: '#4F3424',
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
    marginBottom: 17,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: '#4F3424',
  },
  boton: {
    backgroundColor: '#8B4A2B',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deshabilitado: {
    opacity: 0.7,
  },
  error: {
    margin: 20,
    color: '#B42318',
  },
});

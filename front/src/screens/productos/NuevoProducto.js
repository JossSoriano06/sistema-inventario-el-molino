
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

import {
  registrarProducto,
  subirImagenProducto,
} from '../../services/productoService';

export default function NuevoProducto({ navigation }) {

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');

  const [imagen, setImagen] = useState(null);

  const [guardando, setGuardando] = useState(false);

  // =====================================================
  // SELECCIONAR IMAGEN DESDE LA GALERÍA
  // =====================================================

  async function seleccionarImagen() {

    try {

      const permiso =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          'Permiso necesario',
          'Debes permitir el acceso a la galería.'
        );
        return;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,

        });

      if (!resultado.canceled && resultado.assets?.length > 0) {
        setImagen(resultado.assets[0].uri);
      }

    } catch (error) {

      Alert.alert(
        'Error',
        'No se pudo abrir la galería.'
      );

      console.error(error);
    }
  }

  // =====================================================
  // TOMAR FOTOGRAFÍA CON LA CÁMARA
  // =====================================================

  async function tomarFotografia() {

    try {

      const permiso =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          'Permiso necesario',
          'Debes permitir el acceso a la cámara.'
        );
        return;
      }

      const resultado =
        await ImagePicker.launchCameraAsync({

          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,

        });

      if (!resultado.canceled && resultado.assets?.length > 0) {
        setImagen(resultado.assets[0].uri);
      }

    } catch (error) {

      Alert.alert(
        'Error',
        'No se pudo abrir la cámara.'
      );

      console.error(error);
    }
  }

  // =====================================================
  // MOSTRAR OPCIONES DE IMAGEN
  // =====================================================

  function mostrarOpcionesImagen() {

    Alert.alert(
      'Fotografía del producto',
      'Selecciona de dónde deseas obtener la imagen.',
      [
        {
          text: 'Tomar fotografía',
          onPress: tomarFotografia,
        },
        {
          text: 'Elegir de galería',
          onPress: seleccionarImagen,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  }

  // =====================================================
  // VALIDAR CAMPOS
  // =====================================================

  function validarFormulario() {

    const precioNumero = Number(precio);
    const stockNumero = Number(stock);

    if (
      !nombre.trim() ||
      !categoria.trim() ||
      precio.trim() === '' ||
      stock.trim() === ''
    ) {

      Alert.alert(
        'Campos obligatorios',
        'Completa todos los campos.'
      );

      return false;
    }

    if (!Number.isFinite(precioNumero) || precioNumero <= 0) {

      Alert.alert(
        'Precio inválido',
        'Ingresa un precio mayor que cero.'
      );

      return false;
    }

    if (!Number.isInteger(stockNumero) || stockNumero < 0) {

      Alert.alert(
        'Stock inválido',
        'Ingresa una cantidad entera igual o mayor que cero.'
      );

      return false;
    }

    return true;
  }

  // =====================================================
  // GUARDAR PRODUCTO E IMAGEN
  // =====================================================

  async function guardarProducto() {

    if (!validarFormulario()) {
      return;
    }

    try {

      setGuardando(true);

      // Primero registramos el producto
      const productoCreado = await registrarProducto({

        nombre: nombre.trim(),
        categoria: categoria.trim(),
        precio: Number(precio),
        stock: Number(stock),
        imagenUrl: null,

      });

      // Después subimos la fotografía utilizando su ID
      if (imagen) {

        await subirImagenProducto(
          productoCreado.id,
          imagen
        );

      }

      Alert.alert(
        'Producto registrado',
        imagen
          ? 'El producto y su fotografía se guardaron correctamente.'
          : 'El producto se registró correctamente.',
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {

      console.error('Error al registrar producto:', error);

      Alert.alert(
        'Error al guardar',
        error.message ||
          'No se pudo registrar el producto.'
      );

    } finally {

      setGuardando(false);

    }
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >

      {/* ENCABEZADO */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.botonVolver}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.titulo}>
          Nuevo producto
        </Text>

      </View>

      <Text style={styles.descripcion}>
        Registra un producto para la Pastelería El Molino.
      </Text>

      {/* FOTOGRAFÍA */}

      <Text style={styles.etiqueta}>
        Fotografía del producto
      </Text>

      <TouchableOpacity
        style={styles.selectorImagen}
        onPress={mostrarOpcionesImagen}
        activeOpacity={0.8}
      >

        {imagen ? (

          <Image
            source={{ uri: imagen }}
            style={styles.foto}
          />

        ) : (

          <>

            <Ionicons
              name="camera-outline"
              size={45}
              color="#8B4A2B"
            />

            <Text style={styles.textoImagen}>
              Agregar fotografía
            </Text>

            <Text style={styles.subtextoImagen}>
              Cámara o galería
            </Text>

          </>

        )}

      </TouchableOpacity>

      {imagen && (

        <TouchableOpacity
          style={styles.botonCambiarImagen}
          onPress={mostrarOpcionesImagen}
        >

          <Ionicons
            name="camera-reverse-outline"
            size={18}
            color="#8B4A2B"
          />

          <Text style={styles.textoCambiarImagen}>
            Cambiar fotografía
          </Text>

        </TouchableOpacity>

      )}

      {/* NOMBRE */}

      <Text style={styles.etiqueta}>
        Nombre del producto
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. Torta de Chocolate"
        placeholderTextColor="#A8886D"
        value={nombre}
        onChangeText={setNombre}
        maxLength={100}
      />

      {/* CATEGORÍA */}

      <Text style={styles.etiqueta}>
        Categoría
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. Tortas"
        placeholderTextColor="#A8886D"
        value={categoria}
        onChangeText={setCategoria}
        maxLength={60}
      />

      {/* PRECIO */}

      <Text style={styles.etiqueta}>
        Precio (S/)
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. 35.00"
        placeholderTextColor="#A8886D"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="decimal-pad"
      />

      {/* STOCK */}

      <Text style={styles.etiqueta}>
        Stock inicial
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. 10"
        placeholderTextColor="#A8886D"
        value={stock}
        onChangeText={setStock}
        keyboardType="number-pad"
      />

      {/* GUARDAR */}

      <TouchableOpacity
        style={[
          styles.botonGuardar,
          guardando && styles.botonDeshabilitado,
        ]}
        onPress={guardarProducto}
        disabled={guardando}
      >

        {guardando ? (

          <ActivityIndicator color="#FFFFFF" />

        ) : (

          <>
            <Ionicons
              name="save-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.textoGuardar}>
              Guardar producto
            </Text>
          </>

        )}

      </TouchableOpacity>

    </ScrollView>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FDF6F0',
  },

  contenido: {
    paddingBottom: 35,
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
    marginBottom: 18,
  },

  etiqueta: {
    color: '#4F3424',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 7,
  },

  selectorImagen: {
    height: 190,
    marginHorizontal: 20,
    marginBottom: 12,
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

  botonCambiarImagen: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginBottom: 20,
  },

  textoCambiarImagen: {
    color: '#8B4A2B',
    fontWeight: '600',
    fontSize: 13,
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
    fontSize: 14,
    color: '#4F3424',
  },

  botonGuardar: {
    backgroundColor: '#8B4A2B',
    marginHorizontal: 20,
    marginTop: 10,
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

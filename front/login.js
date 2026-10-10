import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Login({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [recordarme, setRecordarme] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="cupcake" size={50} color="#8B4A2B" />
        </View>
        <Text style={styles.titulo}>Pastelería</Text>
        <Text style={styles.tituloBold}>El Molino</Text>
      </View>

      <Text style={styles.bienvenida}>Bienvenido de nuevo</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#8B5E3C" style={styles.icon} />
        <TextInput
          placeholder="Usuario"
          placeholderTextColor="#A8886D"
          style={styles.input}
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#8B5E3C" style={styles.icon} />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#A8886D"
          style={styles.input}
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry={!mostrarPass}
        />
        <TouchableOpacity onPress={() => setMostrarPass(!mostrarPass)}>
          <Ionicons
            name={mostrarPass ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#8B5E3C"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.recordarmeContainer}
        onPress={() => setRecordarme(!recordarme)}
      >
        <Ionicons
          name={recordarme ? 'checkbox' : 'square-outline'}
          size={20}
          color="#8B5E3C"
        />
        <Text style={styles.recordarmeTexto}>Recordarme</Text>
      </TouchableOpacity>

      <TouchableOpacity
      style={styles.boton}
      onPress={() => navigation.navigate('Productos')}
      >
      <Text style={styles.botonTexto}>
        Iniciar sesión
      </Text>
    </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6F0',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    marginBottom: 8,
  },
  titulo: {
    fontSize: 16,
    color: '#5C3A21',
  },
  tituloBold: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5C3A21',
  },
  bienvenida: {
    fontSize: 16,
    color: '#5C3A21',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAD9C9',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#5C3A21',
  },
  recordarmeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordarmeTexto: {
    marginLeft: 8,
    color: '#5C3A21',
  },
  boton: {
    backgroundColor: '#8B4A2B',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#8B5E3C',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

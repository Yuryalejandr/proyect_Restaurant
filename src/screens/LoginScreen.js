import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://TU_IP_LOCAL:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.user.rol === 'admin') {
          navigation.navigate('AdminReservas', { user: data.user });
        } else {
          navigation.navigate('MisReservas', { user: data.user });
        }
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (e) {
      Alert.alert('Modo Offline', 'Inicia sesión localmente o revisa tu conexión.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurante - Módulo Login</Text>
      <TextInput placeholder="Correo" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Contraseña" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
      <Button title="Ingresar" onPress={handleLogin} />
      <Button title="Ir a Registro" color="#666" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 12 }
});
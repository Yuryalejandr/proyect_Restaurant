import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_URL } from '../api/config';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!correo.trim() || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu correo y contraseña.');
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo.trim(), password }),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        Alert.alert('Servidor sin actualizar', `El backend respondió HTTP ${response.status} sin datos válidos. Reinícialo desde la carpeta backend.`);
        return;
      }

      if (!response.ok) {
        Alert.alert('No pudimos ingresar', data.mensaje || data.error || 'Verifica tus credenciales.');
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: data.user.rol === 'admin' ? 'AdminReservas' : 'Inicio', params: { user: data.user, token: data.token } }],
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Sin conexión', `No se pudo conectar con el servidor en ${API_URL}. Comprueba que el teléfono esté en la misma red Wi-Fi y que el firewall permita el puerto 3000.`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.brand}><Text style={styles.kicker}>RESTAURANTE</Text><Text style={styles.logo}>Lúmina</Text><Text style={styles.tagline}>Cocina que se recuerda.</Text></View>
      <View style={styles.form}>
        <Text style={styles.title}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>Ingresa para reservar tu próxima experiencia.</Text>
        <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
        <TextInput style={styles.input} placeholder="nombre@correo.com" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" value={correo} onChangeText={setCorreo} />
        <Text style={styles.label}>CONTRASEÑA</Text>
        <TextInput style={styles.input} placeholder="Tu contraseña" placeholderTextColor={colors.muted} secureTextEntry value={password} onChangeText={setPassword} />
        <Pressable style={[styles.button, cargando && styles.buttonDisabled]} disabled={cargando} onPress={handleLogin}><Text style={styles.buttonText}>{cargando ? 'Ingresando…' : 'Ingresar'}</Text><Text style={styles.arrow}>→</Text></Pressable>
      </View>
      <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Register')}><Text style={styles.linkText}>¿Primera vez en Lúmina? <Text style={styles.linkStrong}>Crea tu cuenta</Text></Text></Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  brand: { marginBottom: 38 },
  kicker: { color: colors.caramelLight, letterSpacing: 3, fontSize: 10, fontWeight: '800' },
  logo: { color: colors.cream, fontSize: 43, fontWeight: '800', marginTop: 4, letterSpacing: -1 },
  tagline: { color: colors.muted, fontSize: 14, marginTop: 2 },
  form: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 20 },
  title: { color: colors.cream, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 25 },
  label: { color: colors.caramelLight, fontSize: 10, letterSpacing: 1.3, fontWeight: '800', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: colors.background, borderColor: colors.line, borderWidth: 1, borderRadius: 11, color: colors.cream, minHeight: 52, paddingHorizontal: 14, fontSize: 14 },
  button: { backgroundColor: colors.caramel, borderRadius: 12, minHeight: 53, paddingHorizontal: 17, marginTop: 26, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: colors.black, fontSize: 15, fontWeight: '800' },
  arrow: { color: colors.black, fontSize: 22, fontWeight: '800' },
  linkButton: { alignItems: 'center', paddingTop: 24 },
  linkText: { color: colors.muted, fontSize: 13 },
  linkStrong: { color: colors.caramelLight, fontWeight: '800' },
});

import React, { useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_URL } from '../api/config';
import { colors } from '../theme';

export default function ProfileScreen({ route, navigation }) {
  const { user, token } = route.params;
  const [nombre, setNombre] = useState(user.nombre || '');
  const [email, setEmail] = useState(user.email || '');
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!nombre.trim() || !email.trim()) {
      Alert.alert('Faltan datos', 'Completa tu nombre y correo.');
      return;
    }
    setGuardando(true);
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'No se pudo guardar el perfil.');
      Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.', [
        { text: 'Continuar', onPress: () => navigation.navigate(user.rol === 'admin' ? 'AdminReservas' : 'Inicio', { user: data, token }) },
      ]);
    } catch (error) {
      Alert.alert('No se pudo guardar', error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(nombre || 'U').charAt(0).toUpperCase()}</Text></View>
        <Text style={styles.title}>Tu perfil</Text>
        <Text style={styles.subtitle}>{user.rol === 'admin' ? 'Cuenta de administración' : 'Cuenta de cliente'}</Text>
        <View style={styles.role}><Text style={styles.roleLabel}>ROL</Text><Text style={styles.roleValue}>{user.rol === 'admin' ? 'ADMINISTRADOR' : 'CLIENTE'}</Text></View>
        <Text style={styles.label}>NOMBRE COMPLETO</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Tu nombre" placeholderTextColor={colors.muted} />
        <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="nombre@correo.com" placeholderTextColor={colors.muted} />
        <Pressable style={[styles.button, guardando && styles.disabled]} disabled={guardando} onPress={guardar}><Text style={styles.buttonText}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Text><Text style={styles.arrow}>→</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, container: { padding: 24 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.caramel, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, avatarText: { color: colors.black, fontSize: 34, fontWeight: '800' },
  title: { color: colors.cream, fontSize: 30, fontWeight: '800' }, subtitle: { color: colors.muted, marginTop: 5, marginBottom: 25 },
  role: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 }, roleLabel: { color: colors.muted, fontSize: 9, letterSpacing: 1, fontWeight: '800' }, roleValue: { color: colors.caramelLight, fontWeight: '800', marginTop: 5 },
  label: { color: colors.caramelLight, fontSize: 10, letterSpacing: 1.2, fontWeight: '800', marginTop: 14, marginBottom: 8 }, input: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 11, color: colors.cream, minHeight: 52, paddingHorizontal: 14 },
  button: { backgroundColor: colors.caramel, borderRadius: 12, minHeight: 53, paddingHorizontal: 17, marginTop: 27, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, disabled: { opacity: 0.55 }, buttonText: { color: colors.black, fontWeight: '800', fontSize: 15 }, arrow: { color: colors.black, fontSize: 22, fontWeight: '800' },
});

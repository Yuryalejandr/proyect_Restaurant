import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { guardarReservaLocal } from '../database/sqlite';
import { sincronizarConBackend } from '../api/sync';

export default function AgendarReservaScreen({ route, navigation }) {
  const { user } = route.params;
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [personas, setPersonas] = useState('2');

  const handleAgendar = async () => {
    const nuevaReserva = {
      id: Date.now().toString(),
      usuario_id: user.id,
      fecha,
      hora,
      personas: parseInt(personas),
      estado: 'pendiente'
    };

    // 1. Guardar localmente en SQLite
    guardarReservaLocal(nuevaReserva);

    // 2. Intentar Sincronizar si hay red
    const sincronizado = await sincronizarConBackend();

    Alert.alert(
      'Reserva Almacenada',
      sincronizado 
        ? 'Reserva agendada y sincronizada en el servidor.' 
        : 'Reserva guardada offline en SQLite. Se sincronizará automáticamente cuando tengas internet.'
    );

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendar Mesa en Restaurante</Text>
      <TextInput placeholder="Fecha (YYYY-MM-DD)" style={styles.input} value={fecha} onChangeText={setFecha} />
      <TextInput placeholder="Hora (HH:MM)" style={styles.input} value={hora} onChangeText={setHora} />
      <TextInput placeholder="Número de Personas" keyboardType="numeric" style={styles.input} value={personas} onChangeText={setPersonas} />
      <Button title="Confirmar Reserva" onPress={handleAgendar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 12 }
});
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { obtenerTodasReservasLocales, guardarReservaLocal } from '../database/sqlite';
import { sincronizarConBackend } from '../api/sync';

export default function AdminReservasScreen() {
  const [reservas, setReservas] = useState([]);

  const cargarReservas = () => {
    setReservas(obtenerTodasReservasLocales());
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const cambiarEstado = async (reserva, nuevoEstado) => {
    const actualizada = { ...reserva, estado: nuevoEstado };
    guardarReservaLocal(actualizada);
    await sincronizarConBackend();
    cargarReservas();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Citas (Administrador)</Text>
      <FlatList
        data={reservas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Mesa ID: {item.id} | Pers: {item.personas}</Text>
            <Text>Fecha: {item.fecha} - {item.hora}</Text>
            <Text>Estado actual: {item.estado}</Text>
            <View style={styles.actions}>
              <Button title="Confirmar" color="green" onPress={() => cambiarEstado(item, 'confirmada')} />
              <Button title="Cancelar" color="red" onPress={() => cambiarEstado(item, 'cancelada')} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: { padding: 15, borderWidth: 1, borderColor: '#ccc', marginBottom: 10, borderRadius: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }
});
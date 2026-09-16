import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { obtenerTodasReservasLocales, guardarReservaLocal } from '../database/sqlite';
import { sincronizarConBackend } from '../api/sync';

export default function MisReservasScreen({ route, navigation }) {
  const { user } = route.params;
  const [reservas, setReservas] = useState([]);

  const cargarReservas = () => {
    const locales = obtenerTodasReservasLocales();
    setReservas(locales.filter(r => r.usuario_id === user.id));
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const cancelarReserva = async (reserva) => {
    const actualizada = { ...reserva, estado: 'cancelada' };
    guardarReservaLocal(actualizada);
    await sincronizarConBackend();
    cargarReservas();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Reservas (Cliente)</Text>
      <Button title="+ Agendar Nueva Mesa" onPress={() => navigation.navigate('AgendarReserva', { user })} />
      
      <FlatList
        data={reservas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Fecha: {item.fecha} | Hora: {item.hora}</Text>
            <Text>Personas: {item.personas}</Text>
            <Text>Estado: {item.estado}</Text>
            {item.estado !== 'cancelada' && (
              <Button title="Cancelar Cita" color="red" onPress={() => cancelarReserva(item)} />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: { padding: 15, borderWidth: 1, borderColor: '#ddd', marginBottom: 10, borderRadius: 8 }
});
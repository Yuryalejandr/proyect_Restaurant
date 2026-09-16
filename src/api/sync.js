import NetInfo from '@react-native-community/netinfo';
import { obtenerReservasPendientesSync, marcarComoSincronizados } from '../database/sqlite';

const API_URL = 'http://TU_IP_LOCAL:3000/api'; // Reemplazar por tu IP local (Ej: http://192.168.1.5:3000/api)

export const sincronizarConBackend = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return false;

  const pendientes = obtenerReservasPendientesSync();
  if (pendientes.length === 0) return true;

  try {
    const response = await fetch(`${API_URL}/reservas/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservas: pendientes }),
    });

    if (response.ok) {
      marcarComoSincronizados();
      console.log('Sincronizado con éxito');
      return true;
    }
  } catch (error) {
    console.log('Error al sincronizar:', error);
  }
  return false;
};
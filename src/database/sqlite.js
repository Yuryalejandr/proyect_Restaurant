import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('restaurante_local.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS reservas_local (
      id TEXT PRIMARY KEY,
      usuario_id INTEGER,
      fecha TEXT,
      hora TEXT,
      personas INTEGER,
      estado TEXT,
      sincronizado INTEGER
    );
  `);
};

export const guardarReservaLocal = (reserva) => {
  db.runSync(
    `INSERT OR REPLACE INTO reservas_local (id, usuario_id, fecha, hora, personas, estado, sincronizado) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [reserva.id, reserva.usuario_id, reserva.fecha, reserva.hora, reserva.personas, reserva.estado, 0]
  );
};

export const obtenerReservasPendientesSync = () => {
  return db.getAllSync(`SELECT * FROM reservas_local WHERE sincronizado = 0`);
};

export const marcarComoSincronizados = () => {
  db.runSync(`UPDATE reservas_local SET sincronizado = 1`);
};

export const obtenerTodasReservasLocales = () => {
  return db.getAllSync(`SELECT * FROM reservas_local`);
};
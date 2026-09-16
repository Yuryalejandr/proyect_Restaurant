import * as SQLite from 'expo-sqlite';

let db;

export const initDB = () => {
  try {
    db = SQLite.openDatabase('restaurante_local.db');
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS reservas_local (
          id TEXT PRIMARY KEY,
          usuario_id INTEGER,
          fecha TEXT,
          hora TEXT,
          personas INTEGER,
          estado TEXT,
          sincronizado INTEGER
        );`
      );
    });
  } catch (error) {
    console.log('Error al inicializar SQLite:', error);
  }
};

export const guardarReservaLocal = (reserva) => {
  if (!db) db = SQLite.openDatabase('restaurante_local.db');
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT OR REPLACE INTO reservas_local (id, usuario_id, fecha, hora, personas, estado, sincronizado) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [reserva.id, reserva.usuario_id, reserva.fecha, reserva.hora, reserva.personas, reserva.estado, 0]
    );
  });
};

export const obtenerReservasPendientesSync = () => {
  return new Promise((resolve) => {
    if (!db) db = SQLite.openDatabase('restaurante_local.db');
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM reservas_local WHERE sincronizado = 0;`,
        [],
        (_, { rows }) => resolve(rows._array || [])
      );
    });
  });
};

export const marcarComoSincronizados = () => {
  if (!db) db = SQLite.openDatabase('restaurante_local.db');
  db.transaction((tx) => {
    tx.executeSql(`UPDATE reservas_local SET sincronizado = 1;`);
  });
};

export const obtenerTodasReservasLocales = () => {
  return new Promise((resolve) => {
    if (!db) db = SQLite.openDatabase('restaurante_local.db');
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM reservas_local;`,
        [],
        (_, { rows }) => resolve(rows._array || [])
      );
    });
  });
};
import * as SQLite from 'expo-sqlite';

let databasePromise;

const getDatabase = async () => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('restaurante_local.db');
  }

  const db = await databasePromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reservas_local (
      id TEXT PRIMARY KEY NOT NULL,
      usuario_id INTEGER,
      fecha TEXT,
      hora TEXT,
      personas INTEGER,
      estado TEXT,
      sincronizado INTEGER DEFAULT 0,
      plato TEXT,
      nota TEXT,
      foto_uri TEXT
    );
  `);

  // Compatibilidad con la base local creada por versiones anteriores.
  for (const column of ['plato TEXT', 'nota TEXT', 'foto_uri TEXT']) {
    try {
      await db.execAsync(`ALTER TABLE reservas_local ADD COLUMN ${column};`);
    } catch {
      // La columna ya existe.
    }
  }

  return db;
};

export const initDB = async () => {
  try {
    await getDatabase();
  } catch (error) {
    console.error('Error al inicializar SQLite:', error);
  }
};

export const guardarReservaLocal = async (reserva) => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO reservas_local
      (id, usuario_id, fecha, hora, personas, estado, sincronizado, plato, nota, foto_uri)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    reserva.id,
    reserva.usuario_id,
    reserva.fecha,
    reserva.hora,
    reserva.personas,
    reserva.estado,
    0,
    reserva.plato || '',
    reserva.nota || '',
    reserva.fotoUri || reserva.foto_uri || ''
  );
};

export const obtenerReservasPendientesSync = async () => {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM reservas_local WHERE sincronizado = 0;');
};

export const marcarComoSincronizados = async () => {
  const db = await getDatabase();
  await db.runAsync('UPDATE reservas_local SET sincronizado = 1;');
};

export const obtenerTodasReservasLocales = async () => {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM reservas_local ORDER BY fecha ASC, hora ASC;');
};

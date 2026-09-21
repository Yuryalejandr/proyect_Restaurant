const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database(path.resolve(__dirname, 'restaurante.db'), (err) => {
  if (err) console.error('Error al conectar a la BD:', err.message);
  else console.log('Conectado a la base de datos SQLite remota/servidor.');
});

db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    email TEXT UNIQUE,
    password TEXT,
    rol TEXT DEFAULT 'cliente'
  )`);

  
  db.run(`CREATE TABLE IF NOT EXISTS reservas (
    id TEXT PRIMARY KEY,
    usuario_id INTEGER,
    fecha TEXT,
    hora TEXT,
    personas INTEGER,
    estado TEXT DEFAULT 'pendiente',
    sincronizado INTEGER DEFAULT 1,
    plato TEXT,
    nota TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    detalle TEXT DEFAULT '',
    precio INTEGER NOT NULL DEFAULT 0,
    imagen TEXT DEFAULT '',
    disponible INTEGER NOT NULL DEFAULT 1
  )`);

  db.get('SELECT COUNT(*) AS total FROM menu_items', (err, row) => {
    if (!err && row.total === 0) {
      const items = [
        ['Corte al carbón', 'plato', 'Puré rústico · chimichurri', 48000, 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80'],
        ['Pasta de la casa', 'plato', 'Pomodoro asado · albahaca', 35000, 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80'],
        ['Salmón de temporada', 'plato', 'Vegetales al carbón · mantequilla cítrica', 52000, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80'],
        ['Risotto de hongos', 'plato', 'Parmesano · aceite de trufa', 42000, 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80'],
        ['Pollo de la casa', 'plato', 'Papas doradas · salsa de hierbas', 39000, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80'],
        ['Vino tinto reserva', 'vino', 'Copa · Malbec argentino', 18000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80'],
        ['Vino blanco sauvignon', 'vino', 'Copa · notas cítricas', 16000, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80'],
        ['Cacao & avellana', 'postre', 'Postre de autor · vainilla', 22000, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80'],
        ['Cheesecake de frutos rojos', 'postre', 'Coulis de frutos rojos · crema fresca', 24000, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80'],
      ];
      const statement = db.prepare('INSERT INTO menu_items (nombre, categoria, detalle, precio, imagen) VALUES (?, ?, ?, ?, ?)');
      items.forEach((item) => statement.run(item));
      statement.finalize();
    }
  });

  const nuevosProductos = [
    ['Risotto de hongos', 'plato', 'Parmesano · aceite de trufa', 42000, 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80'],
    ['Pollo de la casa', 'plato', 'Papas doradas · salsa de hierbas', 39000, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80'],
    ['Vino blanco sauvignon', 'vino', 'Copa · notas cítricas', 16000, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80'],
    ['Cheesecake de frutos rojos', 'postre', 'Coulis de frutos rojos · crema fresca', 24000, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80'],
  ];
  nuevosProductos.forEach((item) => {
    db.run('INSERT INTO menu_items (nombre, categoria, detalle, precio, imagen) SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE nombre = ?)', [...item, item[0]]);
  });

  db.get("SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1", (err, row) => {
    if (!err && !row) {
      const email = process.env.ADMIN_EMAIL || 'admin@lumina.local';
      const password = process.env.ADMIN_PASSWORD || 'Admin1234!';
      db.run('INSERT OR IGNORE INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)', [
        'Administrador Lúmina', email, bcrypt.hashSync(password, 8), 'admin',
      ]);
      console.log(`Admin inicial disponible: ${email}`);
    }
  });

  // Migración no destructiva para instalaciones creadas antes de la carta.
  for (const column of ['plato TEXT', 'nota TEXT']) {
    db.run(`ALTER TABLE reservas ADD COLUMN ${column}`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error(`No se pudo agregar ${column}:`, err.message);
      }
    });
  }
});

module.exports = db;

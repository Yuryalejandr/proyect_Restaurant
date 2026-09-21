const db = require('../config/db');

exports.listar = (req, res) => {
  const params = [];
  let query = 'SELECT * FROM menu_items';
  if (req.query.categoria) {
    query += ' WHERE categoria = ?';
    params.push(req.query.categoria);
  }
  query += ' ORDER BY categoria, nombre';
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ mensaje: err.message });
    res.json(rows);
  });
};

exports.crear = (req, res) => {
  const { nombre, categoria, detalle = '', precio, imagen = '' } = req.body;
  const precioNumero = Number(precio);
  if (!nombre?.trim() || !['plato', 'vino', 'postre'].includes(categoria) || !Number.isInteger(precioNumero) || precioNumero < 0) {
    return res.status(400).json({ mensaje: 'Nombre, categoría y precio válido son obligatorios.' });
  }

  db.run(
    'INSERT INTO menu_items (nombre, categoria, detalle, precio, imagen) VALUES (?, ?, ?, ?, ?)',
    [nombre.trim(), categoria, detalle.trim(), precioNumero, imagen.trim()],
    function (err) {
      if (err) return res.status(500).json({ mensaje: err.message });
      db.get('SELECT * FROM menu_items WHERE id = ?', [this.lastID], (selectError, item) => {
        if (selectError) return res.status(500).json({ mensaje: selectError.message });
        res.status(201).json(item);
      });
    }
  );
};

exports.actualizar = (req, res) => {
  const { nombre, categoria, detalle = '', precio, imagen = '', disponible = 1 } = req.body;
  const precioNumero = Number(precio);
  if (!nombre?.trim() || !['plato', 'vino', 'postre'].includes(categoria) || !Number.isInteger(precioNumero) || precioNumero < 0) {
    return res.status(400).json({ mensaje: 'Datos de carta no válidos.' });
  }
  db.run(
    'UPDATE menu_items SET nombre = ?, categoria = ?, detalle = ?, precio = ?, imagen = ?, disponible = ? WHERE id = ?',
    [nombre.trim(), categoria, detalle.trim(), precioNumero, imagen.trim(), disponible ? 1 : 0, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ mensaje: err.message });
      if (!this.changes) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
      res.json({ mensaje: 'Producto actualizado.' });
    }
  );
};

exports.eliminar = (req, res) => {
  db.run('DELETE FROM menu_items WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ mensaje: err.message });
    if (!this.changes) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    res.json({ mensaje: 'Producto eliminado.' });
  });
};
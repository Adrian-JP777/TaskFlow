const pool = require('../config/db');

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user.id) !== String(id) && req.user.role !== 'admin') return res.status(403).json({ error: 'No puedes consultar este perfil' });
    const result = await pool.query(
      `SELECT id, name, email, role, avatar_url, bio, phone, created_at, updated_at 
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user.id) !== String(id) && req.user.role !== 'admin') return res.status(403).json({ error: 'No puedes modificar este perfil' });
    const { name, bio, phone, avatar_url } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio),
           phone = COALESCE($3, phone),
           avatar_url = COALESCE($4, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, email, role, avatar_url, bio, phone, updated_at`,
      [name, bio, phone, avatar_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, avatar_url FROM users ORDER BY name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
};

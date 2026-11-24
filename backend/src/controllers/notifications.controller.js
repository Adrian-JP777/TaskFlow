const pool = require('../config/db');

const listMine = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, body, link, read, created_at
       FROM notifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 30`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al listar notificaciones' });
  }
};

const unreadCount = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read = FALSE`,
      [req.user.id]
    );
    res.json({ count: rows[0].count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al contar notificaciones' });
  }
};

const markRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al marcar como leída' });
  }
};

const markAllRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE`,
      [req.user.id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al marcar todas' });
  }
};

module.exports = { listMine, unreadCount, markRead, markAllRead };
const pool = require('../config/db');

const listByIssue = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.action, a.meta, a.created_at, u.name AS user_name
       FROM activity_log a
       LEFT JOIN users u ON u.id = a.user_id
       WHERE a.issue_id = $1
       ORDER BY a.created_at DESC
       LIMIT 50`,
      [req.params.issueId]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al cargar actividad' });
  }
};

module.exports = { listByIssue };
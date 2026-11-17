const pool = require('../config/db');

const createRecommendation = async (req, res) => {
  const { issueId } = req.params;
  const { content, type } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'El contenido es obligatorio' });
  if (!['recommendation', 'request'].includes(type)) return res.status(400).json({ error: 'Tipo de comentario no válido' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO comments (issue_id, user_id, content, type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, issue_id, user_id, content, type, created_at`,
      [issueId, req.user.id, content.trim(), type]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al crear el comentario' });
  }
};

const getRecommendationsByIssue = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.issue_id, c.user_id, c.content, c.type, c.created_at,
              u.name AS user_name, u.avatar_url,
              COALESCE(AVG(cr.rating), 0)::numeric(3,2) AS avg_rating,
              COUNT(cr.id)::integer AS total_ratings
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN comment_ratings cr ON c.id = cr.comment_id
       WHERE c.issue_id = $1
       GROUP BY c.id, u.name, u.avatar_url
       ORDER BY c.created_at DESC`,
      [req.params.issueId]
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener comentarios' });
  }
};

const rateRecommendation = async (req, res) => {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'La valoración debe ser de 1 a 5' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO comment_ratings (comment_id, user_id, rating)
       SELECT c.id, $2, $3 FROM comments c WHERE c.id = $1 AND c.issue_id = $4
       ON CONFLICT (comment_id, user_id) DO UPDATE SET rating = EXCLUDED.rating
       RETURNING *`,
      [req.params.id, req.user.id, rating, req.params.issueId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Comentario no encontrado' });
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al valorar el comentario' });
  }
};

module.exports = { createRecommendation, getRecommendationsByIssue, rateRecommendation };

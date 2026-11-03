const pool = require('../config/db');

// Obtener todos los issues de un proyecto
const getIssuesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      `SELECT i.*, 
              u1.name as assignee_name, 
              u2.name as reporter_name
       FROM issues i
       LEFT JOIN users u1 ON i.assignee_id = u1.id
       LEFT JOIN users u2 ON i.reporter_id = u2.id
       WHERE i.project_id = $1
       ORDER BY i.created_at DESC`,
      [projectId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener issues' });
  }
};

// Crear issue
const createIssue = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assignee_id, reporter_id } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    const result = await pool.query(
      `INSERT INTO issues (project_id, title, description, status, priority, assignee_id, reporter_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        projectId,
        title,
        description || null,
        status || 'todo',
        priority || 'medium',
        assignee_id || null,
        reporter_id || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el issue' });
  }
};

// Actualizar issue
const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignee_id } = req.body;

    const result = await pool.query(
      `UPDATE issues
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           assignee_id = COALESCE($5, assignee_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, status, priority, assignee_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el issue' });
  }
};

// Eliminar issue
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM issues WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue no encontrado' });
    }

    res.json({ message: 'Issue eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el issue' });
  }
};

module.exports = {
  getIssuesByProject,
  createIssue,
  updateIssue,
  deleteIssue,
};
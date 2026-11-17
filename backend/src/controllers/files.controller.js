const pool = require('../config/db');
const path = require('path');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }

    const { issueId } = req.params;

    const result = await pool.query(
      `INSERT INTO files (issue_id, uploaded_by, original_name, file_name, file_path, mime_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        issueId,
        req.user.id,
        req.file.originalname,
        req.file.filename,
        req.file.path,
        req.file.mimetype,
        req.file.size,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
};

const getFilesByIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const result = await pool.query(
      `SELECT f.*, u.name as uploader_name 
       FROM files f
       LEFT JOIN users u ON f.uploaded_by = u.id
       WHERE f.issue_id = $1
       ORDER BY f.created_at DESC`,
      [issueId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener archivos' });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM files WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const file = result.rows[0];
    res.download(file.file_path, file.original_name);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al descargar el archivo' });
  }
};

module.exports = {
  uploadFile,
  getFilesByIssue,
  downloadFile,
};

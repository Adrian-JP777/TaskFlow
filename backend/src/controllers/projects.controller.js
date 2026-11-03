const pool = require("../config/db");

// Obtener todos los proyectos
const getAllProjects = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT p.*, u.name as owner_name FROM projects p LEFT JOIN users u ON p.owner_id = u.id ORDER BY p.created_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener proyectos" });
  }
};

// Obtener un proyecto por ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT p.*, u.name as owner_name FROM projects p LEFT JOIN users u ON p.owner_id = u.id WHERE p.id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el proyecto" });
  }
};

// Crear proyecto
const createProject = async (req, res) => {
  try {
    const { name, description, owner_id, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const result = await pool.query(
      `INSERT INTO projects (name, description, owner_id, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description || null, owner_id || null, status || "active"],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el proyecto" });
  }
};

// Actualizar proyecto
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status)
       WHERE id = $4
       RETURNING *`,
      [name, description, status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el proyecto" });
  }
};

// Eliminar proyecto
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    res.json({ message: "Proyecto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el proyecto" });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

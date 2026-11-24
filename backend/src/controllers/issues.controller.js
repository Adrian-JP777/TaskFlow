const pool = require("../config/db");
const { logActivity, notifyUser } = require("../utils/activity");

const getIssuesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rows } = await pool.query(
      `SELECT i.*, u.name AS assignee_name
       FROM issues i
       LEFT JOIN users u ON u.id = i.assignee_id
       WHERE i.project_id = $1
       ORDER BY i.created_at DESC`,
      [projectId],
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener issues" });
  }
};

const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT i.*, u.name AS assignee_name
       FROM issues i
       LEFT JOIN users u ON u.id = i.assignee_id
       WHERE i.id = $1`,
      [id],
    );
    if (!rows[0]) return res.status(404).json({ error: "Issue no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el issue" });
  }
};

const createIssue = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      status,
      priority,
      assignee_id,
      due_date,
      tags,
    } = req.body;
    if (!title?.trim())
      return res.status(400).json({ error: "El título es obligatorio" });

    const { rows } = await pool.query(
      `INSERT INTO issues (project_id, title, description, status, priority, assignee_id, reporter_id, due_date, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        projectId,
        title.trim(),
        description || null,
        status || "todo",
        priority || "medium",
        assignee_id || null,
        req.user?.id || null,
        due_date || null,
        tags || [],
      ],
    );

    await logActivity({
      issueId: rows[0].id,
      projectId,
      userId: req.user?.id,
      action: "issue_created",
      meta: { title: rows[0].title },
    });

    if (assignee_id) {
      await notifyUser({
        userId: assignee_id,
        title: "Nuevo issue asignado",
        body: rows[0].title,
        link: `/projects/${projectId}/issues/${rows[0].id}`,
      });
    }

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el issue" });
  }
};

const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      assignee_id,
      due_date,
      tags,
    } = req.body;

    const prev = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
    if (!prev.rows[0])
      return res.status(404).json({ error: "Issue no encontrado" });

    const { rows } = await pool.query(
      `UPDATE issues SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         priority = COALESCE($4, priority),
         assignee_id = COALESCE($5, assignee_id),
         due_date = COALESCE($6, due_date),
         tags = COALESCE($7, tags),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, description, status, priority, assignee_id, due_date, tags, id],
    );

    const issue = rows[0];
    const old = prev.rows[0];

    if (status && status !== old.status) {
      await logActivity({
        issueId: id,
        projectId: issue.project_id,
        userId: req.user?.id,
        action: "status_changed",
        meta: { from: old.status, to: status },
      });
    }

    if (assignee_id && String(assignee_id) !== String(old.assignee_id || "")) {
      await logActivity({
        issueId: id,
        projectId: issue.project_id,
        userId: req.user?.id,
        action: "assignee_changed",
        meta: { assignee_id },
      });
      await notifyUser({
        userId: assignee_id,
        title: "Te asignaron un issue",
        body: issue.title,
        link: `/projects/${issue.project_id}/issues/${issue.id}`,
      });
    }

    res.json(issue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el issue" });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query("DELETE FROM issues WHERE id = $1", [
      id,
    ]);
    if (!rowCount)
      return res.status(404).json({ error: "Issue no encontrado" });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el issue" });
  }
};

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    const [mine, byStatus, recent, projects] = await Promise.all([
      pool.query(
        `SELECT i.*, p.name AS project_name
         FROM issues i
         JOIN projects p ON p.id = i.project_id
         WHERE i.assignee_id = $1 AND i.status != 'done'
         ORDER BY i.due_date NULLS LAST, i.created_at DESC
         LIMIT 10`,
        [userId],
      ),
      pool.query(
        `SELECT status, COUNT(*)::int AS count FROM issues GROUP BY status`,
      ),
      pool.query(
        `SELECT i.id, i.title, i.status, i.priority, i.updated_at, p.name AS project_name, p.id AS project_id
         FROM issues i
         JOIN projects p ON p.id = i.project_id
         ORDER BY i.updated_at DESC NULLS LAST, i.created_at DESC
         LIMIT 8`,
      ),
      pool.query(
        `SELECT id, name, status FROM projects ORDER BY created_at DESC LIMIT 6`,
      ),
    ]);

    res.json({
      myIssues: mine.rows,
      byStatus: byStatus.rows,
      recent: recent.rows,
      projects: projects.rows,
      isAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar dashboard" });
  }
};

module.exports = {
  getIssuesByProject,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getDashboard,
};

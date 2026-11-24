const pool = require('../config/db');

async function logActivity({ issueId, projectId, userId, action, meta = {} }) {
  try {
    await pool.query(
      `INSERT INTO activity_log (issue_id, project_id, user_id, action, meta)
       VALUES ($1, $2, $3, $4, $5)`,
      [issueId || null, projectId || null, userId || null, action, JSON.stringify(meta)]
    );
  } catch (e) {
    console.error('activity log error', e);
  }
}

async function notifyUser({ userId, title, body, link }) {
  if (!userId) return;
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, body, link) VALUES ($1, $2, $3, $4)`,
      [userId, title, body || null, link || null]
    );
  } catch (e) {
    console.error('notify error', e);
  }
}

module.exports = { logActivity, notifyUser };
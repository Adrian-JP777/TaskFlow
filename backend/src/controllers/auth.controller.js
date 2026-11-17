const crypto = require('crypto');
const pool = require('../config/db');
const { sign } = require('../middleware/auth');

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => new Promise((resolve, reject) => {
  crypto.scrypt(password, salt, 64, (error, derived) => {
    if (error) return reject(error);
    resolve(`${salt}:${derived.toString('hex')}`);
  });
});

const verifyPassword = async (password, stored) => {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const candidate = Buffer.from(await hashPassword(password, salt).then((value) => value.split(':')[1]), 'hex');
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
};

const issueSession = (user) => ({
  token: sign({ sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12 }),
  user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url },
});

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 10) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña (mínimo 10 caracteres) son obligatorios' });
  }
  try {
    const passwordHash = await hashPassword(password);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'user')
       RETURNING id, name, email, role, avatar_url`,
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );
    return res.status(201).json(issueSession(rows[0]));
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ese correo ya está registrado' });
    console.error(error);
    return res.status(500).json({ error: 'No se pudo crear la cuenta' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, avatar_url, password_hash FROM users WHERE lower(email) = lower($1)', [email.trim()]);
    if (!rows[0] || !(await verifyPassword(password, rows[0].password_hash))) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    return res.json(issueSession(rows[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
};

const me = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, avatar_url FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(401).json({ error: 'La cuenta ya no existe' });
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo consultar la sesión' });
  }
};

module.exports = { register, login, me };

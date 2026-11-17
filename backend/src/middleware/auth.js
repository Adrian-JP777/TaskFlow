const crypto = require('crypto');

const sign = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const input = `${header}.${body}`;
  return `${input}.${crypto.createHmac('sha256', secret).update(input).digest('base64url')}`;
};

const authenticate = (req, res, next) => {
  const token = req.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return res.status(401).json({ error: 'Inicia sesión para continuar' });
  try {
    const [header, body, signature] = token.split('.');
    const input = `${header}.${body}`;
    const expected = crypto.createHmac('sha256', process.env.JWT_SECRET).update(input).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) throw new Error('Firma inválida');
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp <= Math.floor(Date.now() / 1000)) throw new Error('Token expirado');
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o vencida' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'No tienes permisos para esta acción' });
  next();
};

module.exports = { sign, authenticate, requireRole };

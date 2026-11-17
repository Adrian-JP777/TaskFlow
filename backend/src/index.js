const express = require('express');
const cors = require('cors');
require('dotenv').config({ override: true });  // ← IMPORTANTE: override: true
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'NO EXISTE');

const projectsRoutes = require('./routes/projects.routes');
const issuesRoutes = require('./routes/issues.routes');
const usersRoutes = require('./routes/users.routes');
const filesRoutes = require('./routes/files.routes');
const recommendationsRoutes = require('./routes/recommendations.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.use('/api/projects', projectsRoutes);
app.use('/api/projects/:projectId/issues', issuesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/issues/:issueId/files', filesRoutes);
app.use('/api/issues/:issueId/recommendations', recommendationsRoutes);
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({
    message: '🚀 TaskFlow API funcionando correctamente',
    endpoints: {
      projects: '/api/projects',
      issues: '/api/projects/:projectId/issues',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const projectsRoutes = require('./routes/projects.routes');
const issuesRoutes = require('./routes/issues.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/projects', projectsRoutes);
app.use('/api/projects/:projectId/issues', issuesRoutes);

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
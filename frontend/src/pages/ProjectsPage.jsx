import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los proyectos. ¿Está corriendo el backend?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.post('/projects', {
        name,
        description,
        status: 'active',
      });
      setName('');
      setDescription('');
      fetchProjects(); // recargar lista
    } catch (err) {
      alert('Error al crear el proyecto');
      console.error(err);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Cargando proyectos...</p>;
  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>TaskFlow - Proyectos</h1>

      <form onSubmit={handleCreateProject} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Crear nuevo proyecto</h3>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Nombre del proyecto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            required
          />
          <textarea
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', height: '80px' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Crear Proyecto
        </button>
      </form>

      <h2>Lista de proyectos ({projects.length})</h2>
      
      {projects.length === 0 ? (
        <p>No hay proyectos todavía. ¡Crea el primero!</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.2rem',
                background: 'white',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0' }}>
                <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: '#1e40af' }}>
                  {project.name}
                </Link>
              </h3>
              <p style={{ margin: '0 0 0.5rem 0', color: '#555' }}>
                {project.description || 'Sin descripción'}
              </p>
              <small style={{ color: '#888' }}>
                Estado: <strong>{project.status}</strong> | 
                Creado: {new Date(project.created_at).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
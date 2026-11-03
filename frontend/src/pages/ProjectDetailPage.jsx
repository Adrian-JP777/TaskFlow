import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ProjectDetailPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    // Formulario de nuevo issue
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectRes, issuesRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/projects/${id}/issues`),
            ]);
            setProject(projectRes.data);
            setIssues(issuesRes.data);
        } catch (err) {
            console.error(err);
            alert('Error al cargar el proyecto');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateIssue = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            await api.post(`/projects/${id}/issues`, {
                title,
                description,
                priority,
                status: 'todo',
            });
            setTitle('');
            setDescription('');
            setPriority('medium');
            fetchData(); // recargar
        } catch (err) {
            alert('Error al crear el issue');
            console.error(err);
        }
    };

    if (loading) return <p style={{ padding: '2rem' }}>Cargando...</p>;
    if (!project) return <p style={{ padding: '2rem' }}>Proyecto no encontrado</p>;

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <Link to="/" style={{ color: '#2563eb' }}>← Volver a proyectos</Link>

            <h1 style={{ marginTop: '1rem' }}>{project.name}</h1>
            <p style={{ color: '#555' }}>{project.description || 'Sin descripción'}</p>
            <p>
                <strong>Estado:</strong> {project.status}
            </p>

            <hr style={{ margin: '2rem 0' }} />

            {/* Formulario nuevo issue */}
            <form onSubmit={handleCreateIssue} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                <h3>Crear nuevo Issue</h3>
                <input
                    type="text"
                    placeholder="Título del issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                    required
                />
                <textarea
                    placeholder="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', height: '70px', marginBottom: '0.5rem' }}
                />
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ padding: '0.5rem', marginBottom: '0.8rem' }}
                >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                </select>
                <br />
                <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Crear Issue
                </button>
            </form>

            {/* Lista de issues */}
            <h2>Issues ({issues.length})</h2>

            {issues.length === 0 ? (
                <p>No hay issues en este proyecto.</p>
            ) : (
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                    {issues.map((issue) => (
                        <div
                            key={issue.id}
                            style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '1rem',
                                background: 'white',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0 }}>{issue.title}</h4>
                                <span
                                    style={{
                                        fontSize: '0.8rem',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '999px',
                                        background:
                                            issue.priority === 'critical' ? '#fee2e2' :
                                                issue.priority === 'high' ? '#ffedd5' :
                                                    issue.priority === 'medium' ? '#fef9c3' : '#dcfce7',
                                    }}
                                >
                                    {issue.priority}
                                </span>
                            </div>
                            <p style={{ margin: '0.5rem 0', color: '#64748b' }}>
                                {issue.description || 'Sin descripción'}
                            </p>
                            <small style={{ color: '#94a3b8' }}>
                                Estado: <strong>{issue.status}</strong>
                            </small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProjectDetailPage;
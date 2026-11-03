# TaskFlow

Gestor de proyectos ágiles con seguimiento de issues.

## Tecnologías
- Node.js + Express
- PostgreSQL (pgAdmin)
- Git + GitHub

## Cómo levantar el proyecto

### 1. Base de datos
- Crear base de datos `taskflow` en pgAdmin
- Las tablas ya deben existir (users, projects, project_members, issues, comments)

### 2. Backend
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
npm install
npm run dev
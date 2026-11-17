# TaskFlow

Gestor de proyectos con trabajos, comentarios y adjuntos.

## Requisitos

- Node.js
- PostgreSQL con las tablas existentes `users`, `projects`, `issues` y `comments`

## Configuración y ejecución

1. En `backend`, copia `.env.example` a `.env`, configura la conexión a PostgreSQL y establece `JWT_SECRET` con una cadena aleatoria de 32 caracteres o más.
2. Desde la carpeta `backend`, ejecuta `npm install` y luego `npm run db:migrate`. La migración reutiliza `comments`, conserva `users.password_hash` si ya existe y crea las tablas auxiliares para valoraciones y archivos.
3. Inicia la API con `npm run dev` desde `backend`.
4. En otra terminal, ejecuta `npm install` y `npm run dev` desde `frontend`. Vite mostrará la dirección local.

El registro crea cuentas con rol `user`. Para habilitar una cuenta administradora, registra primero el correo y cambia su rol manualmente desde pgAdmin:

```sql
UPDATE users SET role = 'admin' WHERE lower(email) = lower('admin@tu-dominio.com');
```

Luego cierra sesión e inicia sesión de nuevo para recibir un token con el rol actualizado. La API guarda contraseñas nuevas con `scrypt` y los tokens duran 12 horas. Los comentarios, valoraciones, cargas de documentos y operaciones de administración requieren sesión y el servidor valida el rol.

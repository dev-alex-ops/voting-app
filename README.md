# Voting App 

Aplicación web full-stack que permite a los usuarios registrarse, iniciar sesión y votar entre dos equipos de fútbol: **Sevilla FC** y **Real Betis Balompié**. Cada usuario puede emitir **solo un voto**. Si cambia de equipo, el voto anterior se elimina y se registra el nuevo.



## Tecnologías utilizadas

### Frontend
- React
- Axios
- NGINX (servidor de archivos estáticos en producción)
- CSS puro

### Backend
- NestJS
- TypeScript
- JWT (autenticación)
- PostgreSQL

### Infraestructura
- Docker & Docker Compose (entorno local)




## Ejecución en local con Docker Compose

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/voting-app.git
cd voting-app
```

### 2. Crea la carpeta para persistencia de la base de datos
⚠️ Es importante para que PostgreSQL guarde los datos aunque reinicies los contenedores.

```bash
mkdir database
```
### 3. Crea un archivo .env en la raíz (opcional, si usas variables)
```env
POSTGRES_DB=votacion
POSTGRES_USER=user
POSTGRES_PASSWORD=password
```

### 4. Inicia los contenedores
```bash
docker compose -f docker-compose.yml up --build
```
La aplicación estará disponible en:
- 📍 Frontend: http://localhost:80
- 📍 Backend API: http://localhost:3000/api



## Autenticación y votos
Los usuarios deben registrarse o iniciar sesión para poder votar.

Cada usuario tiene un solo voto activo.

Si intenta votar al equipo contrario, el sistema reemplaza su voto anterior.

Se usa JWT para gestionar la autenticación.


##  Estructura de carpetas
```graphql
.
├── backend/            # NestJS API con módulos de auth, user, vote
├── frontend/           # React app + NGINX
├── database/           # Carpeta creada en local para persistencia de PostgreSQL
├── docker-compose.yml  # Entorno de prueba local
├── Dockerfile(s)       # Construcción de imágenes frontend y backend
├── README.md           # Este archivo
```

##  Créditos
Aplicación desarrollada como MVP educativo con fines demostrativos.

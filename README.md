# Voting App 🗳️⚽

Aplicación web full-stack que permite a los usuarios registrarse, iniciar sesión y votar entre dos equipos de fútbol: **Sevilla FC** y **Real Betis Balompié**.

Diseñada con fines educativos y de pruebas, esta app sirve como ejemplo para practicar despliegue en entornos locales y en clústeres Kubernetes usando herramientas modernas del ecosistema DevOps.

---

## 📚 Índice

1. [Tecnologías utilizadas](#tecnologías-utilizadas)
2. [Funcionamiento de la aplicación](#funcionamiento-de-la-aplicación)
3. [Estructura del repositorio](#estructura-del-repositorio)
4. [Ejecutar en local con Docker Compose](#ejecutar-en-local-con-docker-compose)
5. [Despliegue en Kubernetes (K3s)](#despliegue-en-kubernetes-k3s)
6. [Seguridad y gestión de secretos](#seguridad-y-gestión-de-secretos)
7. [Créditos](#créditos)

---

## 🛠️ Tecnologías utilizadas

### Frontend
- React
- Axios
- CSS puro
- NGINX (para servir archivos estáticos en producción)

### Backend
- NestJS + TypeScript
- PostgreSQL
- JWT (autenticación segura)
- TypeORM

### Infraestructura
- Docker & Docker Compose (entorno local)
- Helm (despliegue en clúster Kubernetes)
- Sealed Secrets (gestión segura de credenciales)

---

## ⚙️ Funcionamiento de la aplicación

- Los usuarios deben **registrarse o iniciar sesión** para poder votar.
- Cada usuario puede tener **solo un voto activo**.
- Si un usuario vota al equipo contrario, su voto anterior se **reemplaza automáticamente**.
- La autenticación se gestiona con **tokens JWT** almacenados en `localStorage`.

---

## 🗂️ Estructura del repositorio

```
.
├── backend/            # API NestJS con módulos de auth, user y vote
├── frontend/           # App React con NGINX en producción
├── database/           # Carpeta local para persistencia de PostgreSQL
├── helm/               # Charts Helm para PostgreSQL, backend y frontend
├── k8s/                # Archivos Kubernetes (ingress, secretos, etc.)
│   ├── ingress.yaml
│   ├── secrets/
│   └── sealed-secrets/
├── scripts/            # Scripts utilitarios
│   └── deploy.sh
├── docker-compose.yml  # Entorno local completo
├── .env.sample         # Variables de entorno de ejemplo
└── README.md
```

---

## 🧪 Ejecutar en local con Docker Compose

### 1. Clonar el repositorio

```bash
git clone https://github.com/dev-alex-ops/voting-app.git
cd voting-app
```

### 2. Crear la carpeta de persistencia

```bash
mkdir database
```

### 3. Crear un archivo `.env` (opcional)

```env
POSTGRES_DB=nombre_de_la_base_de_datos
POSTGRES_USER=usuario
POSTGRES_PASSWORD=password
```

### 4. Levantar los contenedores

```bash
docker compose -f docker-compose.yml up --build
```

La app estará disponible en:
- 🌍 Frontend: http://localhost
- 🔗 Backend API: http://localhost:3000/api

---

## ☸️ Despliegue en Kubernetes (K3s)

### ✅ Requisitos previos

| Herramienta        | Función                                                        |
|--------------------|----------------------------------------------------------------|
| Docker             | Construcción de imágenes                                       |
| docker buildx      | Soporte multiplataforma (ej. ARM64 para Raspberry Pi)          |
| kubectl            | Interacción con el clúster Kubernetes                          |
| helm               | Instalación de charts Helm                                     |
| kubeseal           | Cifrado de secretos para SealedSecrets                         |
| sealed-secrets     | Controlador instalado en el clúster (Bitnami)                  |
| Token GHCR         | Permisos `read:packages` y `write:packages` para GitHub        |

Instala `sealed-secrets` en el clúster:
```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.1/controller.yaml
```

---

### ⚙️ Pasos para el despliegue

1. **Crear los secrets en texto plano**

Ubicados en `./k8s/secrets/`, por ejemplo:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
  namespace: default
type: Opaque
stringData:
  DB_USER: postgres
  DB_PASS: postgres
  DB_NAME: votaciones
  DB_HOST: postgres
  DB_PORT: "5432"
```

> ⚠️ Estos archivos están ignorados por Git y **no deben subirse al repo**.

2. **Ejecutar el script de despliegue**

```bash
./scripts/deploy.sh
```

Este script:
- Pide token y credenciales del registry (GitHub).
- Construye imágenes (opcional).
- Cifra los secretos con `kubeseal`.
- Lanza los charts de Helm para `postgres`, `backend`, y `frontend`.
- Aplica el `Ingress`.

3. **Acceder a la app**

Edita tu `/etc/hosts` con la IP del nodo principal:

```
IP.DE.TU.NODO app.local
```

Luego abre en navegador:  
🌐 http://app.local

---

## 🔐 Seguridad y gestión de secretos

- Los secretos cifrados (`sealed-secrets`) son **seguros para subir al repositorio**.
- Los secretos en texto plano se mantienen en `k8s/secrets/`, fuera de control de versiones.
- Los tokens JWT están almacenados en `localStorage` del navegador.

---

## 👨‍💻 Créditos

Aplicación desarrollada como MVP educativo para prácticas DevOps, despliegue de contenedores y arquitectura moderna con React + NestJS + PostgreSQL.

---

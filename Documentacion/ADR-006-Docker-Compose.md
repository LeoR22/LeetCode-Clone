# ADR-006: Estrategia de Containerización con Docker Compose

**Estado:** Aceptado  
**Fecha:** Febrero 2026  
**Decisores:** DevOps Lead, Arquitecto de Software  

---

## Contexto y Problema

El sistema LeapCode consta de múltiples componentes que deben ejecutarse coordinadamente:
- Frontend React (desarrollo y build)
- Backend Flask API
- Nginx como reverse proxy
- Contenedores efímeros para ejecución de código

Se necesita una estrategia para:
- Orquestar todos los servicios localmente
- Facilitar desarrollo de los desarrolladores
- Preparar para despliegue en producción
- Asegurar consistencia entre entornos

### Opciones Consideradas:
- **Opción A:** Docker Compose
- **Opción B:** Kubernetes
- **Opción C:** Scripts shell manual
- **Opción D:** Docker Swarm

---

## Decisión

**Seleccionamos Docker Compose** para desarrollo local y pre-producción.

### Arquitectura de Contenedores:

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend React
  client:
    build:
      context: .
      dockerfile: Dockerfile.client
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    command: npm start
    networks:
      - leapcode-network

  # Backend Flask API
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "5000:5000"
    volumes:
      - ./api:/app/api
      - /var/run/docker.sock:/var/run/docker.sock  # Para crear contenedores
    environment:
      - FLASK_ENV=development
      - DOCKER_HOST=unix:///var/run/docker.sock
    networks:
      - leapcode-network
    depends_on:
      - nginx

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - leapcode-network
    depends_on:
      - client
      - api

networks:
  leapcode-network:
    driver: bridge
```

---

## Justificación

### Ventajas de Docker Compose:

#### 1. **Simplicidad**
```bash
# Levantar todo el sistema
docker-compose up

# Ver logs
docker-compose logs -f

# Parar todo
docker-compose down
```
- Un comando para levantar todo
- Configuración declarativa en YAML
- Fácil para desarrolladores nuevos

#### 2. **Desarrollo Consistente**
- Mismo entorno en todos los desarrolladores
- No más "funciona en mi máquina"
- Dependencias encapsuladas

#### 3. **Hot Reload en Desarrollo**
```yaml
volumes:
  - ./src:/app/src  # Cambios en código reflejados inmediatamente
```
- Frontend: Hot Module Replacement (HMR)
- Backend: Flask auto-reload

#### 4. **Networking Automático**
- Servicios se comunican por nombre
- DNS interno: `http://api:5000`
- Aislamiento de red

#### 5. **Variables de Entorno**
```yaml
environment:
  - FLASK_ENV=${FLASK_ENV:-development}
  - API_KEY=${API_KEY}
```
- Configuración flexible
- Secrets management
- Diferentes configs por entorno

### Comparación con Alternativas:

#### **Kubernetes:** ❌ Rechazado (para desarrollo local)
**Pros:**
- Escalamiento automático
- Self-healing
- Production-grade

**Contras:**
- Complejidad excesiva para desarrollo
- Curva de aprendizaje empinada
- Overhead de recursos en laptop
- Configuración YAML compleja

**Razón:** Overkill para desarrollo local. Kubernetes es para producción a escala.

#### **Scripts Shell:** ❌ Rechazado
**Pros:**
- Control total
- Sin dependencias

**Contras:**
- Diferentes en cada SO (Linux, Mac, Windows)
- Difícil mantener
- No declarativo
- Propenso a errores

**Razón:** No portables y difíciles de mantener.

#### **Docker Swarm:** ❌ Rechazado
**Pros:**
- Más simple que Kubernetes
- Integrado con Docker

**Contras:**
- Menos features que Kubernetes
- Comunidad más pequeña
- Futuro incierto

**Razón:** Si vamos a orquestación avanzada, mejor Kubernetes. Para local, Compose es suficiente.

---

## Dockerfiles

### Frontend Dockerfile:

```dockerfile
# Dockerfile.client
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Para desarrollo
CMD ["npm", "start"]

# Para producción
# RUN npm run build
# FROM nginx:alpine
# COPY --from=builder /app/build /usr/share/nginx/html
```

### Backend Dockerfile:

```dockerfile
# Dockerfile.api
FROM python:3.9-slim

WORKDIR /app

# Instalar Docker CLI (para crear contenedores desde Python)
RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Usuario no-root
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
```

---

## Configuración Nginx:

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream client {
        server client:3000;
    }

    upstream api {
        server api:5000;
    }

    server {
        listen 80;

        # Frontend
        location / {
            proxy_pass http://client;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # API
        location /api {
            proxy_pass http://api;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $host;
            
            # CORS headers
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        }
    }
}
```

---

## Consecuencias

### Positivas:
✅ **Onboarding rápido:** `git clone && docker-compose up`  
✅ **Consistencia:** Mismo entorno en todos lados  
✅ **Aislamiento:** No contamina sistema host  
✅ **Networking fácil:** DNS automático entre servicios  
✅ **Reproducibilidad:** Configuración versionada  

### Negativas:
❌ **Recursos:** Consume más RAM/CPU que ejecución nativa  
❌ **Dependencia Docker:** Todos necesitan Docker instalado  
❌ **Build time:** Primera build puede ser lenta  
❌ **No para producción a escala:** Solo desarrollo/staging  

---

## Comandos Útiles

### Desarrollo Diario:

```bash
# Levantar servicios
docker-compose up -d

# Ver logs de servicio específico
docker-compose logs -f api

# Rebuildar después de cambios en Dockerfile
docker-compose up --build

# Entrar a shell de contenedor
docker-compose exec api bash

# Ver estado de servicios
docker-compose ps

# Parar y eliminar contenedores
docker-compose down

# Eliminar volúmenes también
docker-compose down -v
```

### Debugging:

```bash
# Logs de todos los servicios
docker-compose logs

# Ejecutar comando en contenedor
docker-compose exec api python -c "import docker; print(docker.__version__)"

# Inspeccionar red
docker network inspect leapcode_leapcode-network
```

---

## Evolución a Producción

### Para Producción, Migrar a:

#### **Opción 1: Kubernetes**
```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: leapcode-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    spec:
      containers:
      - name: api
        image: leapcode/api:v1.0.0
        ports:
        - containerPort: 5000
```

#### **Opción 2: Cloud Services**
- Frontend: Vercel, Netlify
- Backend: AWS ECS, Google Cloud Run
- Database: AWS RDS, Google Cloud SQL

---

## Referencias
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Networking](https://docs.docker.com/network/)

---

**Estado:**  Implementado  
**Próxima Revisión:** proximo sprint 2026  
**Plan de Migración a K8s:** por definición

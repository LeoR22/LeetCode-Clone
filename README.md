# LeetCode Clone

Un clon básico de la plataforma **LeetCode**, desarrollado con **React (frontend)** y **Flask (backend)**, que permite a los usuarios escribir y ejecutar código en **Python** y **JavaScript** dentro de un entorno seguro.

---
## Características
- Editor de código en el navegador.
- Ejecución de programas en Python y JavaScript.
- Comunicación cliente-servidor mediante API REST.
- Contenedores Docker para aislamiento y despliegue.
- Proxy reverso con Nginx para enrutar tráfico.

---

## Arquitectura
- **Frontend:** ReactJS (contenedor `client`).
- **Backend:** Flask API (contenedor `api`).
- **Compiladores:** Python y Node.js integrados en sandbox.
- **Orquestación:** Docker Compose + Nginx.
- *(Opcional)* Base de datos para usuarios, problemas y envíos.

---

## Instalación y Ejecución

1. Clonar el repositorio:
```
   git clone https://github.com/LeoR22/LeetCode-Clone.git
   cd LeetCode-Clone
```
## Development
```
docker build -f Dockerfile.api -t react-flask-app-api .
docker build -f Dockerfile.api -t react-flask-app-client .

docker-compose build
docker-compose up
```

## Stop Docker Container
```
docker-compose down
```

# ADR-003: Elección de Flask como Backend Framework

**Estado:** Aceptado  
**Fecha:** Febrero 2026  
**Decisores:** Tech Lead Backend, Arquitecto de Software  

---

## Contexto y Problema

Se requiere seleccionar un framework web para el backend API que:
- Soporte desarrollo rápido de API RESTful
- Sea eficiente en manejo de requests HTTP
- Permita integración con Docker para ejecución de código
- Tenga ecosistema maduro y documentación sólida
- Sea mantenible a largo plazo

### Opciones Consideradas:
- **Opción A:** Flask (Python)
- **Opción B:** Django + Django REST Framework (Python)
- **Opción C:** FastAPI (Python)
- **Opción D:** Express.js (Node.js)

---

## Decisión

**Seleccionamos Flask** como framework backend por las siguientes razones:

### Características Seleccionadas:
- Framework minimalista y flexible
- Perfecto para APIs RESTful sin complejidad innecesaria
- Excelente integración con bibliotecas Python (Docker SDK)
- Curva de aprendizaje suave
- Ecosistema maduro con 10+ años de historia

---

## Justificación

### Ventajas de Flask:

#### 1. **Simplicidad y Minimalismo**
```python
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/api/execute', methods=['POST'])
def execute_code():
    code = request.json.get('code')
    language = request.json.get('language')
    
    result = execute_in_docker(code, language)
    return jsonify(result)
```
- Código claro y directo
- Sin configuración excesiva ni boilerplate
- Fácil de entender para nuevos desarrolladores

#### 2. **Integración Natural con Docker SDK**
```python
import docker
client = docker.from_env()

# Ejecución directa desde Python
container = client.containers.run(
    'python:3.9-slim',
    command='python script.py',
    ...
)
```
- Python es lenguaje nativo de Docker SDK
- Manipulación directa de contenedores
- Sin necesidad de wrappers o abstracciones adicionales

#### 3. **Ecosistema Rico**
- **Flask-CORS:** Manejo de CORS simplificado
- **Flask-Limiter:** Rate limiting incorporado
- **Flask-RESTful:** Extensión para APIs REST
- **Gunicorn:** WSGI server de producción probado
- Miles de extensiones disponibles

#### 4. **Performance Adecuado**
- Overhead mínimo para API REST
- ~1000-5000 req/s en servidor modesto
- Suficiente para aplicación educativa
- Escalable horizontalmente

### Comparación con Alternativas:

#### **Django REST Framework:** ❌ Rechazado
**Pros:**
- Framework completo con ORM, admin, autenticación
- Muy robusto y battle-tested

**Contras:**
- Demasiado pesado para API simple
- ORM innecesario (no usamos DB relacional aún)
- Configuración compleja para necesidades básicas
- Opinionado en exceso

**Razón:** Sobre-ingeniería para nuestro caso de uso.

#### **FastAPI:** ❌ Considerado pero rechazado
**Pros:**
- Asíncrono por defecto (mejor performance)
- Type hints y validación automática
- Documentación auto-generada (OpenAPI)
- Moderno y trending

**Contras:**
- Menos maduro que Flask (lanzado 2018 vs 2010)
- Menor cantidad de recursos y tutoriales
- Asincronía innecesaria para nuestro caso
- Ejecución de Docker es síncrona por naturaleza

**Razón:** Flask es suficiente y más establecido. FastAPI sería mejor si tuviéramos operaciones I/O-bound intensivas.

#### **Express.js (Node.js):** ❌ Rechazado
**Pros:**
- Asíncrono nativo
- JavaScript full-stack
- Gran comunidad

**Contras:**
- Docker SDK de Node.js menos robusto que Python
- Ejecución de Python desde Node requiere child processes
- Dos lenguajes en backend (Python para execution)
- Menor experiencia del equipo con Node.js

**Razón:** Python es más natural para integración con Docker y ejecución de código.

---

## Consecuencias

### Positivas:
✅ Desarrollo rápido de endpoints REST  
✅ Integración nativa con Docker  
✅ Código mantenible y legible  
✅ Fácil onboarding de nuevos desarrolladores  
✅ Ecosistema maduro y estable  

### Negativas:
❌ Síncrono por defecto (no async)  
❌ Documentación API manual (sin auto-generación como FastAPI)  
❌ Requiere extensions para funcionalidades avanzadas  

---

## Implementación

### Estructura del Proyecto Flask:

```
api/
├── app.py              # Aplicación principal Flask
├── config.py           # Configuración
├── requirements.txt    # Dependencias Python
├── routes/
│   ├── __init__.py
│   ├── problems.py     # Endpoints de problemas
│   ├── executor.py     # Endpoints de ejecución
│   └── health.py       # Health checks
├── services/
│   ├── code_executor.py   # Lógica de ejecución Docker
│   └── validator.py       # Validación de soluciones
└── models/
    └── problem.py      # Modelos de datos
```

### Configuración Básica:

```python
# app.py
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024  # 1 MB max request

from routes import problems, executor, health

app.register_blueprint(problems.bp)
app.register_blueprint(executor.bp)
app.register_blueprint(health.bp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

### Dependencias Principales:

```txt
# requirements.txt
Flask==2.3.2
flask-cors==4.0.0
docker==6.1.3
gunicorn==21.2.0
python-dotenv==1.0.0
```

---

## Evolución Futura

Si el sistema crece y requiere:
- **Alto throughput concurrente:** Migrar a FastAPI
- **GraphQL:** Agregar Flask-GraphQL
- **WebSockets:** Usar Flask-SocketIO
- **Autenticación compleja:** Integrar Flask-JWT-Extended

Flask permite estas extensiones sin reescritura completa.

---

## Referencias
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Docker SDK for Python](https://docker-py.readthedocs.io/)
- [Gunicorn Documentation](https://gunicorn.org/)

---

**Estado:**  Implementado  
**Próxima Revisión:** proximo sprint 2026

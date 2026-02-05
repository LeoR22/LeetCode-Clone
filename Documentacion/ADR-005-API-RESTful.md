# ADR-005: Comunicación mediante API RESTful

**Estado:** Aceptado  
**Fecha:** Febrero 2026  
**Decisores:** Arquitecto de Software, Tech Leads  

---

## Contexto y Problema

Se requiere definir el protocolo de comunicación entre frontend React y backend Flask.

### Opciones Consideradas:
- **Opción A:** REST API (HTTP + JSON)
- **Opción B:** GraphQL
- **Opción C:** gRPC
- **Opción D:** WebSockets

---

## Decisión

**Seleccionamos REST API** con las siguientes características:

### Principios REST:
- **Stateless:** Cada request contiene toda la información necesaria
- **Resource-based:** URLs representan recursos (`/api/problems`, `/api/execute`)
- **HTTP methods:** GET, POST, PUT, DELETE según operación
- **JSON:** Formato de intercambio de datos
- **HTTP status codes:** 200, 201, 400, 404, 500, etc.

---

## Diseño de API

### Endpoints Definidos:

#### **1. Gestión de Problemas**

```http
GET /api/problems
```
**Descripción:** Obtener lista de todos los problemas  
**Response:**
```json
{
  "problems": [
    {
      "id": 1,
      "title": "Two Sum",
      "difficulty": "easy",
      "category": "arrays",
      "acceptance_rate": 0.45
    }
  ]
}
```

```http
GET /api/problems/{id}
```
**Descripción:** Obtener detalles de un problema específico  
**Response:**
```json
{
  "id": 1,
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "difficulty": "easy",
  "examples": [...],
  "testCases": [...],
  "boilerplate": {
    "python": "def twoSum(nums, target):\n    pass",
    "javascript": "function twoSum(nums, target) {\n    \n}"
  }
}
```

#### **2. Ejecución de Código**

```http
POST /api/execute
```
**Request Body:**
```json
{
  "code": "print('Hello World')",
  "language": "python",
  "stdin": "optional input"
}
```
**Response (Success):**
```json
{
  "status": "success",
  "output": "Hello World\n",
  "executionTime": 0.123,
  "memory": 12.5
}
```
**Response (Error):**
```json
{
  "status": "error",
  "error": "SyntaxError: invalid syntax",
  "line": 3
}
```

#### **3. Envío de Solución**

```http
POST /api/submit
```
**Request Body:**
```json
{
  "problemId": 1,
  "code": "def twoSum(nums, target): ...",
  "language": "python"
}
```
**Response:**
```json
{
  "status": "accepted",
  "passedTests": 10,
  "totalTests": 10,
  "executionTime": 45,
  "memory": 13.2,
  "percentile": {
    "runtime": 85.3,
    "memory": 72.1
  }
}
```

#### **4. Health Check**

```http
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-04T10:30:00Z",
  "services": {
    "api": "up",
    "docker": "up"
  }
}
```

---

## Justificación

### Ventajas de REST:

#### 1. **Simplicidad**
- Usa HTTP estándar
- Fácil de entender y debuggear
- Herramientas existentes (Postman, curl)

#### 2. **Stateless**
- Servidor no mantiene sesión
- Fácil escalamiento horizontal
- Cada request es independiente

#### 3. **Cacheable**
```http
GET /api/problems/1
Cache-Control: max-age=3600
ETag: "abc123"
```

#### 4. **Independencia Cliente-Servidor**
- Frontend y backend evolucionan independientemente
- Versionado de API (`/api/v1`, `/api/v2`)

### Comparación con Alternativas:

#### **GraphQL:** ❌ Rechazado
**Pros:**
- Cliente solicita solo datos necesarios
- Un endpoint para todo

**Contras:**
- Complejidad agregada innecesaria
- Nuestros recursos son simples y predecibles
- Overhead de aprendizaje
- Caching más complejo

**Razón:** Sobre-ingeniería. REST es suficiente para estructura de datos simple.

#### **gRPC:** ❌ Rechazado
**Pros:**
- Performance superior (protocol buffers)
- Streaming bidireccional

**Contras:**
- No soportado nativamente en browsers
- Requiere HTTP/2
- Dificulta debugging
- No amigable con web

**Razón:** No compatible con browsers. REST+HTTP es estándar web.

#### **WebSockets:** ❌ Rechazado (para comunicación principal)
**Pros:**
- Comunicación bidireccional
- Real-time updates

**Contras:**
- Overhead de mantener conexión
- No necesitamos real-time para mayoría de operaciones
- Complejidad de manejo de conexiones

**Razón:** No necesitamos real-time para operaciones principales. Podemos agregar WebSockets después para features específicas (ej: collaborative coding).

---

## Consecuencias

### Positivas:
✅ **Simplicidad:** HTTP estándar, fácil de usar  
✅ **Tooling:** Postman, Swagger, curl funcionan out-of-the-box  
✅ **Cacheable:** Optimización de performance con caché HTTP  
✅ **Escalable:** Stateless permite múltiples instancias  
✅ **Debuggeable:** Fácil inspección de requests/responses  

### Negativas:
❌ **Overfetching:** Cliente recibe más datos de los necesarios  
❌ **Multiple requests:** Necesidad de varios requests para recursos relacionados  
❌ **No real-time:** Requiere polling para actualizaciones  

---

## Implementación

### Configuración Flask:

```python
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'https://leapcode.vercel.app'])

@app.route('/api/problems', methods=['GET'])
def get_problems():
    problems = load_problems()  # Mock data
    return jsonify({'problems': problems}), 200

@app.route('/api/execute', methods=['POST'])
def execute_code():
    data = request.get_json()
    
    # Validación
    if not data.get('code'):
        return jsonify({'error': 'Code is required'}), 400
    
    if data.get('language') not in ['python', 'javascript']:
        return jsonify({'error': 'Unsupported language'}), 400
    
    # Ejecución
    result = execute_in_docker(data['code'], data['language'])
    return jsonify(result), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200
```

### Cliente Axios (React):

```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptors para logging
api.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const problemsAPI = {
  getAll: () => api.get('/api/problems'),
  getById: (id) => api.get(`/api/problems/${id}`)
};

export const executionAPI = {
  execute: (code, language, stdin = '') => 
    api.post('/api/execute', { code, language, stdin }),
  
  submit: (problemId, code, language) =>
    api.post('/api/submit', { problemId, code, language })
};

export default api;
```

### Manejo de Errores:

```python
# Flask error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'error': 'Bad Request',
        'message': str(error)
    }), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not Found',
        'message': 'Resource not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'Something went wrong'
    }), 500
```

---

## Seguridad

### CORS Configuration:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "https://leapcode.vercel.app"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

### Rate Limiting:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/execute', methods=['POST'])
@limiter.limit("10 per minute")  # Límite específico
def execute_code():
    # ...
```

---

## Documentación de API

### Usar Swagger/OpenAPI (Futuro):

```python
from flask_swagger_ui import get_swaggerui_blueprint

SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={'app_name': "LeapCode API"}
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
```

---

## Referencias
- [REST API Best Practices](https://restfulapi.net/)
- [Flask RESTful](https://flask-restful.readthedocs.io/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

**Estado:**  Implementado  
**Próxima Revisión:** proximo sprint 2026

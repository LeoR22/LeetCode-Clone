# ADR-001: Selección de Arquitectura Cliente-Servidor Desacoplada

**Estado:** Aceptado  
**Fecha:** Febrero 2026  
**Decisores:** Equipo de Arquitectura  
**Contexto Técnico:** Diseño arquitectónico inicial del sistema LeapCode

---

## Contexto y Problema

Se necesita definir la arquitectura general del sistema LeapCode, una plataforma para práctica de programación competitiva con ejecución de código en línea. El sistema debe permitir a usuarios resolver problemas, ejecutar código arbitrario y validar soluciones automáticamente.

### Requerimientos Clave:
1. Interfaz de usuario moderna y responsiva
2. Ejecución segura de código de usuario
3. API para gestión de problemas y validación
4. Capacidad de escalar independientemente cada componente
5. Mantenibilidad y evolución del sistema

### Opciones Consideradas:
- **Opción A:** Monolito integrado (Backend renderiza frontend)
- **Opción B:** Arquitectura Cliente-Servidor desacoplada
- **Opción C:** Arquitectura de Microservicios
- **Opción D:** Serverless completo

---

## Decisión

**Seleccionamos la Arquitectura Cliente-Servidor Desacoplada (Opción B)** con los siguientes componentes:

1. **Frontend:** Single Page Application (SPA) en React
2. **Backend:** API RESTful en Flask (Python)
3. **Code Execution:** Servicio de ejecución mediante contenedores Docker

### Estructura:
```
┌─────────────┐         HTTP/REST         ┌─────────────┐
│   React     │ ◄───────────────────────► │   Flask     │
│   Frontend  │      JSON Requests        │   Backend   │
│    (SPA)    │                           │   (API)     │
└─────────────┘                           └──────┬──────┘
                                                 │
                                                 │ Orchestrates
                                                 ▼
                                          ┌─────────────┐
                                          │   Docker    │
                                          │ Containers  │
                                          │  (Execute)  │
                                          └─────────────┘
```

---

## Justificación

### Ventajas de la Decisión:

#### 1. **Separación de Responsabilidades**
- Frontend se enfoca únicamente en UX/UI y lógica de presentación
- Backend maneja lógica de negocio, validación y orquestación
- Execution layer aislada para seguridad

#### 2. **Desarrollo Independiente**
- Equipos frontend y backend pueden trabajar en paralelo
- Diferentes ciclos de despliegue
- Permite elegir las mejores tecnologías para cada capa

#### 3. **Escalabilidad Selectiva**
- Frontend (React) puede servirse desde CDN
- Backend API puede escalar horizontalmente según demanda
- Contenedores de ejecución pueden escalar independientemente

#### 4. **Flexibilidad Tecnológica**
- Frontend puede migrar a otro framework sin afectar backend
- Backend puede cambiar de tecnología si implementa mismo contrato API
- Lenguajes de ejecución pueden agregarse sin cambiar arquitectura

#### 5. **Reutilización de API**
- Mismo backend puede servir múltiples clientes (web, móvil, CLI)
- API documentada puede ser consumida por terceros
- Facilita integración con otros sistemas

### Comparación con Alternativas Rechazadas:

#### **Opción A - Monolito:** ❌ Rechazado
**Pros:**
- Simplicidad inicial de despliegue
- Menos complejidad de comunicación

**Contras:**
- Acoplamiento fuerte entre frontend y backend
- Dificulta escalamiento independiente
- Tecnología única (limitante para frontend moderno)
- Despliegues todo-o-nada

**Razón de Rechazo:** No permite la flexibilidad y escalabilidad requeridas para una plataforma moderna.

#### **Opción C - Microservicios:** ❌ Rechazado
**Pros:**
- Máxima independencia de componentes
- Escalabilidad granular

**Contras:**
- Complejidad operacional excesiva para alcance actual
- Requiere orquestación compleja (Kubernetes)
- Overhead de comunicación entre servicios
- Complejidad de debugging y monitoreo

**Razón de Rechazo:** Sobre-ingeniería para el tamaño y complejidad actual del proyecto. Los beneficios no justifican la complejidad agregada.

#### **Opción D - Serverless:** ❌ Rechazado
**Pros:**
- Escalabilidad automática
- Pago por uso
- Menor gestión de infraestructura

**Contras:**
- Ejecución de código arbitrario complica arquitectura serverless
- Cold starts afectarían experiencia de usuario
- Vendor lock-in significativo
- Costos impredecibles con mucho tráfico
- Dificulta desarrollo local

**Razón de Rechazo:** La naturaleza de ejecución de código arbitrario no se adapta bien al modelo serverless. Las funciones lambda tienen limitaciones de tiempo de ejecución y recursos que conflictúan con nuestras necesidades.

---

## Consecuencias

### Positivas:
✅ **Mantenibilidad mejorada:** Cambios en frontend no afectan backend  
✅ **Mejor experiencia de desarrollo:** Equipos especializados por capa  
✅ **Escalabilidad independiente:** Cada componente escala según su demanda  
✅ **Flexibilidad de despliegue:** Frontend en CDN, backend en cloud tradicional  
✅ **Testing aislado:** Tests de frontend y backend separados  
✅ **Reutilización:** API puede servir múltiples interfaces  

### Negativas:
❌ **Complejidad de despliegue:** Requiere coordinar despliegue de 2 aplicaciones  
❌ **CORS:** Necesidad de configurar Cross-Origin Resource Sharing  
❌ **Latencia de red:** Comunicación HTTP agrega overhead vs monolito  
❌ **Debugging distribuido:** Errores pueden atravesar múltiples componentes  

### Riesgos Mitigados:
- **Riesgo:** Latencia de comunicación HTTP
  **Mitigación:** Optimización de llamadas API, caching estratégico, minimizar round-trips
  
- **Riesgo:** Complejidad de configuración CORS
  **Mitigación:** Documentación clara, configuración desde inicio, uso de proxies en desarrollo
  
- **Riesgo:** Sincronización de versiones frontend/backend
  **Mitigación:** Versionado de API, contratos bien definidos, tests de contrato

---

## Implementación

### Tecnologías Seleccionadas:
- **Frontend:** React 18.x, JavaScript (ES6+), Axios
- **Backend:** Flask 2.x, Python 3.9+, Gunicorn
- **Comunicación:** REST API sobre HTTP/HTTPS, formato JSON

### Organización del Código:
```
proyecto/
├── frontend/           # Aplicación React
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/            # API Flask
│   ├── api/
│   ├── requirements.txt
│   └── app.py
│
└── docker-compose.yml  # Orquestación local
```

### Endpoints de API Iniciales:
```
GET  /api/problems          - Lista de problemas
GET  /api/problems/:id      - Detalle de problema
POST /api/execute           - Ejecutar código
POST /api/submit            - Enviar solución
GET  /api/health            - Health check
```

---

## Notas Adicionales

### Evolución Futura:
Esta arquitectura permite una evolución gradual hacia microservicios si el proyecto crece:
1. Separar servicio de autenticación
2. Separar servicio de ejecución de código
3. Agregar API Gateway
4. Implementar event-driven communication

### Alternativas de Comunicación Futuras:
Si se requiere comunicación en tiempo real, se puede agregar:
- WebSockets para feedback de ejecución en tiempo real
- Server-Sent Events para notificaciones
- GraphQL como alternativa a REST

---

## Referencias
- [Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html)
- [REST API Best Practices](https://restfulapi.net/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)

---

**Estado:**  Implementado  
**Revisión Programada:** Trimestre  Proximo sprint  
**Revisores:** Arquitecto Lead, Tech Lead Frontend, Tech Lead Backend

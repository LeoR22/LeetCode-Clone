# Documentación de Arquitectura de Software
## LeetCode Clone 

**Versión:** 1.0  
**Fecha:** Febrero 2026  
**Autor:** Arquitecto de Software  
**Proyecto:** Sistema de Práctica de Programación Competitiva

---

## 1. RESUMEN EJECUTIVO

### 1.1 Propósito del Documento
Este documento describe la arquitectura de software del sistema clon de LeetCode que permite a los usuarios resolver problemas de programación con soporte para Python y JavaScript, incluye un compilador/intérprete en línea y gestión de problemas.

### 1.2 Alcance del Sistema
LeetCode Clone es una plataforma web full-stack que proporciona:
- Repositorio de problemas de programación con diferentes niveles de dificultad
- Editor de código integrado con resaltado de sintaxis
- Compilación y ejecución de código en Python y JavaScript
- Sistema de validación automática de soluciones
- Interfaz de usuario responsiva y moderna

### 1.3 Stakeholders
- **Usuarios finales:** Estudiantes y profesionales que practican programación competitiva
- **Administradores:** Gestores de contenido que agregan y mantienen problemas
- **Desarrolladores:** Equipo técnico responsable del mantenimiento y evolución del sistema

---

## 2. VISIÓN ARQUITECTÓNICA

### 2.1 Arquitectura de Alto Nivel
El sistema implementa una arquitectura **Cliente-Servidor de tres capas** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────┐
│           CAPA DE PRESENTACIÓN                  │
│     (React SPA - Cliente Frontend)              │
└─────────────────────────────────────────────────┘
                      ↕ HTTP/REST
┌─────────────────────────────────────────────────┐
│           CAPA DE APLICACIÓN                    │
│        (Flask API - Backend Server)             │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│           CAPA DE EJECUCIÓN                     │
│   (Code Execution Engine - Sandbox Aislado)     │
└─────────────────────────────────────────────────┘
```

### 2.2 Decisiones Arquitectónicas Clave
1. **Arquitectura Cliente-Servidor Desacoplada:** Frontend React y Backend Flask como servicios independientes
2. **API RESTful:** Comunicación basada en HTTP/JSON entre capas
3. **Ejecución de Código en Sandbox:** Aislamiento de ejecución de código de usuario mediante contenedores Docker
4. **Stateless Backend:** API sin estado para escalabilidad horizontal
5. **SPA (Single Page Application):** Frontend como aplicación de una sola página para mejor UX

---

## 3. ANÁLISIS DE REQUERIMIENTOS

### 3.1 Requerimientos Funcionales Identificados

#### RF-001: Catálogo de Problemas
**Descripción:** El sistema debe presentar un catálogo de problemas de programación categorizados por dificultad.
**Prioridad:** Alta
**Componente:** Frontend + Backend API

#### RF-002: Editor de Código Integrado
**Descripción:** Los usuarios deben poder escribir código en un editor con resaltado de sintaxis para Python y JavaScript.
**Prioridad:** Alta
**Componente:** Frontend (Monaco Editor integrado)

#### RF-003: Compilación/Ejecución de Código
**Descripción:** El sistema debe ejecutar el código enviado por el usuario y retornar resultados o errores.
**Prioridad:** Alta
**Componente:** Backend + Code Execution Engine

#### RF-004: Validación Automática de Soluciones
**Descripción:** El sistema debe validar automáticamente si la solución del usuario pasa todos los casos de prueba.
**Prioridad:** Alta
**Componente:** Backend

#### RF-005: Compilador en Línea Independiente
**Descripción:** Proveer un compilador/intérprete en línea donde los usuarios puedan ejecutar código arbitrario.
**Prioridad:** Media
**Componente:** Frontend + Backend

### 3.2 Requerimientos No Funcionales

#### RNF-001: Seguridad
**Descripción:** El código de usuario debe ejecutarse en un entorno aislado sin acceso a recursos del sistema host.
**Atributo de Calidad:** Seguridad
**Mecanismo:** Docker containers con recursos limitados

#### RNF-002: Disponibilidad
**Descripción:** El sistema debe estar disponible 99% del tiempo.
**Atributo de Calidad:** Disponibilidad
**Mecanismo:** Health checks, contenedores redundantes

#### RNF-003: Rendimiento
**Descripción:** El tiempo de respuesta de ejecución de código no debe exceder 10 segundos.
**Atributo de Calidad:** Performance
**Mecanismo:** Timeout de ejecución, optimización de código

#### RNF-004: Escalabilidad
**Descripción:** El sistema debe soportar múltiples usuarios concurrentes ejecutando código.
**Atributo de Calidad:** Escalabilidad
**Mecanismo:** Backend stateless, balanceo de carga, contenedores escalables

#### RNF-005: Usabilidad
**Descripción:** La interfaz debe ser intuitiva y responsiva en diferentes dispositivos.
**Atributo de Calidad:** Usabilidad
**Mecanismo:** React responsive design, Material-UI components

#### RNF-006: Mantenibilidad
**Descripción:** El código debe estar organizado y documentado para facilitar mantenimiento.
**Atributo de Calidad:** Mantenibilidad
**Mecanismo:** Separación de capas, código modular, estándares de código

---

## 4. ATRIBUTOS DE CALIDAD PRIORIZADOS

### 4.1 Escenarios de Atributos de Calidad

#### Escenario 1: Seguridad - Ejecución de Código Malicioso
**Fuente:** Usuario malintencionado  
**Estímulo:** Envía código que intenta acceder al sistema de archivos o ejecutar comandos del sistema  
**Artefacto:** Code Execution Engine  
**Entorno:** Operación normal  
**Respuesta:** El código se ejecuta en un contenedor Docker aislado sin acceso a recursos del host  
**Medida:** 100% de intentos de acceso no autorizado son bloqueados

#### Escenario 2: Rendimiento - Ejecución Concurrente
**Fuente:** Múltiples usuarios  
**Estímulo:** 50 usuarios envían código para ejecución simultáneamente  
**Artefacto:** Backend Flask + Execution Engine  
**Entorno:** Carga pico  
**Respuesta:** Sistema procesa todas las solicitudes sin degradación significativa  
**Medida:** Tiempo de respuesta < 10 segundos para el 95% de las ejecuciones

#### Escenario 3: Disponibilidad - Fallo de Componente
**Fuente:** Fallo interno del sistema  
**Estímulo:** Contenedor de ejecución falla inesperadamente  
**Artefacto:** Docker container  
**Entorno:** Operación normal  
**Respuesta:** Sistema reinicia automáticamente el contenedor y reintenta la operación  
**Medida:** Recuperación en < 5 segundos

#### Escenario 4: Escalabilidad - Crecimiento de Usuarios
**Fuente:** Crecimiento del negocio  
**Estímulo:** Incremento del 200% en usuarios activos  
**Artefacto:** Sistema completo  
**Entorno:** Carga creciente  
**Respuesta:** Sistema escala horizontalmente agregando instancias  
**Medida:** Sin degradación de rendimiento al escalar

### 4.2 Matriz de Priorización de Atributos de Calidad

| Atributo de Calidad | Prioridad | Justificación |
|---------------------|-----------|---------------|
| **Seguridad** | Crítica | Ejecución de código arbitrario representa riesgo máximo |
| **Rendimiento** | Alta | Experiencia de usuario depende de respuestas rápidas |
| **Escalabilidad** | Alta | Debe soportar crecimiento de usuarios sin rediseño |
| **Disponibilidad** | Media | Plataforma educativa no crítica para operaciones 24/7 |
| **Usabilidad** | Media | Importante para adopción pero no técnicamente crítico |
| **Mantenibilidad** | Media | Facilita evolución pero no impacta operación inmediata |

---

## 5. DECISIONES ARQUITECTÓNICAS

Las decisiones arquitectónicas detalladas se encuentran documentadas en archivos ADR individuales:

- **ADR-001:** Selección de Arquitectura Cliente-Servidor
- **ADR-002:** Uso de Docker para Ejecución de Código
- **ADR-003:** Elección de Flask como Backend Framework
- **ADR-004:** Implementación de React para Frontend
- **ADR-005:** Comunicación mediante API RESTful
- **ADR-006:** Estrategia de Containerización con Docker Compose

Consultar carpeta `/adrs` para detalles completos de cada decisión.

---

## 6. VISTAS ARQUITECTÓNICAS (C4 MODEL)

### 6.1 Diagrama de Contexto (Nivel 1)
Muestra el sistema LeetCode Clone y su interacción con actores externos.

**Ubicación:** `diagrams/C4-L1-Context.drawio`

**Descripción:** Vista de más alto nivel mostrando usuarios, administradores y sistemas externos interactuando con LeetCode Clone.

### 6.2 Diagrama de Contenedores (Nivel 2)
Detalla los principales contenedores técnicos y sus responsabilidades.

**Ubicación:** `diagrams/C4-L2-Containers.drawio`

**Descripción:** Muestra Frontend (React), Backend API (Flask), Execution Engine y Nginx como reverse proxy.

### 6.3 Diagrama de Componentes (Nivel 3)
Desglosa los componentes internos del Backend Flask.

**Ubicación:** `diagrams/C4-L3-Components.drawio`

**Descripción:** Detalla controladores, servicios de ejecución, gestión de problemas y validación.

### 6.4 Diagrama de Código (Nivel 4)
Opcional - Para clases críticas como CodeExecutor.

**Ubicación:** `diagrams/C4-L4-Code.drawio`

---

## 7. PATRONES ARQUITECTÓNICOS APLICADOS

### 7.1 Patrón: Layered Architecture (Arquitectura en Capas)
**Aplicación:** Separación clara entre presentación (React), lógica de negocio (Flask API) y ejecución (Docker containers).
**Beneficio:** Mantenibilidad, testeabilidad, y separación de responsabilidades.

### 7.2 Patrón: RESTful API
**Aplicación:** Comunicación entre frontend y backend mediante endpoints HTTP siguiendo principios REST.
**Beneficio:** Interoperabilidad, escalabilidad, stateless operations.

### 7.3 Patrón: Repository Pattern
**Aplicación:** Gestión de datos de problemas mediante repositorios que abstraen el acceso a datos.
**Beneficio:** Desacoplamiento de lógica de negocio y persistencia.

### 7.4 Patrón: Sandbox Execution Pattern
**Aplicación:** Ejecución de código de usuario en entornos aislados (Docker containers).
**Beneficio:** Seguridad, aislamiento, control de recursos.

### 7.5 Patrón: Single Page Application (SPA)
**Aplicación:** Frontend React como SPA con enrutamiento del lado del cliente.
**Beneficio:** Mejor experiencia de usuario, rendimiento de navegación.

---

## 8. STACK TECNOLÓGICO

### 8.1 Frontend
- **Framework:** React 18.x
- **Lenguaje:** JavaScript (ES6+)
- **Editor de Código:** Monaco Editor / CodeMirror
- **Estado:** React Context API / useState
- **HTTP Client:** Axios / Fetch API
- **Estilado:** CSS Modules / Styled Components

### 8.2 Backend
- **Framework:** Flask 2.x (Python)
- **Lenguaje:** Python 3.9+
- **WSGI Server:** Gunicorn
- **API:** RESTful endpoints

### 8.3 Infraestructura
- **Containerización:** Docker
- **Orquestación:** Docker Compose
- **Reverse Proxy:** Nginx
- **Ejecución de Código:** Docker containers aislados

### 8.4 Herramientas de Desarrollo
- **Control de Versiones:** Git
- **Package Manager (Frontend):** npm / yarn
- **Package Manager (Backend):** pip
- **Build Tools:** Create React App / Vite

---

## 9. CONSIDERACIONES DE SEGURIDAD

### 9.1 Aislamiento de Ejecución de Código
**Mecanismo:** Docker containers con:
- Recursos de CPU y memoria limitados
- Sin privilegios de root
- Sistema de archivos de solo lectura (excepto área de trabajo temporal)
- Red restringida

### 9.2 Validación de Entrada
**Mecanismo:**
- Sanitización de código enviado
- Límites de tamaño de código (max caracteres)
- Timeout de ejecución configurado
- Validación de lenguaje permitido

### 9.3 CORS (Cross-Origin Resource Sharing)
**Mecanismo:**
- Configuración de headers CORS en Flask
- Whitelist de orígenes permitidos
- Protección contra CSRF

### 9.4 Rate Limiting
**Mecanismo:**
- Límite de ejecuciones por usuario/IP
- Prevención de abuso de recursos
- Throttling en API endpoints

---

## 10. CONSIDERACIONES DE DESPLIEGUE

### 10.1 Entorno de Desarrollo
```bash
docker-compose up
```
- Frontend: localhost:3000
- Backend: localhost:5000
- Nginx: localhost:80

### 10.2 Entorno de Producción
**Plataforma Actual:** Vercel (Frontend)
**URL Producción:** https://LeetCode Clone.vercel.app/editor

**Consideraciones:**
- Frontend desplegado como sitio estático en Vercel
- Backend podría desplegarse en Heroku, AWS ECS, o DigitalOcean
- Uso de variables de entorno para configuración
- SSL/TLS para comunicación segura

### 10.3 Escalabilidad Horizontal
**Estrategia:**
- Backend stateless permite múltiples instancias
- Load balancer (Nginx/AWS ALB) distribuye tráfico
- Contenedores de ejecución pueden escalar independientemente
- CDN para recursos estáticos del frontend

---

## 11. MONITOREO Y OBSERVABILIDAD

### 11.1 Métricas Clave
- Tiempo de respuesta de API endpoints
- Tiempo de ejecución de código
- Tasa de errores de ejecución
- Uso de recursos (CPU, memoria) de contenedores
- Número de usuarios concurrentes

### 11.2 Logging
- Logs estructurados en formato JSON
- Niveles: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Logs de ejecución de código (entrada, salida, errores)
- Logs de seguridad (intentos de violación)

### 11.3 Health Checks
- Endpoint `/health` en Backend API
- Verificación de disponibilidad de contenedores de ejecución
- Monitoreo de estado de servicios

---

## 12. EVOLUCIÓN Y ROADMAP

### 12.1 Mejoras Planificadas
1. **Sistema de Autenticación:** Registro y login de usuarios
2. **Base de Datos:** Persistencia de soluciones y progreso de usuarios
3. **Más Lenguajes:** Soporte para Java, C++, Go
4. **Sistema de Rankings:** Leaderboards y estadísticas
5. **Discusiones:** Foro de discusión por problema
6. **Tests Automatizados:** Suite completa de tests unitarios e integración

### 12.2 Deuda Técnica Identificada
- Falta de base de datos relacional
- Ausencia de sistema de autenticación
- Testing limitado
- Falta de CI/CD pipeline
- Documentación de API incompleta

---

## 13. CONCLUSIONES

### 13.1 Fortalezas de la Arquitectura
- **Separación clara de responsabilidades** entre frontend, backend y ejecución
- **Seguridad robusta** mediante aislamiento de contenedores
- **Escalabilidad horizontal** gracias a diseño stateless
- **Tecnologías modernas y populares** facilitan contratación y mantenimiento
- **Arquitectura simple y comprensible** adecuada para el alcance actual

### 13.2 Áreas de Mejora
- **Persistencia:** Agregar base de datos para usuarios y soluciones
- **Autenticación:** Implementar sistema seguro de usuarios
- **Testing:** Aumentar cobertura de pruebas automatizadas
- **Monitoreo:** Implementar solución de monitoreo robusto (Prometheus, Grafana)
- **Documentación API:** Usar OpenAPI/Swagger para documentación interactiva

### 13.3 Alineación con Requerimientos
La arquitectura propuesta cumple con todos los requerimientos funcionales identificados y aborda los atributos de calidad priorizados:
-  Seguridad mediante contenedores Docker
-  Rndimiento optimizado con ejecución asíncrona
-  Escalabilidad horizontal posible
-  Usabilidad con interfaz React moderna
-  Mantenibilidad con código modular

---

## 14. REFERENCIAS

- Documentación oficial de React: https://react.dev/
- Documentación oficial de Flask: https://flask.palletsprojects.com/
- Docker best practices: https://docs.docker.com/develop/dev-best-practices/
- C4 Model: https://c4model.com/
- Architecture Decision Records: https://adr.github.io/

---

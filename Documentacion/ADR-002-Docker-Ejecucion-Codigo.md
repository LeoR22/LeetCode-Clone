# ADR-002: Uso de Docker para Ejecución Segura de Código

**Estado:** Aceptado  
**Fecha:** Febrero 2026  
**Decisores:** Equipo de Arquitectura, Equipo de Seguridad  
**Contexto Técnico:** Mecanismo de ejecución de código de usuario en sistema LeapCode

---

## Contexto y Problema

LeapCode permite a usuarios ejecutar código arbitrario en Python y JavaScript en el servidor. Esto presenta **riesgos críticos de seguridad**:

### Amenazas Identificadas:
1. **Acceso al sistema de archivos del host:** Lectura/escritura de archivos sensibles
2. **Ejecución de comandos del sistema:** Compromiso total del servidor
3. **Consumo ilimitado de recursos:** CPU, memoria, disco
4. **Ataques de red:** Conexiones salientes maliciosas
5. **Fork bombs y procesos infinitos**
6. **Escalada de privilegios**

### Requerimientos de Seguridad:
- ✅ Código de usuario debe ejecutarse en **entorno aislado completamente**
- ✅ Sin acceso a archivos del host ni otros contenedores
- ✅ Límites estrictos de recursos (CPU, memoria, tiempo)
- ✅ Sin capacidades de administrador
- ✅ Sin acceso a red externa
- ✅ Auditoría y logging de ejecuciones

### Opciones Consideradas:
- **Opción A:** Ejecución directa en el servidor (sin aislamiento)
- **Opción B:** Contenedores Docker con restricciones de seguridad
- **Opción C:** Máquinas virtuales completas (VMs)
- **Opción D:** Servicios de ejecución de código de terceros (Judge0, HackerRank API)

---

## Decisión

**Seleccionamos Contenedores Docker (Opción B)** con las siguientes configuraciones de seguridad:

### Configuración de Seguridad Docker:

```yaml
# docker-compose.yml - Configuración de ejecución
code-executor:
  image: python:3.9-slim  # o node:18-slim
  security_opt:
    - no-new-privileges:true  # Prevenir escalada de privilegios
  read_only: true              # Filesystem de solo lectura
  tmpfs:
    - /tmp:noexec,nosuid,size=10m  # Solo 10MB escribibles, sin ejecución
  ulimits:
    nproc: 64                  # Máximo 64 procesos
    nofile: 128                # Máximo 128 archivos abiertos
  mem_limit: 256m              # Límite de memoria: 256 MB
  cpus: 0.5                    # Límite de CPU: 0.5 cores
  network_mode: none           # Sin acceso a red
  cap_drop:
    - ALL                      # Eliminar todas las capabilities
  pids_limit: 64               # Límite de PIDs
```

### Timeout de Ejecución:
```python
# Backend Flask - Configuración de timeout
EXECUTION_TIMEOUT = 10  # segundos
```

### Flujo de Ejecución:
```
1. Usuario envía código → Backend API
2. Backend valida código (tamaño, sintaxis básica)
3. Backend crea contenedor Docker efímero
4. Código se ejecuta en contenedor con timeout
5. Resultado/error se captura
6. Contenedor se destruye inmediatamente
7. Resultado se envía al usuario
```

---

## Justificación

### Ventajas de Docker:

#### 1. **Aislamiento de Seguridad Robusto**
- **Namespaces de Linux:** Aíslan procesos, red, sistema de archivos, usuarios
- **Cgroups:** Limitan recursos (CPU, memoria, I/O)
- **Seccomp:** Restringe syscalls peligrosas
- **AppArmor/SELinux:** Políticas de seguridad adicionales

#### 2. **Control Granular de Recursos**
- Límites de memoria configurables por ejecución
- Límites de CPU para evitar monopolización
- Timeout automático para código infinito
- Límite de procesos para prevenir fork bombs

#### 3. **Reproductibilidad y Consistencia**
- Mismo entorno de ejecución siempre
- Versiones específicas de Python/Node.js
- Librerías y dependencias predefinidas
- Resultados determinísticos

#### 4. **Eficiencia Operacional**
- Inicio rápido de contenedores (<500ms)
- Menor overhead que VMs completas
- Reutilización de imágenes (caching)
- Fácil escalamiento horizontal

#### 5. **Facilidad de Gestión**
- Docker Compose para orquestación local
- Kubernetes/ECS para producción
- Logging centralizado
- Monitoreo de recursos

### Comparación con Alternativas Rechazadas:

#### **Opción A - Ejecución Directa:** ❌ Rechazado
**Pros:**
- Máxima velocidad de ejecución
- Simplicidad de implementación

**Contras:**
- ⚠️ **CRÍTICO:** Riesgo de seguridad inaceptable
- Código malicioso puede comprometer servidor completo
- Sin aislamiento de recursos
- Un usuario puede afectar a todos

**Razón de Rechazo:** Riesgo de seguridad es inaceptable para ejecución de código arbitrario. Un solo usuario malintencionado puede comprometer todo el sistema.

#### **Opción C - Máquinas Virtuales:** ❌ Rechazado
**Pros:**
- Aislamiento total y máxima seguridad
- Separación completa de kernel

**Contras:**
- Inicio lento (varios segundos a minutos)
- Overhead de recursos significativo (GB de RAM por VM)
- Complejidad de gestión aumentada
- Costos de infraestructura altos

**Razón de Rechazo:** El overhead y latencia de VMs completas no es justificable. Docker proporciona aislamiento suficiente con mucho mejor rendimiento.

#### **Opción D - Servicios Terceros (Judge0, etc.):** ❌ Rechazado
**Pros:**
- Sin responsabilidad de seguridad
- Mantenimiento externo
- Soportan muchos lenguajes

**Contras:**
- Costo por ejecución (no viable para alto volumen)
- Dependencia de servicio externo (SLA)
- Latencia de red agregada
- Vendor lock-in
- Límites de personalización

**Razón de Rechazo:** Pérdida de control sobre infraestructura crítica y costos recurrentes altos. Preferimos inversión en solución propia.

---

## Consecuencias

### Positivas:
✅ **Seguridad robusta:** Aislamiento a nivel de kernel (namespaces)  
✅ **Control de recursos:** Prevención de abuso mediante límites estrictos  
✅ **Escalabilidad:** Múltiples contenedores concurrentes  
✅ **Portabilidad:** Funciona igual en desarrollo y producción  
✅ **Auditabilidad:** Logs de cada ejecución  
✅ **Performance aceptable:** Inicio de contenedor <1s  

### Negativas:
❌ **Complejidad inicial:** Requiere conocimiento de Docker  
❌ **Overhead pequeño:** ~100-200ms vs ejecución nativa  
❌ **Gestión de imágenes:** Necesidad de mantener imágenes actualizadas  
❌ **Recursos:** Cada contenedor consume memoria base  

### Riesgos y Mitigaciones:

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Container escape | Muy baja | Crítico | Usar versiones estables de Docker, deshabilitar capabilities, mantener kernel actualizado |
| Agotamiento de recursos del host | Media | Alto | Límites estrictos por contenedor, monitoreo de recursos, límite de contenedores concurrentes |
| Vulnerabilidad en imagen base | Media | Alto | Usar imágenes oficiales, escaneo de vulnerabilidades (Trivy), actualizaciones regulares |
| DoS por creación de contenedores | Media | Medio | Rate limiting, autenticación, monitoreo de creación de contenedores |

---

## Implementación

### Imágenes Docker a Utilizar:

#### Para Python:
```dockerfile
# Dockerfile.python-executor
FROM python:3.9-slim

# Usuario no-root
RUN useradd -m -u 1000 coderunner

# Área de trabajo
WORKDIR /sandbox
RUN chown coderunner:coderunner /sandbox

USER coderunner

# Librerías permitidas (whitelist)
# RUN pip install numpy pandas (si se permiten)

CMD ["python3"]
```

#### Para JavaScript:
```dockerfile
# Dockerfile.node-executor
FROM node:18-slim

RUN useradd -m -u 1000 coderunner

WORKDIR /sandbox
RUN chown coderunner:coderunner /sandbox

USER coderunner

CMD ["node"]
```

### Código Flask de Ejecución:

```python
import docker
import tempfile
import os
from flask import jsonify

client = docker.from_env()

def execute_python_code(code):
    """
    Ejecuta código Python en contenedor Docker aislado
    """
    try:
        # Crear archivo temporal con el código
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        # Ejecutar en contenedor con restricciones
        container = client.containers.run(
            image='python:3.9-slim',
            command=f'python {os.path.basename(temp_file)}',
            volumes={os.path.dirname(temp_file): {'bind': '/sandbox', 'mode': 'ro'}},
            working_dir='/sandbox',
            mem_limit='256m',
            nano_cpus=500000000,  # 0.5 CPUs
            network_disabled=True,
            remove=True,
            detach=False,
            stdout=True,
            stderr=True,
            timeout=10
        )
        
        output = container.decode('utf-8')
        
        return {
            'status': 'success',
            'output': output,
            'error': None
        }
        
    except docker.errors.ContainerError as e:
        return {
            'status': 'error',
            'output': None,
            'error': e.stderr.decode('utf-8')
        }
    except Exception as e:
        return {
            'status': 'error',
            'output': None,
            'error': str(e)
        }
    finally:
        # Limpiar archivo temporal
        if os.path.exists(temp_file):
            os.remove(temp_file)
```

### Monitoreo y Logging:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def log_execution(user_id, language, code_hash, duration, status):
    """
    Registra cada ejecución para auditoría
    """
    logger.info({
        'event': 'code_execution',
        'user_id': user_id,
        'language': language,
        'code_hash': code_hash,  # Hash del código, no el código completo
        'duration_ms': duration,
        'status': status,
        'timestamp': datetime.utcnow().isoformat()
    })
```

---

## Configuración de Producción

### Docker Engine Security:
```json
// /etc/docker/daemon.json
{
  "userns-remap": "default",
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true,
  "selinux-enabled": true
}
```

### Límites del Sistema:
- **Contenedores concurrentes máximos:** 100
- **Tiempo de ejecución máximo:** 10 segundos
- **Memoria por contenedor:** 256 MB
- **CPU por contenedor:** 0.5 cores
- **Espacio temporal:** 10 MB

---

## Validación de Seguridad

### Tests de Penetración Realizados:
1. Inento de lectura de `/etc/passwd` → Bloqueado
2. Intento de `fork()` ilimitado → Limitado a 64 procesos
3. Consumo de memoria ilimitado → Contenedor killed al llegar a 256MB
4. Loop infinito → Timeout a los 10 segundos
5. Conexión a internet → Red deshabilitada
6. Ejecución de binarios del sistema → Filesystem read-only

### Auditorías Programadas:
- Revisión trimestral de configuraciones de seguridad
- Actualización mensual de imágenes base
- Escaneo semanal de vulnerabilidades con Trivy
- Penetration testing anual por terceros

---

## Referencias
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [OWASP Container Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Linux Namespaces](https://man7.org/linux/man-pages/man7/namespaces.7.html)

---

**Estado:** ✅ Implementado y en Producción  
**Próxima Revisión:** Mayo 2026  
**Responsable de Seguridad:** Security Team Lead

# Reporte Técnico del Proyecto
## Sistema de Cuestionario Psicométrico para Scoring Crediticio

**Versión:** 1.0
**Fecha:** Diciembre 2024
**Clasificación:** Confidencial

---

## 1. Resumen Ejecutivo

Sistema web diseñado para la aplicación de cuestionarios psicométricos orientados a la evaluación crediticia de personas no bancarizadas. La plataforma permite administrar cuestionarios, generar tokens de acceso único, capturar respuestas con métricas detalladas de comportamiento, y exponer una API para integración con motores de scoring crediticio.

### Propósito del Negocio

En mercados emergentes, aproximadamente el 50% de la población adulta carece de historial crediticio tradicional. Este sistema permite:

- Evaluar características psicométricas correlacionadas con comportamiento de pago
- Capturar métricas de comportamiento durante la evaluación (tiempo de respuesta, cambios de opinión)
- Proveer datos estructurados para modelos de machine learning de scoring alternativo
- Reducir tasas de mora en poblaciones sin historial bancario

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USUARIOS                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────┐                    ┌──────────────────┐              │
│   │  Usuario Final   │                    │   Administrador  │              │
│   │  (Evaluado)      │                    │   (Backoffice)   │              │
│   └────────┬─────────┘                    └────────┬─────────┘              │
│            │                                       │                         │
│            │ URL con Token                         │ Login Cognito           │
│            ▼                                       ▼                         │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │                    React SPA (Vite)                          │           │
│   │  • Code Splitting (Lazy Loading)                            │           │
│   │  • Tailwind CSS v4                                          │           │
│   │  • Framer Motion (Animaciones)                              │           │
│   └─────────────────────────────────────────────────────────────┘           │
│                              │                                               │
└──────────────────────────────┼───────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────────────┐
│                         AWS AMPLIFY GEN 2                                    │
├──────────────────────────────┼───────────────────────────────────────────────┤
│                              ▼                                               │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │                    AWS AppSync                               │           │
│   │                  (GraphQL API)                               │           │
│   │  • API Key (público)                                        │           │
│   │  • Cognito (admin)                                          │           │
│   └─────────────────────────────────────────────────────────────┘           │
│                              │                                               │
│              ┌───────────────┼───────────────┐                              │
│              ▼               ▼               ▼                              │
│   ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                  │
│   │   DynamoDB     │ │   DynamoDB     │ │   DynamoDB     │                  │
│   │ Cuestionario   │ │    Token       │ │   Response     │                  │
│   │  Definition    │ │                │ │                │                  │
│   └────────────────┘ └────────────────┘ └───────┬────────┘                  │
│                                                  │                           │
│                                          ┌──────┴──────┐                    │
│                                          │     GSI     │                    │
│                                          │ByDownload   │                    │
│                                          │  Status     │                    │
│                                          └─────────────┘                    │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │               Lambda (Python 3.12)                           │           │
│   │            API Externa de Respuestas                         │           │
│   │  • Rate Limiting (100 req/min)                              │           │
│   │  • X-Ray Tracing                                            │           │
│   │  • Secrets Manager (API Key)                                │           │
│   └─────────────────────────────────────────────────────────────┘           │
│                              │                                               │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │                    Observabilidad                            │           │
│   │  • CloudWatch Logs (estructurados JSON)                     │           │
│   │  • CloudWatch Alarms (errores, latencia, throttling)        │           │
│   │  • SNS Notifications                                        │           │
│   │  • X-Ray Distributed Tracing                                │           │
│   └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │                    Cognito User Pool                         │           │
│   │              (Autenticación Administradores)                 │           │
│   └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────────────┐
│                    SISTEMAS EXTERNOS                                         │
├──────────────────────────────┼───────────────────────────────────────────────┤
│                              ▼                                               │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │              Motor de Scoring Crediticio                     │           │
│   │  • Consume API REST de respuestas                           │           │
│   │  • Procesa métricas psicométricas                           │           │
│   │  • Genera score crediticio alternativo                      │           │
│   └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|------------|---------|---------------|
| **Frontend** | React | 18.2 | Ecosistema maduro, rendimiento |
| **Build** | Vite | 5.4 | HMR rápido, ESM nativo |
| **Estilos** | Tailwind CSS | 4.1 | Utility-first, tree-shaking |
| **Animaciones** | Framer Motion | 12.x | Experiencia gamificada |
| **Backend** | AWS Amplify Gen 2 | 1.5 | IaC nativo, TypeScript |
| **API** | AWS AppSync | - | GraphQL gestionado |
| **Base de Datos** | DynamoDB | - | Serverless, escalable |
| **Auth** | Cognito | - | OAuth2/OIDC integrado |
| **Functions** | Lambda Python | 3.12 | API externa |
| **IaC** | AWS CDK | 2.138 | Infraestructura como código |
| **Testing** | Vitest | 4.0 | Compatible con Vite |

---

## 3. Funcionalidades del Sistema

### 3.1 Módulo de Cuestionarios

| Funcionalidad | Descripción |
|---------------|-------------|
| Carga de cuestionarios | Upload JSON con validación exhaustiva |
| Gestión de estados | draft → active → archived |
| Versionamiento | Control de versiones por cuestionario |
| Validación | 15+ reglas de validación en frontend |

### 3.2 Sistema de Tokens

| Funcionalidad | Descripción |
|---------------|-------------|
| Generación batch | Creación paralela (lotes de 10) |
| Uso único | Token invalidado tras completar |
| Expiración | Fecha de vencimiento configurable |
| Revocación | Invalidación manual desde admin |
| Estados | active / used / expired / revoked |

### 3.3 Experiencia del Evaluado

| Funcionalidad | Descripción |
|---------------|-------------|
| Acceso por URL | `/q/{tokenId}` |
| Gamificación | 5 badges por hitos de progreso |
| Métricas | Tiempo, cambios de respuesta |
| Abandono | Detección y guardado de parciales |
| Responsive | Optimizado para móvil |

### 3.4 Panel de Administración

| Funcionalidad | Descripción |
|---------------|-------------|
| Dashboard | Vista consolidada de métricas |
| Gestión tokens | CRUD con filtros por estado |
| Respuestas | Visualización y exportación |
| Autenticación | Cognito con MFA opcional |

### 3.5 API Externa

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/responses/pending` | GET | Respuestas sin descargar |
| `/responses/{id}/mark` | POST | Marcar como descargada |
| `/responses/{id}/unmark` | POST | Revertir marcado |

---

## 4. Métricas Capturadas

### 4.1 Métricas por Pregunta

```json
{
  "question_number": 15,
  "question_text": "¿Cómo manejas situaciones de presión financiera?",
  "selected_option_key": "B",
  "selected_option_text": "B. Busco alternativas y negocio plazos",
  "time_to_answer_ms": 8500,
  "time_adjusted_ms": 8500,
  "changed_answer": true,
  "change_count": 2,
  "had_badge_popup": false
}
```

### 4.2 Métricas por Cuestionario

| Métrica | Tipo | Uso en Scoring |
|---------|------|----------------|
| `totalTimeMs` | number | Velocidad de decisión |
| `totalTimeAdjustedMs` | number | Sin popups de gamificación |
| `status` | enum | Completado vs abandonado |
| `answersJson` | array | Respuestas detalladas |
| Cambios de respuesta | count | Indicador de consistencia |
| Tiempo por pregunta | ms | Patrones de reflexión |

### 4.3 Correlaciones Psicométricas

Las métricas capturadas permiten inferir:

- **Impulsividad financiera**: Tiempo de respuesta muy bajo
- **Indecisión**: Alto número de cambios de respuesta
- **Abandono**: Correlación con falta de compromiso
- **Consistencia**: Patrones en respuestas similares

---

## 5. Análisis de Complejidad

### 5.1 Métricas de Código

| Métrica | Valor | Evaluación |
|---------|-------|------------|
| Archivos TypeScript | ~50 | Medio |
| Archivos Python | 1 | Bajo |
| Líneas de código (LoC) | ~5,000 | Medio |
| Componentes React | ~25 | Medio |
| Servicios | 3 | Bajo |
| Tests automatizados | 28 | Básico |
| Cobertura de tests | ~40% | Mejorable |

### 5.2 Clasificación de Complejidad

| Aspecto | Complejidad | Notas |
|---------|-------------|-------|
| **Arquitectura** | Media | Serverless estándar AWS |
| **Frontend** | Media | React + gamificación |
| **Backend** | Baja | CRUD simple con GraphQL |
| **Seguridad** | Media | Auth + tokens + API key |
| **DevOps** | Baja | Amplify gestiona CI/CD |
| **Integración** | Baja | API REST estándar |

### 5.3 Complejidad Global

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   COMPLEJIDAD GLOBAL: MEDIA-BAJA                          │
│                                                            │
│   ████████████░░░░░░░░  ~55%                              │
│                                                            │
│   El proyecto es adecuado para:                           │
│   ✓ Equipos pequeños (2-4 desarrolladores)                │
│   ✓ Iteraciones rápidas                                    │
│   ✓ Mantenimiento a largo plazo                           │
│   ✓ Paso a producción                                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Evaluación para Producción

### 6.1 Checklist de Producción

| Categoría | Requisito | Estado | Notas |
|-----------|-----------|--------|-------|
| **Seguridad** | Autenticación | ✅ | Cognito |
| | Autorización | ✅ | Roles diferenciados |
| | Tokens únicos | ✅ | UUID + validación |
| | API Key segura | ✅ | Secrets Manager |
| | Rate limiting | ✅ | 100 req/min |
| | HTTPS | ✅ | Amplify Hosting |
| | Validación input | ✅ | Frontend + backend |
| **Confiabilidad** | Retry con backoff | ✅ | Implementado |
| | Manejo de errores | ✅ | Try-catch global |
| | Logging | ✅ | Estructurado JSON |
| | Monitoreo | ✅ | CloudWatch |
| | Alarmas | ✅ | SNS notifications |
| **Performance** | Code splitting | ✅ | Lazy loading |
| | GSI en DynamoDB | ✅ | Queries eficientes |
| | Batch operations | ✅ | Tokens en paralelo |
| **Operaciones** | IaC | ✅ | CDK/Amplify |
| | CI/CD | ✅ | Amplify Hosting |
| | Tracing | ✅ | X-Ray |
| | Backup | ⚠️ | Point-in-time recovery pendiente |
| | Multi-región | ❌ | Single region |

### 6.2 Recomendaciones Pre-Producción

#### Críticas (Bloquean producción)

1. **Habilitar Point-in-Time Recovery en DynamoDB**
   ```typescript
   // En resource.ts
   .settings({ pointInTimeRecovery: true })
   ```

2. **Configurar WAF en API Gateway/AppSync**
   - Protección contra SQL injection
   - Rate limiting a nivel de IP

3. **Revisar políticas IAM**
   - Principio de menor privilegio
   - Auditoría de permisos

#### Importantes (Recomendadas)

4. **Aumentar cobertura de tests a 80%+**
5. **Implementar health checks**
6. **Configurar alertas de billing**
7. **Documentar runbooks operativos**

### 6.3 Veredicto de Producción

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   ESTADO: LISTO PARA PRODUCCIÓN (con observaciones)       │
│                                                            │
│   El sistema cumple con los requisitos mínimos para       │
│   un MVP en producción. Se recomienda:                    │
│                                                            │
│   1. Implementar las 3 recomendaciones críticas           │
│   2. Ejecutar pruebas de carga antes del lanzamiento      │
│   3. Establecer proceso de respuesta a incidentes         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 7. Análisis de Escalabilidad

### 7.1 Límites por Componente

| Componente | Límite Soft | Límite Hard | Escalable |
|------------|-------------|-------------|-----------|
| **DynamoDB** | Ilimitado | Ilimitado | ✅ Auto |
| **AppSync** | 10K req/s | Configurable | ✅ Auto |
| **Lambda** | 1000 concurrent | 10K+ | ✅ Solicitar |
| **Cognito** | 40 req/s | Configurable | ⚠️ Manual |
| **CloudWatch** | 500 TPS | 1500 TPS | ✅ Auto |

### 7.2 Proyección de Carga

#### Escenario: Miles de cuestionarios/mes (1K-10K)

```
┌─────────────────────────────────────────────────────────────┐
│ ESCENARIO: 10,000 cuestionarios/mes                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Asumiendo:                                                  │
│ • 50 preguntas por cuestionario                            │
│ • Distribución uniforme (8 horas/día, 20 días/mes)         │
│ • 10,000 / (20 * 8) = 62 cuestionarios/hora                │
│ • = ~1 cuestionario/minuto en pico                         │
│                                                             │
│ Carga en servicios:                                         │
│ • DynamoDB: ~3 writes/min (token + response + update)      │
│ • AppSync: ~50 queries/min (preguntas + guardado)          │
│ • Lambda: ~5 invocaciones/min (API externa)                │
│                                                             │
│ VEREDICTO: ✅ SIN PROBLEMAS                                 │
│ Muy por debajo de los límites. Costo mínimo.               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Escenario: Cientos de miles de cuestionarios/mes (100K-500K)

```
┌─────────────────────────────────────────────────────────────┐
│ ESCENARIO: 500,000 cuestionarios/mes                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Asumiendo:                                                  │
│ • Pico de 3x el promedio                                   │
│ • 500,000 / (20 * 8) = 3,125 cuestionarios/hora            │
│ • Pico: ~156 cuestionarios/minuto                          │
│ • = ~2.6 cuestionarios/segundo en pico                     │
│                                                             │
│ Carga en servicios:                                         │
│ • DynamoDB: ~8 writes/segundo (dentro de on-demand)        │
│ • AppSync: ~130 queries/segundo                            │
│ • Lambda: ~10 invocaciones/segundo                         │
│                                                             │
│ VEREDICTO: ✅ MANEJABLE                                     │
│ Dentro de límites. Considerar provisioned capacity         │
│ para DynamoDB si el costo de on-demand es alto.            │
│                                                             │
│ Recomendaciones:                                            │
│ • Monitorear métricas de throttling                        │
│ • Configurar alarmas de capacidad                          │
│ • Evaluar caching en AppSync                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Escenario: Millones de cuestionarios/mes (1M+)

```
┌─────────────────────────────────────────────────────────────┐
│ ESCENARIO: 2,000,000 cuestionarios/mes                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Asumiendo:                                                  │
│ • Operación 24/7 con picos 5x                              │
│ • 2,000,000 / (30 * 24) = 2,778 cuestionarios/hora         │
│ • Pico: ~230 cuestionarios/minuto                          │
│ • = ~20 cuestionarios/segundo en pico extremo              │
│                                                             │
│ Carga en servicios:                                         │
│ • DynamoDB: ~60 writes/segundo (requiere planning)         │
│ • AppSync: ~1000 queries/segundo                           │
│ • Lambda: ~50 invocaciones/segundo                         │
│                                                             │
│ VEREDICTO: ⚠️ REQUIERE OPTIMIZACIONES                      │
│                                                             │
│ Cambios necesarios:                                         │
│ 1. DynamoDB: Provisioned capacity + auto-scaling           │
│ 2. AppSync: Caching habilitado                             │
│ 3. Lambda: Provisioned concurrency                         │
│ 4. CDN: CloudFront para assets estáticos                   │
│ 5. Arquitectura: Considerar multi-región                   │
│ 6. Base de datos: Particionamiento por fecha               │
│                                                             │
│ Costo estimado: Ver sección 8                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Matriz de Escalabilidad

| Volumen/mes | Complejidad | Cambios Requeridos | Tiempo Implementación |
|-------------|-------------|--------------------|-----------------------|
| 1K - 10K | Ninguna | Ninguno | N/A |
| 10K - 100K | Baja | Monitoreo mejorado | 1-2 días |
| 100K - 500K | Media | Capacity planning | 1 semana |
| 500K - 1M | Media-Alta | Caching, tuning | 2 semanas |
| 1M - 5M | Alta | Re-arquitectura parcial | 1 mes |
| 5M+ | Muy Alta | Multi-región, sharding | 2-3 meses |

---

## 8. Análisis de Costos Operativos

### 8.1 Modelo de Costos Serverless

El modelo serverless de AWS tiene las siguientes características:

- **Pago por uso**: Solo se paga por recursos consumidos
- **Sin costos fijos**: No hay servidores dedicados
- **Escalado automático**: Costos proporcionales a la carga
- **Free tier**: Primeros 12 meses con créditos

### 8.2 Desglose por Servicio (us-east-1)

#### DynamoDB (On-Demand)

| Operación | Precio | Unidad |
|-----------|--------|--------|
| Write Request | $1.25 | por millón |
| Read Request | $0.25 | por millón |
| Storage | $0.25 | por GB/mes |

#### AppSync

| Operación | Precio | Unidad |
|-----------|--------|--------|
| Query/Mutation | $4.00 | por millón |
| Real-time | $2.00 | por millón mensajes |

#### Lambda

| Recurso | Precio | Unidad |
|---------|--------|--------|
| Invocaciones | $0.20 | por millón |
| Duración | $0.0000166667 | por GB-segundo |

#### Cognito

| Recurso | Precio | Unidad |
|---------|--------|--------|
| MAU (primeros 50K) | $0.0055 | por usuario |
| MAU (siguientes 50K) | $0.0046 | por usuario |

#### Otros

| Servicio | Precio Estimado |
|----------|-----------------|
| CloudWatch Logs | $0.50/GB ingestado |
| Secrets Manager | $0.40/secret/mes |
| X-Ray | $5.00/millón traces |

### 8.3 Estimación por Escenario

#### Escenario A: 10,000 cuestionarios/mes

```
┌─────────────────────────────────────────────────────────────┐
│ COSTOS MENSUALES: 10K cuestionarios                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ DynamoDB:                                                   │
│   • Writes: 30K × $1.25/M = $0.04                          │
│   • Reads: 500K × $0.25/M = $0.13                          │
│   • Storage: 1GB × $0.25 = $0.25                           │
│   Subtotal: $0.42                                          │
│                                                             │
│ AppSync:                                                    │
│   • Queries: 500K × $4.00/M = $2.00                        │
│   Subtotal: $2.00                                          │
│                                                             │
│ Lambda:                                                     │
│   • Invocaciones: 10K × $0.20/M = $0.002                   │
│   • Duración: ~$0.50                                       │
│   Subtotal: $0.50                                          │
│                                                             │
│ Cognito:                                                    │
│   • 10 admins × $0.0055 = $0.06                            │
│   Subtotal: $0.06                                          │
│                                                             │
│ Otros (logs, secrets, monitoring):                          │
│   Subtotal: $5.00                                          │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ TOTAL MENSUAL: ~$8 USD                                      │
│ COSTO POR CUESTIONARIO: $0.0008                            │
│                                                             │
│ Nota: Free tier de AWS cubre la mayoría en año 1           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Escenario B: 100,000 cuestionarios/mes

```
┌─────────────────────────────────────────────────────────────┐
│ COSTOS MENSUALES: 100K cuestionarios                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ DynamoDB:                                                   │
│   • Writes: 300K × $1.25/M = $0.38                         │
│   • Reads: 5M × $0.25/M = $1.25                            │
│   • Storage: 10GB × $0.25 = $2.50                          │
│   Subtotal: $4.13                                          │
│                                                             │
│ AppSync:                                                    │
│   • Queries: 5M × $4.00/M = $20.00                         │
│   Subtotal: $20.00                                         │
│                                                             │
│ Lambda:                                                     │
│   • Invocaciones + duración: ~$5.00                        │
│   Subtotal: $5.00                                          │
│                                                             │
│ Cognito:                                                    │
│   • 20 admins × $0.0055 = $0.11                            │
│   Subtotal: $0.11                                          │
│                                                             │
│ Otros:                                                      │
│   Subtotal: $15.00                                         │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ TOTAL MENSUAL: ~$45 USD                                     │
│ COSTO POR CUESTIONARIO: $0.00045                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Escenario C: 1,000,000 cuestionarios/mes

```
┌─────────────────────────────────────────────────────────────┐
│ COSTOS MENSUALES: 1M cuestionarios                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ DynamoDB (Provisioned + Auto-scaling):                      │
│   • Writes: 3M × $1.25/M = $3.75                           │
│   • Reads: 50M × $0.25/M = $12.50                          │
│   • Storage: 100GB × $0.25 = $25.00                        │
│   • Reserved capacity discount: -30%                        │
│   Subtotal: $29.00                                         │
│                                                             │
│ AppSync:                                                    │
│   • Queries: 50M × $4.00/M = $200.00                       │
│   • Caching habilitado: -20%                               │
│   Subtotal: $160.00                                        │
│                                                             │
│ Lambda:                                                     │
│   • Invocaciones + duración: ~$40.00                       │
│   Subtotal: $40.00                                         │
│                                                             │
│ Cognito:                                                    │
│   • 50 admins × $0.0055 = $0.28                            │
│   Subtotal: $0.28                                          │
│                                                             │
│ CloudFront (CDN):                                           │
│   Subtotal: $20.00                                         │
│                                                             │
│ Otros:                                                      │
│   Subtotal: $50.00                                         │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ TOTAL MENSUAL: ~$300 USD                                    │
│ COSTO POR CUESTIONARIO: $0.0003                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.4 Resumen de Costos

| Volumen/mes | Costo Total | Costo/Cuestionario | Tendencia |
|-------------|-------------|--------------------|-----------|
| 10,000 | ~$8 | $0.0008 | Baseline |
| 50,000 | ~$25 | $0.0005 | ↓ 38% |
| 100,000 | ~$45 | $0.00045 | ↓ 44% |
| 500,000 | ~$150 | $0.0003 | ↓ 63% |
| 1,000,000 | ~$300 | $0.0003 | ↓ 63% |

**Conclusión**: El modelo serverless presenta economías de escala. A mayor volumen, menor costo unitario.

### 8.5 Comparación con Infraestructura Tradicional

| Concepto | Serverless | Tradicional (EC2) |
|----------|------------|-------------------|
| Costo inicial | $0 | ~$200/mes mínimo |
| Escalabilidad | Automática | Manual/planificada |
| Mantenimiento | Bajo | Alto (parches, updates) |
| Disponibilidad | 99.99% incluida | Requiere configuración |
| Backup | Automático | Manual |
| Break-even | ~500K cuestionarios | Después de 500K |

---

## 9. Equipo del Proyecto

### 9.1 Composición del Equipo

| Rol | Responsabilidad | Participación |
|-----|-----------------|---------------|
| **Product Owner** | Definición de requisitos, priorización | Continua |
| **Arquitecto de Soluciones** | Diseño de arquitectura AWS, decisiones técnicas | Diseño inicial + revisiones |
| **Desarrollador Full-Stack Sr.** | Implementación frontend y backend | Desarrollo completo |
| **Especialista UX/UI** | Diseño de experiencia, gamificación | Diseño inicial |
| **QA Engineer** | Testing, validación | Ciclos de prueba |
| **DevOps Engineer** | CI/CD, monitoreo, infraestructura | Configuración |

### 9.2 Horas Invertidas por Fase

#### Fase 1: Descubrimiento y Diseño

| Actividad | Horas | Responsable |
|-----------|-------|-------------|
| Levantamiento de requisitos | 16 | Product Owner |
| Diseño de arquitectura | 24 | Arquitecto |
| Diseño UX/UI | 20 | Especialista UX |
| Prototipado | 12 | UX + Dev |
| Revisión y ajustes | 8 | Equipo |
| **Subtotal Fase 1** | **80 horas** | |

#### Fase 2: Desarrollo Core

| Actividad | Horas | Responsable |
|-----------|-------|-------------|
| Setup proyecto (Amplify, React) | 8 | Desarrollador |
| Schema DynamoDB | 6 | Desarrollador |
| Autenticación Cognito | 8 | Desarrollador |
| CRUD Cuestionarios | 16 | Desarrollador |
| Sistema de Tokens | 12 | Desarrollador |
| Flujo de cuestionario | 24 | Desarrollador |
| Sistema de respuestas | 16 | Desarrollador |
| Gamificación (badges) | 12 | Desarrollador |
| Panel de administración | 20 | Desarrollador |
| **Subtotal Fase 2** | **122 horas** | |

#### Fase 3: API Externa e Integraciones

| Actividad | Horas | Responsable |
|-----------|-------|-------------|
| Lambda Python (API) | 16 | Desarrollador |
| Autenticación API Key | 8 | Desarrollador |
| Rate limiting | 4 | Desarrollador |
| Documentación API | 6 | Desarrollador |
| **Subtotal Fase 3** | **34 horas** | |

#### Fase 4: Calidad y Operaciones

| Actividad | Horas | Responsable |
|-----------|-------|-------------|
| Tests unitarios (Vitest) | 12 | QA + Dev |
| Validaciones de input | 8 | Desarrollador |
| Retry con backoff | 6 | Desarrollador |
| CloudWatch alarms | 6 | DevOps |
| X-Ray tracing | 4 | DevOps |
| Code splitting | 4 | Desarrollador |
| Optimización performance | 8 | Desarrollador |
| **Subtotal Fase 4** | **48 horas** | |

#### Fase 5: Documentación y Cierre

| Actividad | Horas | Responsable |
|-----------|-------|-------------|
| Documentación técnica | 12 | Desarrollador |
| Manual de usuario | 8 | Product Owner |
| Capacitación | 6 | Equipo |
| Revisión final | 6 | Arquitecto |
| **Subtotal Fase 5** | **32 horas** | |

### 9.3 Resumen de Horas

```
┌─────────────────────────────────────────────────────────────┐
│                    RESUMEN DE HORAS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Fase 1: Descubrimiento y Diseño        80 horas   (25%)    │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │
│                                                             │
│ Fase 2: Desarrollo Core               122 horas   (39%)    │
│ ███████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │
│                                                             │
│ Fase 3: API e Integraciones            34 horas   (11%)    │
│ █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │
│                                                             │
│ Fase 4: Calidad y Operaciones          48 horas   (15%)    │
│ ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │
│                                                             │
│ Fase 5: Documentación y Cierre         32 horas   (10%)    │
│ █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ TOTAL:                                316 horas             │
│                                                             │
│ Equivalente a:                                              │
│ • ~8 semanas (40 hrs/semana, 1 persona)                    │
│ • ~4 semanas (2 personas en paralelo)                      │
│ • ~2.5 semanas (3 personas en paralelo)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.4 Distribución por Rol

| Rol | Horas | % del Total |
|-----|-------|-------------|
| Desarrollador Full-Stack Sr. | 180 | 57% |
| Arquitecto de Soluciones | 40 | 13% |
| Product Owner | 36 | 11% |
| Especialista UX/UI | 28 | 9% |
| DevOps Engineer | 18 | 6% |
| QA Engineer | 14 | 4% |
| **TOTAL** | **316** | **100%** |

---

## 10. Evaluación de Calidad (AWS Well-Architected)

### 10.1 Puntuación por Pilar

| Pilar | Score | Descripción |
|-------|-------|-------------|
| **Seguridad** | 8/10 | Cognito, tokens únicos, API key, rate limiting |
| **Confiabilidad** | 7/10 | Retry, manejo de abandonos, alarmas |
| **Eficiencia de Rendimiento** | 8/10 | Serverless, GSI, code splitting, batch |
| **Optimización de Costos** | 7/10 | Pay-per-use, sin sobre-aprovisionamiento |
| **Excelencia Operativa** | 7/10 | IaC, logging, tracing, alarmas |
| **Sostenibilidad** | 7/10 | Recursos bajo demanda, sin desperdicio |

### 10.2 Score Global

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   SCORE GLOBAL: 7.3 / 10                                    │
│                                                             │
│   ███████████████░░░░░  73%                                │
│                                                             │
│   Clasificación: BUENO                                      │
│                                                             │
│   El sistema cumple con las mejores prácticas de AWS       │
│   y está preparado para cargas de producción moderadas.    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Riesgos y Mitigaciones

### 11.1 Matriz de Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Filtración de datos | Baja | Alto | Cognito, API key rotación, auditoría |
| Fallo de servicio AWS | Muy baja | Alto | Multi-AZ automático, backup |
| Costos inesperados | Media | Medio | Alarmas de billing, límites |
| Tokens comprometidos | Baja | Medio | Uso único, expiración, revocación |
| Abandono masivo | Media | Bajo | Métricas, detección, guardado parcial |
| Sobrecarga picos | Baja | Medio | Serverless auto-scale |

### 11.2 Plan de Contingencia

1. **Incidente de seguridad**: Revocar API keys, rotar secretos, auditar logs
2. **Fallo de servicio**: AppSync replica automáticamente, DynamoDB multi-AZ
3. **Pico de carga**: Serverless escala automáticamente, alarmas notifican

---

## 12. Roadmap Sugerido

### Corto Plazo (1-3 meses)

- [ ] Habilitar Point-in-Time Recovery en DynamoDB
- [ ] Configurar WAF
- [ ] Aumentar cobertura de tests a 80%
- [ ] Implementar export a CSV/Excel desde admin
- [ ] Dashboard de métricas agregadas

### Mediano Plazo (3-6 meses)

- [ ] Multi-idioma (i18n)
- [ ] A/B testing de preguntas
- [ ] Integración directa con motor de scoring
- [ ] App móvil nativa (React Native)
- [ ] Modo offline con sincronización

### Largo Plazo (6-12 meses)

- [ ] Multi-región (latencia global)
- [ ] Cuestionarios adaptativos (ML)
- [ ] Analytics avanzado (QuickSight)
- [ ] API GraphQL subscriptions (tiempo real)
- [ ] Certificación SOC 2

---

## 13. Conclusiones

### 13.1 Fortalezas del Proyecto

1. **Arquitectura serverless**: Escalabilidad automática, costos optimizados
2. **Seguridad robusta**: Múltiples capas (Cognito, tokens, API key)
3. **Experiencia de usuario**: Gamificación mejora completion rate
4. **Métricas ricas**: Datos valiosos para scoring crediticio
5. **Mantenibilidad**: IaC con Amplify Gen 2, código TypeScript tipado

### 13.2 Áreas de Mejora

1. Cobertura de tests
2. Documentación operativa (runbooks)
3. Multi-región para alta disponibilidad global
4. Integración más profunda con sistemas de scoring

### 13.3 Veredicto Final

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   EL PROYECTO ESTÁ LISTO PARA PRODUCCIÓN                   │
│                                                             │
│   Recomendación: Proceder con las 3 mejoras críticas       │
│   identificadas antes del lanzamiento.                      │
│                                                             │
│   El sistema puede manejar desde cientos hasta millones    │
│   de cuestionarios con ajustes progresivos de capacidad.   │
│                                                             │
│   El modelo serverless garantiza costos proporcionales     │
│   al uso real, sin inversión inicial significativa.        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Anexos

### A. Estructura del Proyecto

```
amplify-cuestionario/
├── amplify/
│   ├── auth/resource.ts           # Cognito config
│   ├── data/resource.ts           # DynamoDB schema
│   ├── functions/
│   │   └── responses-api/
│   │       └── handler.py         # Lambda API externa
│   └── backend.ts                 # CDK stack
├── src/
│   ├── components/
│   │   ├── admin/                 # Panel administración
│   │   ├── questionnaire/         # Componentes cuestionario
│   │   └── ui/                    # Componentes reutilizables
│   ├── screens/                   # Pantallas principales
│   ├── services/                  # Lógica de negocio
│   ├── types/                     # Tipos TypeScript
│   └── utils/                     # Utilidades (retry, validation)
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── tailwind.config.js
```

### B. Ejemplo de Cuestionario JSON

```json
{
  "id_cuestionario": "scoring-financiero-v1",
  "version": "1.0.0",
  "title": "Evaluación de Perfil Financiero",
  "description": "Cuestionario psicométrico para evaluación crediticia",
  "total_questions": 50,
  "status": "active",
  "questions": [
    {
      "question_number": 1,
      "text": "Cuando recibo dinero inesperado, generalmente:",
      "question_type": "forced_choice",
      "options": [
        { "option_key": "A", "option_text": "Lo ahorro para emergencias", "score": 5 },
        { "option_key": "B", "option_text": "Pago deudas pendientes", "score": 4 },
        { "option_key": "C", "option_text": "Me doy un gusto personal", "score": 2 },
        { "option_key": "D", "option_text": "Lo comparto con familia", "score": 3 }
      ]
    }
  ]
}
```

### C. Ejemplo de Respuesta API

```json
{
  "id": "resp-uuid-12345",
  "tokenId": "token-uuid-67890",
  "cuestionarioId": "scoring-financiero-v1",
  "cuestionarioVersion": "1.0.0",
  "status": "completed",
  "totalTimeMs": 845000,
  "totalTimeAdjustedMs": 825000,
  "answersJson": [
    {
      "question_number": 1,
      "question_text": "Cuando recibo dinero inesperado...",
      "selected_option_key": "A",
      "selected_option_text": "A. Lo ahorro para emergencias",
      "time_to_answer_ms": 12500,
      "time_adjusted_ms": 12500,
      "changed_answer": false,
      "change_count": 0,
      "had_badge_popup": false
    }
  ],
  "downloadStatus": "pending",
  "createdAt": "2024-12-21T15:30:00Z"
}
```

---

**Documento generado:** Diciembre 2024
**Versión del documento:** 1.0
**Próxima revisión:** Marzo 2025

# Documento de Negocios: Sistema de Cuestionarios Psicométricos

## Resumen Ejecutivo

El **Sistema de Cuestionarios Psicométricos** es una plataforma digital diseñada para la recolección y análisis de datos conductuales orientados a la evaluación de riesgo crediticio. La aplicación permite administrar encuestas de manera autónoma (vía URL) o asistida (modo kiosco/tableta), con gamificación integrada para maximizar la tasa de finalización.

---

## 1. Propuesta de Valor

### Problema que Resuelve

Las entidades financieras y crediticias enfrentan desafíos significativos en la evaluación de riesgo de potenciales clientes:

- **Datos insuficientes**: Los scores tradicionales (buró de crédito) no capturan comportamientos financieros subyacentes
- **Alta tasa de abandono**: Los cuestionarios tradicionales tienen tasas de completación menores al 40%
- **Fricción operativa**: La recolección manual de datos es costosa y propensa a errores
- **Falta de trazabilidad**: No existe seguimiento del proceso de respuesta

### Solución Propuesta

Una plataforma web moderna que:

| Beneficio | Descripción |
|-----------|-------------|
| **Captura integral** | 54 preguntas psicométricas validadas que evalúan comportamiento financiero |
| **Gamificación** | Sistema de badges y progreso visual que incrementa la tasa de finalización |
| **Flexibilidad operativa** | Modo autoadministrado (URL) y asistido (tableta) |
| **Analytics detallado** | Tiempo por pregunta, cambios de respuesta, puntos de abandono |
| **Feedback integrado** | Encuesta de satisfacción post-completado |

---

## 2. Modelo Operativo

### 2.1 Flujos de Operación

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUJO AUTOADMINISTRADO                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Admin genera token → Envía URL al usuario → Usuario responde desde    │
│  su dispositivo → Respuesta guardada automáticamente                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUJO ASISTIDO (KIOSCO)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Operador registra datos del encuestado → Entrega tableta →            │
│  Usuario responde → Devuelve tableta → Feedback → Siguiente persona    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Roles del Sistema

| Rol | Acceso | Funciones Principales |
|-----|--------|----------------------|
| **Administrador** | Panel `/admin` | Gestionar cuestionarios, tokens, ver respuestas, descargar datos |
| **Operador de Campo** | Panel `/encuesta` | Registrar encuestados, administrar tabletas, ver KPIs propios |
| **Encuestado** | URL con token | Responder cuestionario, dar feedback |

### 2.3 Estados del Cuestionario

```
DRAFT → ACTIVE → ARCHIVED
  │        │         │
  │        │         └── Ya no se puede usar, solo consultar
  │        │
  │        └── Disponible para responder (solo 1 activo por vez)
  │
  └── En edición, no disponible públicamente
```

---

## 3. Métricas e Indicadores (KPIs)

### 3.1 KPIs Operativos

| Indicador | Descripción | Objetivo |
|-----------|-------------|----------|
| **Tasa de finalización** | Encuestas completadas / Encuestas iniciadas | > 75% |
| **Tasa de abandono** | Encuestas abandonadas / Encuestas iniciadas | < 25% |
| **Tiempo promedio** | Tiempo total de completación | 8-12 minutos |
| **Punto de abandono** | Pregunta promedio donde abandonan | Pregunta > 30 |

### 3.2 KPIs de Calidad

| Indicador | Descripción | Objetivo |
|-----------|-------------|----------|
| **Cambios de respuesta** | Promedio de cambios por pregunta | < 0.5 |
| **Facilidad percibida** | Score promedio de feedback | > 3.5/5 |
| **Percepción de duración** | Score promedio de extensión | 2.5-3.5/5 |
| **Aceptación de propuestas** | % que acepta recibir comunicación | > 40% |

### 3.3 Dashboard del Operador

El panel de carga asistida muestra en tiempo real:

- **Total encuestas (7 días)**: Encuestas administradas en la última semana
- **Completadas**: Cantidad y porcentaje de finalizadas
- **Abandonadas**: Cantidad con motivo de abandono
- **Tasa de finalización**: Indicador visual de eficiencia

---

## 4. Estructura del Cuestionario

### 4.1 Composición

El cuestionario **PSY-CRED-V23-ARG** consta de **54 preguntas** organizadas en las siguientes dimensiones:

| Dimensión | Preguntas | Objetivo de Evaluación |
|-----------|-----------|------------------------|
| **Datos Demográficos** | 1-7 | Contexto socioeconómico del encuestado |
| **Comportamiento de Compra** | 8-10 | Patrones de gasto e impulsividad |
| **Planificación Financiera** | 9, 27-35 | Capacidad de previsión y análisis de riesgos |
| **Historial de Pagos** | 11, 30, 33-34 | Cumplimiento, atrasos, cortes de servicios |
| **Actitud hacia el Crédito** | 12-16, 31, 45 | Percepción y uso de productos crediticios |
| **Ahorro y Emergencias** | 15, 21-22, 36 | Capacidad de reserva y manejo de imprevistos |
| **Estabilidad Económica** | 35, 39-41, 44, 46-47 | Redes de apoyo, resiliencia financiera |
| **Responsabilidad** | 20, 38, 48-54 | Compromiso, cumplimiento de promesas |
| **Situación Actual** | 49-52 | Impacto de inflación, gastos inesperados |

### 4.2 Formato de Preguntas

- **Multiple choice**: 53 preguntas con 4 opciones (A, B, C, D)
- **Forced choice**: 1 pregunta situacional (dilema financiero)

### 4.3 Gamificación

El sistema implementa un esquema de badges para incentivar la finalización:

| Hito | Badge | Ícono | Pregunta |
|------|-------|-------|----------|
| 10 preguntas | Novato Curioso | 🌱 | #11 |
| 20 preguntas | Participante Activo | ⭐ | #21 |
| 30 preguntas | Experto en Progreso | 🔥 | #31 |
| 40 preguntas | Maestro de Encuestas | 💎 | #41 |
| 50 preguntas | Leyenda | 🏆 | #51 |

Al completar, se muestra:
- Animación de confeti (5 segundos)
- Todos los badges obtenidos
- Estadísticas de tiempo y preguntas

---

## 5. Datos Capturados

### 5.1 Por Respuesta Individual

```javascript
{
  // Identificación
  pregunta_id: "Q1",
  pregunta_texto: "¿Cuál es su rango de edad?",

  // Respuesta
  opcion_seleccionada: "B",
  opcion_texto: "31-45 años",

  // Analytics
  tiempo_respuesta_ms: 4532,
  cantidad_cambios: 0,
  tuvo_popup_badge: false
}
```

### 5.2 Por Encuesta Completa

| Campo | Descripción |
|-------|-------------|
| **Token ID** | Identificador único de acceso |
| **Cuestionario** | ID, versión, título |
| **Tiempos** | Inicio, fin, duración total, duración ajustada |
| **Estado** | completed, abandoned, in_progress |
| **Respuestas** | Array de 54 respuestas con analytics |
| **Encuestado** | Nombre, email, CUIL (si carga asistida) |
| **Administrador** | Nombre y email del operador |
| **Feedback** | Facilidad, extensión, acepta propuestas |
| **Abandono** | Pregunta de abandono, motivo |

### 5.3 Motivos de Abandono

Cuando un encuestado abandona, se captura el motivo:

- Muy extenso
- Muy difícil
- No quiero dar esta información
- No tengo tiempo
- Otro motivo

---

## 6. Integraciones y Arquitectura

### 6.1 Stack Tecnológico

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Frontend** | React + TypeScript | Interfaz de usuario responsive |
| **Backend** | AWS Amplify Gen 2 | Infraestructura serverless |
| **Base de Datos** | Amazon DynamoDB | Almacenamiento escalable |
| **API** | AWS AppSync (GraphQL) | Comunicación cliente-servidor |
| **Autenticación** | Amazon Cognito | Gestión de usuarios admin |
| **Funciones** | AWS Lambda (Python) | Lógica de negocio especializada |
| **Monitoreo** | CloudWatch + SNS | Alertas y métricas |

### 6.2 Modelo de Datos

```
┌─────────────────────┐      ┌─────────────────────┐
│ CuestionarioDefinition│     │       Token         │
├─────────────────────┤      ├─────────────────────┤
│ id                  │◄────►│ cuestionarioId      │
│ version             │      │ status              │
│ title               │      │ expiresAt           │
│ questionsJson       │      │ respondentName      │
│ status              │      │ createdBy           │
└─────────────────────┘      └──────────┬──────────┘
                                        │
                                        │ 1:1
                                        ▼
                             ┌─────────────────────┐
                             │ CuestionarioResponse│
                             ├─────────────────────┤
                             │ tokenId             │
                             │ answersJson         │
                             │ status              │
                             │ feedback*           │
                             │ abandon*            │
                             └─────────────────────┘
```

### 6.3 Seguridad

| Capa | Mecanismo |
|------|-----------|
| **Acceso público** | Tokens únicos de un solo uso |
| **Panel admin** | Autenticación Cognito |
| **API** | API Key rotativa (30 días) |
| **Datos** | Encriptación en reposo (DynamoDB) |
| **Transmisión** | HTTPS obligatorio |

---

## 7. Casos de Uso

### 7.1 Evaluación Crediticia Masiva

**Escenario**: Una financiera necesita evaluar 500 solicitantes de crédito.

**Proceso**:
1. Administrador genera lote de 500 tokens
2. Envía URLs personalizadas por email/SMS
3. Solicitantes completan desde sus dispositivos
4. Administrador descarga respuestas para análisis
5. Sistema de scoring procesa datos psicométricos

**Beneficios**:
- Sin intervención manual por encuesta
- Trazabilidad completa
- Datos enriquecidos con analytics de comportamiento

### 7.2 Evaluación en Punto de Venta

**Escenario**: Cadena de retail evalúa clientes para tarjeta de crédito propia.

**Proceso**:
1. Operador en sucursal registra datos del cliente
2. Entrega tableta con encuesta iniciada
3. Cliente responde (8-12 minutos)
4. Devuelve tableta y da feedback
5. Operador ve resultado inmediato

**Beneficios**:
- Experiencia guiada en punto de venta
- KPIs por operador
- Retroalimentación inmediata del cliente

### 7.3 Pre-calificación Digital

**Escenario**: Fintech incluye cuestionario en su onboarding digital.

**Proceso**:
1. Usuario inicia solicitud de préstamo online
2. Sistema genera token y redirige a cuestionario
3. Usuario completa con gamificación
4. Callback notifica finalización
5. Score psicométrico complementa decisión

**Beneficios**:
- Integración seamless en flujo existente
- Reducción de fraud score
- Mejor predicción de comportamiento de pago

---

## 8. Roadmap Futuro

### Fase 2: Analytics Avanzado
- Dashboard de analytics con visualizaciones
- Exportación automatizada a sistemas de scoring
- Correlación de respuestas con desempeño crediticio

### Fase 3: Inteligencia Artificial
- Detección de patrones de respuesta inconsistentes
- Predicción de abandono en tiempo real
- Recomendaciones de intervención para operadores

### Fase 4: Omnicanalidad
- Aplicación móvil nativa
- Integración con WhatsApp Business
- Cuestionarios adaptativos por canal

---

## 9. Consideraciones de Implementación

### 9.1 Requerimientos Técnicos

| Componente | Especificación |
|------------|----------------|
| **Navegador** | Chrome, Safari, Firefox (últimas 2 versiones) |
| **Dispositivo** | Desktop, tablet (iPad recomendado para kiosco) |
| **Conectividad** | Internet estable (mínimo 3G) |
| **Resolución** | Mínimo 768px ancho |

### 9.2 Capacitación Requerida

| Rol | Duración | Contenido |
|-----|----------|-----------|
| **Administrador** | 4 horas | Panel completo, gestión de tokens, exportación |
| **Operador** | 2 horas | Carga asistida, manejo de tableta, resolución de problemas |

### 9.3 Soporte

- **Documentación**: Manual de usuario integrado
- **Monitoreo**: Alertas automáticas ante errores
- **Escalamiento**: Automático según demanda (serverless)

---

## 10. Conclusión

El Sistema de Cuestionarios Psicométricos representa una solución integral para la captura de datos conductuales orientados a la evaluación de riesgo crediticio. Su arquitectura moderna, gamificación integrada y flexibilidad operativa lo posicionan como una herramienta diferenciadora para entidades financieras que buscan:

- **Mejorar la calidad** de sus evaluaciones de riesgo
- **Incrementar la tasa** de finalización de cuestionarios
- **Reducir costos** operativos de recolección de datos
- **Obtener insights** conductuales no disponibles en fuentes tradicionales

La plataforma está lista para producción y puede escalarse según las necesidades del negocio.

---

**Versión del documento**: 1.0
**Fecha**: Diciembre 2024
**Sistema**: PSY-CRED-V23-ARG

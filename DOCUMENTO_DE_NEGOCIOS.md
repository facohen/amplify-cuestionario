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
| **Feedback visual** | Encuesta de satisfacción con emojis intuitiva |
| **100% Responsive** | Experiencia optimizada para celular, tablet y escritorio |
| **Dashboard de productividad** | Meta diaria y KPIs en tiempo real para operadores |

---

## 2. Experiencia Multi-Dispositivo

### 2.1 Diseño Responsive Completo

El sistema está optimizado al 100% para todos los dispositivos:

| Dispositivo | Resolución | Experiencia |
|-------------|------------|-------------|
| **Celular** | < 640px | Interfaz compacta, botones grandes, tipografía legible |
| **Tablet** | 640px - 1024px | Layout balanceado, controles táctiles optimizados |
| **Desktop** | > 1024px | Vista completa, información expandida |

### 2.2 Optimizaciones por Pantalla

**Celular (Móvil)**:
- Header condensado con botón "Salir" compacto
- KPIs en grid 2x2 (4 columnas en tablet+)
- Tabs de navegación que ocupan ancho completo
- Emojis de feedback más pequeños pero táctiles
- Modales ajustados con padding reducido

**Tablet (Modo Kiosco)**:
- Experiencia ideal para administración asistida
- Controles táctiles con área de toque amplia
- Vista de detalle optimizada para mostrar información completa
- Barra de progreso diaria prominente

**Desktop**:
- Nombre del operador visible en header
- Grids expandidos (4 columnas para KPIs)
- Tipografía más grande y espaciado generoso
- Vista completa de respuestas con scroll

---

## 3. Dashboard de Productividad del Operador

### 3.1 Meta Diaria

El sistema incluye un **objetivo de productividad diario** para operadores:

```
┌──────────────────────────────────────────────────────────────────┐
│  🎯 Meta Diaria                                    2 / 5         │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │
│  Faltan 3 encuestas completadas para alcanzar tu meta            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  🎉 Meta Diaria                                    5 / 5         │
│  ██████████████████████████████████████████████████████████████  │
│  ¡Felicitaciones! Has alcanzado tu meta diaria                   │
└──────────────────────────────────────────────────────────────────┘
```

**Características**:
- Meta fija de **5 encuestas completadas por día**
- Solo cuentan encuestas con status `completed` (abandonadas no cuentan)
- Barra de progreso animada con marcadores visuales
- Cambio de color a verde cuando se alcanza la meta
- Mensaje de felicitación motivacional

### 3.2 KPIs en Tiempo Real

El dashboard muestra 4 indicadores clave actualizados automáticamente:

| KPI | Descripción | Visual |
|-----|-------------|--------|
| **Últimos 7 días** | Total de encuestas administradas | Fondo neutro |
| **Completadas** | Encuestas finalizadas exitosamente | Fondo verde |
| **Abandonadas** | Encuestas no terminadas | Fondo rojo |
| **Tasa de éxito** | % de finalización | Fondo púrpura |

### 3.3 Historial Personal

Cada operador puede ver:
- Lista de encuestas que ha administrado
- Estado de cada encuesta (completada/abandonada/en progreso)
- Detalle completo al hacer clic (respuestas, feedback, tiempos)
- Información de abandono (pregunta y motivo)

---

## 4. Sistema de Feedback Visual con Emojis

### 4.1 Feedback Post-Encuesta Completada

Al finalizar el cuestionario, se presentan **3 preguntas de satisfacción** con interfaz de emojis:

**Pregunta 1: Facilidad de uso**
```
¿Qué tan fácil te resultó completarlo?

  😫      😕      😐      🙂      😊
  Muy     Difícil Normal  Fácil   Muy
difícil                          fácil
```

**Pregunta 2: Percepción de duración**
```
¿Te pareció que el cuestionario fue muy extenso?

  😊      🙂      😐      😕      😫
  Muy    Corto  Adecuado Largo   Muy
corto                            largo
```

**Pregunta 3: Aceptación de comunicación**
```
¿Estarías dispuesto/a a recibir propuestas personalizadas?

     ┌─────────┐    ┌─────────┐
     │   Sí    │    │   No    │
     └─────────┘    └─────────┘
```

### 4.2 Feedback de Abandono

Cuando un encuestado decide abandonar, se captura información adicional:

**Motivo de abandono (obligatorio)**:
```
¿Por qué deseas abandonar el cuestionario?

  ┌────────────────────────────────────┐
  │ Muy extenso                        │
  ├────────────────────────────────────┤
  │ Muy difícil                        │
  ├────────────────────────────────────┤
  │ No quiero dar esta información     │
  ├────────────────────────────────────┤
  │ No tengo tiempo                    │
  ├────────────────────────────────────┤
  │ Otro motivo                        │
  └────────────────────────────────────┘
```

**Feedback adicional (opcional)**:
- Las mismas 3 preguntas con emojis
- No son obligatorias para abandonos
- Permite capturar percepción parcial

### 4.3 Diferencias entre Flujos

| Aspecto | Encuesta Completada | Encuesta Abandonada |
|---------|--------------------|--------------------|
| **Ícono** | ✓ Verde | ✕ Naranja |
| **Mensaje** | "¡Gracias!" | "Entendemos" |
| **Motivo abandono** | N/A | Obligatorio |
| **Preguntas emoji** | 3 obligatorias | 3 opcionales |
| **Status guardado** | `completed` | `abandoned` |

---

## 5. Modelo Operativo

### 5.1 Flujos de Operación

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

### 5.2 Flujo Detallado del Cuestionario

```
Bienvenida → Términos y Condiciones → 54 Preguntas → Feedback → Gracias
     │                │                      │             │
     │                │                      │             └── Vuelve a /encuesta
     │                │                      │
     │                │                      └── Badges cada 10 preguntas
     │                │
     │                └── Debe aceptar para continuar
     │
     └── Información del cuestionario y tiempo estimado
```

### 5.3 Roles del Sistema

| Rol | Acceso | Funciones Principales |
|-----|--------|----------------------|
| **Administrador** | Panel `/admin` | Gestionar cuestionarios, tokens, ver respuestas, descargar datos |
| **Operador de Campo** | Panel `/encuesta` | Registrar encuestados, administrar tabletas, ver KPIs propios, meta diaria |
| **Encuestado** | URL con token | Responder cuestionario, dar feedback visual |

### 5.4 Estados del Cuestionario

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

## 6. Métricas e Indicadores (KPIs)

### 6.1 KPIs Operativos

| Indicador | Descripción | Objetivo |
|-----------|-------------|----------|
| **Tasa de finalización** | Encuestas completadas / Encuestas iniciadas | > 75% |
| **Tasa de abandono** | Encuestas abandonadas / Encuestas iniciadas | < 25% |
| **Tiempo promedio** | Tiempo total de completación | 8-12 minutos |
| **Punto de abandono** | Pregunta promedio donde abandonan | Pregunta > 30 |
| **Meta diaria** | Encuestas completadas por operador por día | 5 |

### 6.2 KPIs de Calidad

| Indicador | Descripción | Objetivo |
|-----------|-------------|----------|
| **Cambios de respuesta** | Promedio de cambios por pregunta | < 0.5 |
| **Facilidad percibida** | Score promedio de feedback (emojis) | > 3.5/5 |
| **Percepción de duración** | Score promedio de extensión | 2.5-3.5/5 |
| **Aceptación de propuestas** | % que acepta recibir comunicación | > 40% |

### 6.3 KPIs de Productividad por Operador

| Indicador | Descripción | Visualización |
|-----------|-------------|---------------|
| **Completadas hoy** | Encuestas finalizadas en el día | X / 5 |
| **Progreso de meta** | Porcentaje de meta diaria | Barra de progreso |
| **Total 7 días** | Histórico semanal | Número grande |
| **Tasa personal** | % de éxito del operador | Porcentaje |

---

## 7. Estructura del Cuestionario

### 7.1 Composición

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

### 7.2 Formato de Preguntas

- **Multiple choice**: 53 preguntas con 4 opciones (A, B, C, D)
- **Forced choice**: 1 pregunta situacional (dilema financiero)

### 7.3 Gamificación

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

## 8. Datos Capturados

### 8.1 Por Respuesta Individual

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

### 8.2 Por Encuesta Completa

| Campo | Descripción |
|-------|-------------|
| **Token ID** | Identificador único de acceso |
| **Cuestionario** | ID, versión, título |
| **Tiempos** | Inicio, fin, duración total, duración ajustada |
| **Estado** | completed, abandoned, in_progress |
| **Respuestas** | Array de 54 respuestas con analytics |
| **Encuestado** | Nombre, email, CUIL (si carga asistida) |
| **Administrador** | Nombre y email del operador |
| **Feedback** | Facilidad (1-5), extensión (1-5), acepta propuestas (sí/no) |
| **Abandono** | Pregunta de abandono, motivo |

### 8.3 Estructura JSON de Exportación

```javascript
{
  tokenId: "abc123",
  submittedAt: "2024-12-25T10:30:00Z",
  startedAt: "2024-12-25T10:15:00Z",
  finishedAt: "2024-12-25T10:30:00Z",
  totalTimeMs: 900000,
  status: "completed",

  respondent: {
    name: "Juan Pérez",
    email: "juan@email.com",
    cuil: "20-12345678-9"
  },

  administrator: {
    name: "María García",
    email: "maria@empresa.com"
  },

  cuestionario: {
    id: "psy-cred-v23",
    version: "1.0",
    title: "Test Psicométrico Crediticio"
  },

  // Solo si status === "abandoned"
  abandon: {
    abandonedAtQuestion: 25,
    reason: "too_long"
  },

  // Solo si se completó feedback
  feedback: {
    easeOfUse: 4,        // 1-5 (emojis)
    surveyLength: 3,     // 1-5 (emojis)
    willingToReceive: true,
    submittedAt: "2024-12-25T10:31:00Z"
  },

  answers: [/* 54 respuestas con analytics */]
}
```

### 8.4 Motivos de Abandono

| Código | Descripción en Español |
|--------|------------------------|
| `too_long` | Muy extenso |
| `too_difficult` | Muy difícil |
| `no_share_info` | No quiero dar esta información |
| `no_time` | No tengo tiempo |
| `other` | Otro motivo |

---

## 9. Integraciones y Arquitectura

### 9.1 Stack Tecnológico

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Frontend** | React + TypeScript | Interfaz de usuario responsive |
| **Estilos** | Tailwind CSS | Diseño adaptativo mobile-first |
| **Animaciones** | Framer Motion | Transiciones fluidas |
| **Backend** | AWS Amplify Gen 2 | Infraestructura serverless |
| **Base de Datos** | Amazon DynamoDB | Almacenamiento escalable |
| **API** | AWS AppSync (GraphQL) | Comunicación cliente-servidor |
| **Autenticación** | Amazon Cognito | Gestión de usuarios admin |
| **Funciones** | AWS Lambda (Python) | Lógica de negocio especializada |
| **Monitoreo** | CloudWatch + SNS | Alertas y métricas |

### 9.2 Modelo de Datos

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
                             │ feedbackEaseOfUse   │
                             │ feedbackSurveyLength│
                             │ feedbackWillingTo...|
                             │ abandonedAtQuestion │
                             │ abandonReason       │
                             └─────────────────────┘
```

### 9.3 Seguridad

| Capa | Mecanismo |
|------|-----------|
| **Acceso público** | Tokens únicos de un solo uso |
| **Panel admin** | Autenticación Cognito |
| **API** | API Key rotativa (30 días) |
| **Datos** | Encriptación en reposo (DynamoDB) |
| **Transmisión** | HTTPS obligatorio |

---

## 10. Casos de Uso

### 10.1 Evaluación Crediticia Masiva

**Escenario**: Una financiera necesita evaluar 500 solicitantes de crédito.

**Proceso**:
1. Administrador genera lote de 500 tokens
2. Envía URLs personalizadas por email/SMS
3. Solicitantes completan desde sus dispositivos (celular/tablet/PC)
4. Administrador descarga respuestas para análisis
5. Sistema de scoring procesa datos psicométricos

**Beneficios**:
- Sin intervención manual por encuesta
- Trazabilidad completa
- Datos enriquecidos con analytics de comportamiento

### 10.2 Evaluación en Punto de Venta

**Escenario**: Cadena de retail evalúa clientes para tarjeta de crédito propia.

**Proceso**:
1. Operador en sucursal registra datos del cliente
2. Entrega tableta con encuesta iniciada
3. Cliente responde (8-12 minutos) - interfaz optimizada para tablet
4. Devuelve tableta y da feedback con emojis
5. Operador ve resultado y progreso hacia meta diaria

**Beneficios**:
- Experiencia guiada en punto de venta
- KPIs por operador con meta diaria
- Feedback visual intuitivo (emojis)
- Dashboard de productividad en tiempo real

### 10.3 Pre-calificación Digital

**Escenario**: Fintech incluye cuestionario en su onboarding digital.

**Proceso**:
1. Usuario inicia solicitud de préstamo online (celular o PC)
2. Sistema genera token y redirige a cuestionario
3. Usuario completa con gamificación - diseño responsive
4. Callback notifica finalización
5. Score psicométrico complementa decisión

**Beneficios**:
- Integración seamless en flujo existente
- Experiencia optimizada para móvil
- Reducción de fraud score
- Mejor predicción de comportamiento de pago

---

## 11. Roadmap Futuro

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

### Fase 5: Gamificación Avanzada
- Leaderboard entre operadores
- Logros desbloqueables para encuestados
- Metas semanales y mensuales

---

## 12. Consideraciones de Implementación

### 12.1 Requerimientos Técnicos

| Componente | Especificación |
|------------|----------------|
| **Navegador** | Chrome, Safari, Firefox (últimas 2 versiones) |
| **Dispositivo** | Celular, tablet, desktop - 100% responsive |
| **Conectividad** | Internet estable (mínimo 3G) |
| **Resolución mínima** | 320px ancho (optimizado desde 360px) |

### 12.2 Dispositivos Recomendados

| Modo | Dispositivo Recomendado | Alternativas |
|------|------------------------|--------------|
| **Kiosco/Asistido** | iPad 10.2" o superior | Samsung Galaxy Tab A |
| **Auto-administrado** | Cualquier smartphone moderno | Tablet, PC |
| **Administración** | Desktop o laptop | Tablet grande |

### 12.3 Capacitación Requerida

| Rol | Duración | Contenido |
|-----|----------|-----------|
| **Administrador** | 4 horas | Panel completo, gestión de tokens, exportación |
| **Operador** | 2 horas | Carga asistida, manejo de tableta, meta diaria, resolución de problemas |

### 12.4 Soporte

- **Documentación**: Manual de usuario integrado
- **Monitoreo**: Alertas automáticas ante errores
- **Escalamiento**: Automático según demanda (serverless)

---

## 13. Conclusión

El Sistema de Cuestionarios Psicométricos representa una solución integral para la captura de datos conductuales orientados a la evaluación de riesgo crediticio. Su arquitectura moderna, gamificación integrada, **diseño 100% responsive** y **dashboard de productividad** lo posicionan como una herramienta diferenciadora para entidades financieras que buscan:

- **Mejorar la calidad** de sus evaluaciones de riesgo
- **Incrementar la tasa** de finalización de cuestionarios
- **Reducir costos** operativos de recolección de datos
- **Obtener insights** conductuales no disponibles en fuentes tradicionales
- **Motivar operadores** con metas diarias y feedback visual
- **Capturar feedback** intuitivo con interfaz de emojis

La plataforma está lista para producción y puede escalarse según las necesidades del negocio.

---

**Versión del documento**: 2.0
**Fecha**: Diciembre 2024
**Sistema**: PSY-CRED-V23-ARG
**Changelog v2.0**:
- Sección 2: Experiencia Multi-Dispositivo (responsive 100%)
- Sección 3: Dashboard de Productividad con Meta Diaria
- Sección 4: Sistema de Feedback Visual con Emojis
- Actualización de casos de uso con nuevas funcionalidades

# API de Respuestas - Guía de Uso con Python

## Configuración

```python
import requests
from typing import Optional, List, Dict, Any
import os

# Configuración de la API
# SEGURIDAD: Usar variables de entorno, nunca hardcodear credenciales
API_URL = os.environ.get("CUESTIONARIO_API_URL", "https://YOUR_FUNCTION_URL")
API_KEY = os.environ.get("CUESTIONARIO_API_KEY", "")

if not API_KEY:
    raise ValueError("CUESTIONARIO_API_KEY environment variable is required")

HEADERS = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}
```

## Seguridad

- **Rate Limiting**: La API tiene un límite de 100 requests por minuto por API key
- **API Key**: Debe enviarse en el header `x-api-key` (case-insensitive)
- **HTTPS**: Todas las conexiones deben usar HTTPS
- **Almacenamiento seguro**: Nunca hardcodear la API key en el código

## Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check (sin autenticación) |
| GET | `/responses/pending` | Lista respuestas pendientes de descarga |
| GET | `/responses/{id}/download` | Descarga una respuesta y la marca como descargada |
| GET | `/responses/all` | Lista todas las respuestas (debugging) |
| POST | `/responses/{id}/unmark` | Desmarca una respuesta para re-descarga |

---

## Ejemplos de Uso

### 0. Health Check

```python
def health_check() -> bool:
    """
    Verifica que la API esté funcionando.
    No requiere autenticación.

    Returns:
        True si la API está saludable
    """
    response = requests.get(f"{API_URL}/health")
    response.raise_for_status()

    data = response.json()
    print(f"API Status: {data['status']}")
    print(f"Timestamp: {data['timestamp']}")

    return data['status'] == 'healthy'


# Ejemplo de uso
if health_check():
    print("API disponible")
```

### 1. Listar Respuestas Pendientes

```python
def listar_respuestas_pendientes() -> List[Dict[str, Any]]:
    """
    Obtiene la lista de respuestas que aún no han sido descargadas.

    Returns:
        Lista de respuestas pendientes con sus metadatos
    """
    response = requests.get(
        f"{API_URL}/responses/pending",
        headers=HEADERS
    )
    response.raise_for_status()

    data = response.json()
    print(f"Total respuestas pendientes: {data['count']}")

    return data['responses']


# Ejemplo de uso
pendientes = listar_respuestas_pendientes()
for resp in pendientes:
    print(f"ID: {resp['id']}")
    print(f"  Token: {resp['tokenId']}")
    print(f"  Cuestionario: {resp['cuestionarioId']}")
    print(f"  Enviado: {resp['submittedAt']}")
    print(f"  S3 Path: {resp['s3Path']}")
    print()
```

### 2. Descargar una Respuesta

```python
def descargar_respuesta(response_id: str) -> Dict[str, Any]:
    """
    Descarga una respuesta específica y la marca automáticamente como descargada.

    Args:
        response_id: ID del registro de descarga (no el tokenId)

    Returns:
        Diccionario con la respuesta completa del cuestionario
    """
    response = requests.get(
        f"{API_URL}/responses/{response_id}/download",
        headers=HEADERS
    )
    response.raise_for_status()

    data = response.json()
    print(f"Respuesta descargada: {data['id']}")
    print(f"Fecha de descarga: {data['downloadedAt']}")

    return data['response']  # El JSON completo de la respuesta


# Ejemplo de uso
respuesta = descargar_respuesta("abc123-def456")
print(f"Token ID: {respuesta['tokenId']}")
print(f"Cuestionario: {respuesta['cuestionario']['title']}")
print(f"Tiempo total: {respuesta['totalTimeMs']}ms")
print(f"Tiempo ajustado: {respuesta['totalTimeAdjustedMs']}ms")

for answer in respuesta['answers']:
    print(f"  Pregunta {answer['question_number']}: {answer['selected_option_text']}")
    print(f"    Tiempo: {answer['time_to_answer_ms']}ms (ajustado: {answer['time_adjusted_ms']}ms)")
```

### 3. Descargar Todas las Respuestas Pendientes

```python
def descargar_todas_pendientes() -> List[Dict[str, Any]]:
    """
    Descarga todas las respuestas pendientes en un solo proceso.

    Returns:
        Lista de respuestas descargadas
    """
    pendientes = listar_respuestas_pendientes()
    respuestas = []

    for item in pendientes:
        try:
            respuesta = descargar_respuesta(item['id'])
            respuestas.append(respuesta)
            print(f"Descargada: {item['tokenId']}")
        except requests.HTTPError as e:
            print(f"Error descargando {item['id']}: {e}")

    print(f"\nTotal descargadas: {len(respuestas)}")
    return respuestas


# Ejemplo de uso
todas = descargar_todas_pendientes()
```

### 4. Desmarcar Respuesta (para re-descarga)

```python
def desmarcar_respuesta(response_id: str) -> bool:
    """
    Desmarca una respuesta como descargada para permitir re-descarga.
    Útil para testing o reprocesamiento.

    Args:
        response_id: ID del registro de descarga

    Returns:
        True si se desmarcó correctamente
    """
    response = requests.post(
        f"{API_URL}/responses/{response_id}/unmark",
        headers=HEADERS
    )
    response.raise_for_status()

    data = response.json()
    print(f"Respuesta desmarcada: {data['id']}")
    print(f"Nuevo estado: {data['status']}")

    return True


# Ejemplo de uso
desmarcar_respuesta("abc123-def456")
```

---

## Clase Cliente Completa

```python
import requests
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class RespuestaCuestionario:
    """Representa una respuesta de cuestionario descargada."""
    token_id: str
    submitted_at: datetime
    started_at: datetime
    finished_at: datetime
    total_time_ms: int
    total_time_adjusted_ms: int
    cuestionario_id: str
    cuestionario_title: str
    answers: List[Dict[str, Any]]

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RespuestaCuestionario':
        return cls(
            token_id=data['tokenId'],
            submitted_at=datetime.fromisoformat(data['submittedAt'].replace('Z', '+00:00')),
            started_at=datetime.fromisoformat(data['startedAt'].replace('Z', '+00:00')),
            finished_at=datetime.fromisoformat(data['finishedAt'].replace('Z', '+00:00')),
            total_time_ms=data['totalTimeMs'],
            total_time_adjusted_ms=data['totalTimeAdjustedMs'],
            cuestionario_id=data['cuestionario']['id'],
            cuestionario_title=data['cuestionario']['title'],
            answers=data['answers']
        )


class RateLimitError(Exception):
    """Error cuando se excede el rate limit."""
    pass


class CuestionarioAPIClient:
    """Cliente para la API de respuestas de cuestionarios."""

    def __init__(self, api_url: str, api_key: str):
        if not api_key:
            raise ValueError("API key is required")
        self.api_url = api_url.rstrip('/')
        self.headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json"
        }

    def _request(self, method: str, endpoint: str, auth: bool = True) -> Dict[str, Any]:
        """Realiza una petición a la API."""
        url = f"{self.api_url}{endpoint}"
        headers = self.headers if auth else {"Content-Type": "application/json"}
        response = requests.request(method, url, headers=headers)

        if response.status_code == 429:
            raise RateLimitError("Rate limit exceeded (100 req/min)")

        response.raise_for_status()
        return response.json()

    def health_check(self) -> bool:
        """Verifica que la API esté funcionando (no requiere auth)."""
        data = self._request("GET", "/health", auth=False)
        return data.get('status') == 'healthy'

    def listar_pendientes(self) -> List[Dict[str, Any]]:
        """Lista respuestas pendientes de descarga."""
        data = self._request("GET", "/responses/pending")
        return data['responses']

    def listar_todas(self) -> List[Dict[str, Any]]:
        """Lista todas las respuestas (pendientes y descargadas)."""
        data = self._request("GET", "/responses/all")
        return data['responses']

    def descargar(self, response_id: str) -> RespuestaCuestionario:
        """Descarga una respuesta y la marca como descargada."""
        data = self._request("GET", f"/responses/{response_id}/download")
        return RespuestaCuestionario.from_dict(data['response'])

    def desmarcar(self, response_id: str) -> bool:
        """Desmarca una respuesta para permitir re-descarga."""
        self._request("POST", f"/responses/{response_id}/unmark")
        return True

    def descargar_todas_pendientes(self) -> List[RespuestaCuestionario]:
        """Descarga todas las respuestas pendientes."""
        pendientes = self.listar_pendientes()
        respuestas = []

        for item in pendientes:
            try:
                respuesta = self.descargar(item['id'])
                respuestas.append(respuesta)
            except requests.HTTPError as e:
                print(f"Error descargando {item['id']}: {e}")

        return respuestas


# Ejemplo de uso
if __name__ == "__main__":
    import os

    # SEGURIDAD: Usar variables de entorno
    api_url = os.environ.get("CUESTIONARIO_API_URL")
    api_key = os.environ.get("CUESTIONARIO_API_KEY")

    if not api_url or not api_key:
        print("Error: Set CUESTIONARIO_API_URL and CUESTIONARIO_API_KEY environment variables")
        exit(1)

    client = CuestionarioAPIClient(api_url=api_url, api_key=api_key)

    # Verificar conexión
    if not client.health_check():
        print("Error: API no disponible")
        exit(1)

    print("API conectada correctamente\n")

    # Listar pendientes
    pendientes = client.listar_pendientes()
    print(f"Respuestas pendientes: {len(pendientes)}")

    # Descargar todas
    try:
        respuestas = client.descargar_todas_pendientes()
    except RateLimitError:
        print("Error: Rate limit excedido, espere 1 minuto")
        exit(1)

    for resp in respuestas:
        print(f"\n{'='*50}")
        print(f"Token: {resp.token_id}")
        print(f"Cuestionario: {resp.cuestionario_title}")
        print(f"Tiempo total: {resp.total_time_ms / 1000:.1f}s")
        print(f"Tiempo ajustado: {resp.total_time_adjusted_ms / 1000:.1f}s")
        print(f"\nRespuestas ({len(resp.answers)}):")

        for a in resp.answers:
            badge = " [BADGE]" if a.get('had_badge_popup') else ""
            changed = " (cambió)" if a.get('changed_answer') else ""
            print(f"  P{a['question_number']}: {a['selected_option_text']}{badge}{changed}")
```

---

## Estructura de la Respuesta JSON

```json
{
  "tokenId": "abc123-def456-...",
  "submittedAt": "2024-01-15T10:30:00.000Z",
  "startedAt": "2024-01-15T10:25:00.000Z",
  "finishedAt": "2024-01-15T10:30:00.000Z",
  "totalTimeMs": 300000,
  "totalTimeAdjustedMs": 280000,
  "cuestionario": {
    "id": "cuestionario-v1",
    "version": "1.0",
    "title": "Cuestionario de Ejemplo",
    "description": "Descripción del cuestionario",
    "total_questions": 50,
    "creado_por": "Admin"
  },
  "answers": [
    {
      "question_number": 1,
      "question_text": "¿Cuál es tu color favorito?",
      "selected_option_key": "A",
      "selected_option_text": "A. Rojo",
      "time_to_answer_ms": 5000,
      "time_adjusted_ms": 5000,
      "changed_answer": false,
      "change_count": 0,
      "had_badge_popup": false
    },
    {
      "question_number": 11,
      "question_text": "...",
      "selected_option_key": "B",
      "selected_option_text": "B. ...",
      "time_to_answer_ms": 8000,
      "time_adjusted_ms": 4000,
      "changed_answer": true,
      "change_count": 1,
      "had_badge_popup": true
    }
  ]
}
```

---

## Notas Importantes

1. **Tiempo Ajustado**: Las preguntas 11, 21, 31, 41 y 51 muestran un popup de insignia de 4 segundos (después de completar la pregunta anterior). El `time_adjusted_ms` descuenta este tiempo del tiempo de respuesta.

2. **Autenticación**: La API Key debe enviarse en el header `x-api-key`.

3. **Idempotencia**: Descargar la misma respuesta múltiples veces la marcará como descargada solo la primera vez. Use `desmarcar` para permitir re-descarga.

4. **Errores Comunes**:
   - `401 Unauthorized`: API Key inválida o faltante
   - `404 Not Found`: ID de respuesta no existe
   - `429 Too Many Requests`: Rate limit excedido (100 req/min)
   - `400 Bad Request`: Path de S3 inválido o archivo muy grande (>10MB)
   - `500 Internal Server Error`: Error de configuración del servidor

---

## Manejo de Rate Limiting

```python
import time
from functools import wraps

def retry_on_rate_limit(max_retries: int = 3, wait_seconds: int = 60):
    """Decorator para reintentar cuando se excede el rate limit."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except RateLimitError:
                    if attempt < max_retries - 1:
                        print(f"Rate limit alcanzado, esperando {wait_seconds}s...")
                        time.sleep(wait_seconds)
                    else:
                        raise
            return None
        return wrapper
    return decorator


# Uso con el decorator
@retry_on_rate_limit(max_retries=3, wait_seconds=60)
def descargar_con_retry(client: CuestionarioAPIClient, response_id: str):
    return client.descargar(response_id)
```

---

## Obtener la URL de la API

Después del deploy con `npx ampx sandbox` o en producción, la URL se encuentra en:

```bash
# Ver outputs de Amplify
cat amplify_outputs.json | jq '.custom.responsesApiUrl'
```

O en la consola de AWS Lambda, buscar la función `responses-api` y ver la Function URL configurada.

---

## Variables de Entorno

```bash
# Configurar antes de ejecutar el script
export CUESTIONARIO_API_URL="https://xxxxx.lambda-url.us-east-1.on.aws"
export CUESTIONARIO_API_KEY="your-secure-api-key"

# Ejecutar
python mi_script.py
```

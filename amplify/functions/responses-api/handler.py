import json
import os
import time
import hmac
import boto3
from datetime import datetime
from decimal import Decimal


# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
secrets_client = boto3.client('secretsmanager')

# Cache for API key
cached_api_key = None
cache_expiry = 0
CACHE_TTL = 300  # 5 minutes in seconds

# Rate limiting
rate_limits = {}
RATE_LIMIT = 100  # requests per minute


# ============ Helpers ============

def get_cors_headers():
    return {
        'Access-Control-Allow-Origin': os.environ.get('ALLOWED_ORIGIN', '*'),
        'Access-Control-Allow-Headers': 'Content-Type,x-api-key,X-Api-Key',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Content-Type': 'application/json'
    }


class DecimalEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles Decimal types from DynamoDB"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            # Convert to int if it's a whole number, otherwise float
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super().default(obj)


def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': get_cors_headers(),
        'body': json.dumps(body, cls=DecimalEncoder)
    }


def log(level, message, **kwargs):
    """Structured logging"""
    print(json.dumps({
        'level': level,
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'message': message,
        **kwargs
    }))


# ============ Security ============

def get_api_key():
    """Get API key from Secrets Manager with caching"""
    global cached_api_key, cache_expiry

    now = time.time()
    if cached_api_key and cache_expiry > now:
        return cached_api_key

    secret_arn = os.environ.get('API_KEY_SECRET_ARN')
    if not secret_arn:
        raise Exception('API_KEY_SECRET_ARN not configured')

    result = secrets_client.get_secret_value(SecretId=secret_arn)
    secret = json.loads(result['SecretString'])

    cached_api_key = secret.get('apiKey')
    cache_expiry = now + CACHE_TTL

    return cached_api_key


def validate_api_key(provided_key):
    """Validate API key using timing-safe comparison"""
    if not provided_key:
        return False

    try:
        expected_key = get_api_key()
        if not expected_key:
            return False

        # Timing-safe comparison to prevent timing attacks
        return hmac.compare_digest(provided_key, expected_key)
    except Exception as e:
        log('ERROR', 'Failed to validate API key', error=str(e))
        return False


def check_rate_limit(api_key):
    """Simple in-memory rate limiting"""
    global rate_limits

    now = time.time()
    key_prefix = api_key[:8] if api_key else 'unknown'

    record = rate_limits.get(key_prefix, {'count': 0, 'reset_at': now + 60})

    if record['reset_at'] < now:
        record = {'count': 1, 'reset_at': now + 60}
    else:
        record['count'] += 1

    rate_limits[key_prefix] = record
    return record['count'] <= RATE_LIMIT


# ============ Route Handlers ============

def list_pending_responses():
    """List responses with downloadStatus = pending using GSI"""
    table_name = os.environ.get('CUESTIONARIO_RESPONSE_TABLE_NAME')
    if not table_name:
        return response(500, {'error': 'Configuration error'})

    table = dynamodb.Table(table_name)

    # Use GSI for efficient query instead of scan
    # GSI name follows Amplify Gen 2 convention: {model}ByDownloadStatus
    gsi_name = os.environ.get('DOWNLOAD_STATUS_GSI_NAME', 'CuestionarioResponseByDownloadStatus')

    try:
        result = table.query(
            IndexName=gsi_name,
            KeyConditionExpression='downloadStatus = :status',
            ExpressionAttributeValues={':status': 'pending'}
        )
    except Exception as e:
        # Fallback to scan if GSI doesn't exist
        log('WARN', 'GSI query failed, falling back to scan', error=str(e), gsi=gsi_name)
        result = table.scan(
            FilterExpression='downloadStatus = :status',
            ExpressionAttributeValues={':status': 'pending'}
        )

    # Map to external format
    responses_list = []
    for item in result.get('Items', []):
        responses_list.append({
            'id': item.get('id'),
            'tokenId': item.get('tokenId'),
            'cuestionarioId': item.get('cuestionarioId'),
            'cuestionarioVersion': item.get('cuestionarioVersion'),
            'cuestionarioTitle': item.get('cuestionarioTitle'),
            'startedAt': item.get('startedAt'),
            'finishedAt': item.get('finishedAt'),
            'totalTimeMs': item.get('totalTimeMs'),
            'totalTimeAdjustedMs': item.get('totalTimeAdjustedMs'),
            'status': item.get('status'),
            'downloadStatus': item.get('downloadStatus'),
            'createdAt': item.get('createdAt'),
        })

    return response(200, {
        'count': len(responses_list),
        'responses': responses_list
    })


def list_all_responses():
    """List all responses"""
    table_name = os.environ.get('CUESTIONARIO_RESPONSE_TABLE_NAME')
    if not table_name:
        return response(500, {'error': 'Configuration error'})

    table = dynamodb.Table(table_name)
    result = table.scan()

    # Map to external format
    responses_list = []
    for item in result.get('Items', []):
        responses_list.append({
            'id': item.get('id'),
            'tokenId': item.get('tokenId'),
            'cuestionarioId': item.get('cuestionarioId'),
            'cuestionarioVersion': item.get('cuestionarioVersion'),
            'cuestionarioTitle': item.get('cuestionarioTitle'),
            'startedAt': item.get('startedAt'),
            'finishedAt': item.get('finishedAt'),
            'totalTimeMs': item.get('totalTimeMs'),
            'totalTimeAdjustedMs': item.get('totalTimeAdjustedMs'),
            'status': item.get('status'),
            'downloadStatus': item.get('downloadStatus'),
            'downloadedAt': item.get('downloadedAt'),
            'downloadedBy': item.get('downloadedBy'),
            'createdAt': item.get('createdAt'),
        })

    return response(200, {
        'count': len(responses_list),
        'responses': responses_list
    })


def download_and_mark_response(response_id):
    """Download response and mark as downloaded"""
    table_name = os.environ.get('CUESTIONARIO_RESPONSE_TABLE_NAME')
    if not table_name:
        return response(500, {'error': 'Configuration error'})

    table = dynamodb.Table(table_name)

    # Get the response
    result = table.get_item(Key={'id': response_id})
    item = result.get('Item')

    if not item:
        return response(404, {'error': 'Response not found'})

    # Mark as downloaded
    now = datetime.utcnow().isoformat() + 'Z'
    table.update_item(
        Key={'id': response_id},
        UpdateExpression='SET downloadStatus = :status, downloadedAt = :downloadedAt, downloadedBy = :downloadedBy',
        ExpressionAttributeValues={
            ':status': 'downloaded',
            ':downloadedAt': now,
            ':downloadedBy': 'external-api'
        }
    )

    log('INFO', 'Response downloaded successfully', id=response_id)

    # Return full response data
    return response(200, {
        'id': response_id,
        'downloadedAt': now,
        'response': {
            'tokenId': item.get('tokenId'),
            'cuestionarioId': item.get('cuestionarioId'),
            'cuestionarioVersion': item.get('cuestionarioVersion'),
            'cuestionarioTitle': item.get('cuestionarioTitle'),
            'startedAt': item.get('startedAt'),
            'finishedAt': item.get('finishedAt'),
            'totalTimeMs': item.get('totalTimeMs'),
            'totalTimeAdjustedMs': item.get('totalTimeAdjustedMs'),
            'status': item.get('status'),
            'answers': item.get('answersJson'),
        }
    })


def unmark_response(response_id):
    """Unmark response for re-download"""
    table_name = os.environ.get('CUESTIONARIO_RESPONSE_TABLE_NAME')
    if not table_name:
        return response(500, {'error': 'Configuration error'})

    table = dynamodb.Table(table_name)

    # Reset download status
    table.update_item(
        Key={'id': response_id},
        UpdateExpression='SET downloadStatus = :status REMOVE downloadedAt, downloadedBy',
        ExpressionAttributeValues={
            ':status': 'pending'
        }
    )

    log('INFO', 'Response unmarked', id=response_id)

    return response(200, {
        'id': response_id,
        'status': 'pending',
        'message': 'Response unmarked for re-download'
    })


# ============ Main Handler ============

def handler(event, context):
    """Main Lambda handler"""
    method = event.get('requestContext', {}).get('http', {}).get('method', 'GET')
    path = event.get('requestContext', {}).get('http', {}).get('path', '/')
    headers = event.get('headers', {})

    log('INFO', 'Request received', method=method, path=path)

    # Health check (no auth required)
    if method == 'GET' and path == '/health':
        return response(200, {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        })

    # Handle CORS preflight
    if method == 'OPTIONS':
        return response(200, {})

    # Get API key from headers (case-insensitive)
    api_key = headers.get('x-api-key') or headers.get('X-Api-Key') or ''

    # Validate API key
    if not validate_api_key(api_key):
        log('AUDIT', 'Authentication failed', path=path, method=method)
        return response(401, {'error': 'Unauthorized', 'message': 'Invalid or missing API key'})

    # Check rate limit
    if not check_rate_limit(api_key):
        log('WARN', 'Rate limit exceeded', api_key_prefix=api_key[:8] + '...')
        return response(429, {'error': 'Too many requests', 'message': 'Rate limit exceeded'})

    try:
        # GET /responses/pending
        if method == 'GET' and path == '/responses/pending':
            log('AUDIT', 'Listing pending responses')
            return list_pending_responses()

        # GET /responses/all
        if method == 'GET' and path == '/responses/all':
            log('AUDIT', 'Listing all responses')
            return list_all_responses()

        # GET /responses/{id}/download
        if method == 'GET' and path.startswith('/responses/') and path.endswith('/download'):
            parts = path.split('/')
            if len(parts) >= 3:
                response_id = parts[2]
                log('AUDIT', 'Downloading response', id=response_id)
                return download_and_mark_response(response_id)

        # POST /responses/{id}/unmark
        if method == 'POST' and path.startswith('/responses/') and path.endswith('/unmark'):
            parts = path.split('/')
            if len(parts) >= 3:
                response_id = parts[2]
                log('AUDIT', 'Unmarking response', id=response_id)
                return unmark_response(response_id)

        log('WARN', 'Route not found', path=path, method=method)
        return response(404, {'error': 'Not found'})

    except Exception as e:
        log('ERROR', 'Handler error', error=str(e))
        return response(500, {'error': 'Internal server error'})

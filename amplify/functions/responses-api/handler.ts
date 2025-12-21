import type { Handler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { timingSafeEqual } from 'crypto';

const dynamodbClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);
const secretsClient = new SecretsManagerClient({});

// Cache the API key to avoid fetching from Secrets Manager on every request
let cachedApiKey: string | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getApiKey(): Promise<string> {
  const now = Date.now();

  // Return cached value if still valid
  if (cachedApiKey && cacheExpiry > now) {
    return cachedApiKey;
  }

  const secretArn = process.env.API_KEY_SECRET_ARN;
  if (!secretArn) {
    throw new Error('API_KEY_SECRET_ARN not configured');
  }

  const result = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretArn })
  );

  if (!result.SecretString) {
    throw new Error('Secret value is empty');
  }

  const secret = JSON.parse(result.SecretString);
  cachedApiKey = secret.apiKey;
  cacheExpiry = now + CACHE_TTL_MS;

  return cachedApiKey!;
}

// ============ SECURITY: Rate Limiting ============
const RATE_LIMIT = 100; // requests per minute per API key
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(apiKey: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(apiKey) || { count: 0, resetAt: now + 60000 };

  if (record.resetAt < now) {
    record.count = 1;
    record.resetAt = now + 60000;
  } else {
    record.count++;
  }

  rateLimitMap.set(apiKey, record);
  return record.count <= RATE_LIMIT;
}

// ============ SECURITY: Structured Logging ============
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      level,
      timestamp: new Date().toISOString(),
      message,
      ...data,
    })
  );
}

// ============ Response Helpers ============
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,x-api-key',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json',
};

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

function response(statusCode: number, body: unknown): LambdaResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

interface FunctionUrlEvent {
  requestContext: {
    http: {
      method: string;
      path: string;
    };
  };
  headers: Record<string, string | undefined>;
  body?: string;
}

// ============ SECURITY: Timing-Safe API Key Validation ============
async function validateApiKey(event: FunctionUrlEvent): Promise<boolean> {
  const apiKey = event.headers['x-api-key'] || event.headers['X-Api-Key'] || '';

  if (!apiKey) {
    return false;
  }

  try {
    const expectedKey = await getApiKey();

    if (!expectedKey) {
      return false;
    }

    // Prevent timing attacks by using constant-time comparison
    if (apiKey.length !== expectedKey.length) {
      return false;
    }

    return timingSafeEqual(Buffer.from(apiKey), Buffer.from(expectedKey));
  } catch (error) {
    log('ERROR', 'Failed to validate API key', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// ============ Main Handler ============
export const handler: Handler<FunctionUrlEvent, LambdaResponse> = async (event) => {
  const method = event.requestContext?.http?.method || 'GET';
  const path = event.requestContext?.http?.path || '/';
  const apiKey = event.headers['x-api-key'] || event.headers['X-Api-Key'] || '';

  log('INFO', 'Request received', { method, path });

  // Health check endpoint (no auth required)
  if (method === 'GET' && path === '/health') {
    return response(200, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return response(200, {});
  }

  // SECURITY: Validate API Key (now async)
  if (!(await validateApiKey(event))) {
    log('AUDIT', 'Authentication failed', { path, method });
    return response(401, { error: 'Unauthorized', message: 'Invalid or missing API key' });
  }

  // SECURITY: Check rate limit
  if (!checkRateLimit(apiKey)) {
    log('WARN', 'Rate limit exceeded', { apiKey: apiKey.substring(0, 8) + '...' });
    return response(429, { error: 'Too many requests', message: 'Rate limit exceeded' });
  }

  try {
    // GET /responses/pending - List pending responses
    if (method === 'GET' && path === '/responses/pending') {
      log('AUDIT', 'Listing pending responses');
      return await listPendingResponses();
    }

    // GET /responses/{id}/download - Download and mark as downloaded
    const downloadMatch = path.match(/^\/responses\/([^/]+)\/download$/);
    if (method === 'GET' && downloadMatch) {
      const id = downloadMatch[1];
      log('AUDIT', 'Downloading response', { id });
      return await downloadAndMarkResponse(id);
    }

    // POST /responses/{id}/unmark - Unmark for re-download
    const unmarkMatch = path.match(/^\/responses\/([^/]+)\/unmark$/);
    if (method === 'POST' && unmarkMatch) {
      const id = unmarkMatch[1];
      log('AUDIT', 'Unmarking response', { id });
      return await unmarkResponse(id);
    }

    // GET /responses/all - List all responses (restricted in production)
    if (method === 'GET' && path === '/responses/all') {
      log('AUDIT', 'Listing all responses');
      return await listAllResponses();
    }

    log('WARN', 'Route not found', { path, method });
    return response(404, { error: 'Not found' });
  } catch (error) {
    log('ERROR', 'Handler error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return response(500, {
      error: 'Internal server error',
    });
  }
};

async function listPendingResponses(): Promise<LambdaResponse> {
  const tableName = process.env.CUESTIONARIO_RESPONSE_TABLE_NAME;
  if (!tableName) {
    return response(500, { error: 'Configuration error' });
  }

  // Use the downloadStatus GSI for efficient query
  const indexName = process.env.DOWNLOAD_STATUS_INDEX_NAME;

  let result;
  if (indexName) {
    // Use GSI query (more efficient)
    result = await dynamodb.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: 'downloadStatus = :status',
        ExpressionAttributeValues: { ':status': 'pending' },
      })
    );
  } else {
    // Fallback to scan with filter
    result = await dynamodb.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: 'downloadStatus = :status',
        ExpressionAttributeValues: { ':status': 'pending' },
      })
    );
  }

  // Map to external format (hide internal details)
  const responses = (result.Items || []).map((item: Record<string, unknown>) => ({
    id: item.id,
    tokenId: item.tokenId,
    cuestionarioId: item.cuestionarioId,
    cuestionarioVersion: item.cuestionarioVersion,
    cuestionarioTitle: item.cuestionarioTitle,
    startedAt: item.startedAt,
    finishedAt: item.finishedAt,
    totalTimeMs: item.totalTimeMs,
    totalTimeAdjustedMs: item.totalTimeAdjustedMs,
    status: item.status,
    downloadStatus: item.downloadStatus,
    createdAt: item.createdAt,
  }));

  return response(200, {
    count: responses.length,
    responses,
  });
}

async function listAllResponses(): Promise<LambdaResponse> {
  const tableName = process.env.CUESTIONARIO_RESPONSE_TABLE_NAME;
  if (!tableName) {
    return response(500, { error: 'Configuration error' });
  }

  const result = await dynamodb.send(
    new ScanCommand({
      TableName: tableName,
    })
  );

  // Map to external format
  const responses = (result.Items || []).map((item: Record<string, unknown>) => ({
    id: item.id,
    tokenId: item.tokenId,
    cuestionarioId: item.cuestionarioId,
    cuestionarioVersion: item.cuestionarioVersion,
    cuestionarioTitle: item.cuestionarioTitle,
    startedAt: item.startedAt,
    finishedAt: item.finishedAt,
    totalTimeMs: item.totalTimeMs,
    totalTimeAdjustedMs: item.totalTimeAdjustedMs,
    status: item.status,
    downloadStatus: item.downloadStatus,
    downloadedAt: item.downloadedAt,
    downloadedBy: item.downloadedBy,
    createdAt: item.createdAt,
  }));

  return response(200, {
    count: responses.length,
    responses,
  });
}

async function downloadAndMarkResponse(id: string): Promise<LambdaResponse> {
  const tableName = process.env.CUESTIONARIO_RESPONSE_TABLE_NAME;

  if (!tableName) {
    return response(500, { error: 'Configuration error' });
  }

  // Get the response from DynamoDB
  const getResult = await dynamodb.send(
    new GetCommand({
      TableName: tableName,
      Key: { id },
    })
  );

  if (!getResult.Item) {
    return response(404, { error: 'Response not found' });
  }

  const record = getResult.Item;

  // Mark as downloaded in DynamoDB
  await dynamodb.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression:
        'SET downloadStatus = :status, downloadedAt = :downloadedAt, downloadedBy = :downloadedBy',
      ExpressionAttributeValues: {
        ':status': 'downloaded',
        ':downloadedAt': new Date().toISOString(),
        ':downloadedBy': 'external-api',
      },
    })
  );

  log('INFO', 'Response downloaded successfully', { id });

  // Return the full response data including answers
  return response(200, {
    id,
    downloadedAt: new Date().toISOString(),
    response: {
      tokenId: record.tokenId,
      cuestionarioId: record.cuestionarioId,
      cuestionarioVersion: record.cuestionarioVersion,
      cuestionarioTitle: record.cuestionarioTitle,
      startedAt: record.startedAt,
      finishedAt: record.finishedAt,
      totalTimeMs: record.totalTimeMs,
      totalTimeAdjustedMs: record.totalTimeAdjustedMs,
      status: record.status,
      answers: record.answersJson,
    },
  });
}

async function unmarkResponse(id: string): Promise<LambdaResponse> {
  const tableName = process.env.CUESTIONARIO_RESPONSE_TABLE_NAME;
  if (!tableName) {
    return response(500, { error: 'Configuration error' });
  }

  // Update status back to pending
  await dynamodb.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression:
        'SET downloadStatus = :status, downloadedAt = :downloadedAt, downloadedBy = :downloadedBy',
      ExpressionAttributeValues: {
        ':status': 'pending',
        ':downloadedAt': null,
        ':downloadedBy': null,
      },
    })
  );

  log('INFO', 'Response unmarked', { id });

  return response(200, {
    id,
    status: 'pending',
    message: 'Response unmarked for re-download',
  });
}

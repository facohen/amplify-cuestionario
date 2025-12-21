import type { Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { timingSafeEqual } from 'crypto';

const s3 = new S3Client({});
const dynamodbClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);

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
function validateApiKey(event: FunctionUrlEvent): boolean {
  const apiKey = event.headers['x-api-key'] || event.headers['X-Api-Key'] || '';
  const expectedKey = process.env.EXTERNAL_API_KEY || '';

  if (!apiKey || !expectedKey) {
    return false;
  }

  // Prevent timing attacks by using constant-time comparison
  if (apiKey.length !== expectedKey.length) {
    return false;
  }

  try {
    return timingSafeEqual(Buffer.from(apiKey), Buffer.from(expectedKey));
  } catch {
    return false;
  }
}

// ============ SECURITY: S3 Path Validation ============
function isValidS3Path(s3Path: string): boolean {
  // Only allow paths matching: respuestas/{cuestionarioId}/{tokenId}_{timestamp}.json
  const pathRegex = /^respuestas\/[\w-]+\/[\w-]+\.json$/;
  return pathRegex.test(s3Path);
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

  // SECURITY: Validate API Key
  if (!validateApiKey(event)) {
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
  const tableName = process.env.RESPONSE_DOWNLOAD_TABLE_NAME;
  if (!tableName) {
    return response(500, { error: 'Configuration error' });
  }

  const result = await dynamodb.send(
    new ScanCommand({
      TableName: tableName,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': 'pending' },
    })
  );

  return response(200, {
    count: result.Items?.length || 0,
    responses: result.Items || [],
  });
}

async function listAllResponses(): Promise<LambdaResponse> {
  const tableName = process.env.RESPONSE_DOWNLOAD_TABLE_NAME;
  if (!tableName) {
    return response(500, { error: 'Configuration error' });
  }

  const result = await dynamodb.send(
    new ScanCommand({
      TableName: tableName,
    })
  );

  return response(200, {
    count: result.Items?.length || 0,
    responses: result.Items || [],
  });
}

async function downloadAndMarkResponse(id: string): Promise<LambdaResponse> {
  const tableName = process.env.RESPONSE_DOWNLOAD_TABLE_NAME;
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!tableName || !bucketName) {
    return response(500, { error: 'Configuration error' });
  }

  // Get the download record from DynamoDB
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
  const s3Path = record.s3Path as string;

  // SECURITY: Validate S3 path format
  if (!isValidS3Path(s3Path)) {
    log('WARN', 'Invalid S3 path format', { id });
    return response(400, { error: 'Invalid path format' });
  }

  // Download the actual response JSON from S3
  try {
    const s3Result = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Path,
      })
    );

    // SECURITY: Check file size (max 10MB)
    const contentLength = s3Result.ContentLength || 0;
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (contentLength > MAX_FILE_SIZE) {
      log('WARN', 'File too large', { id, size: contentLength });
      return response(400, { error: 'File too large' });
    }

    const responseBody = await s3Result.Body?.transformToString();
    if (!responseBody) {
      return response(500, { error: 'Failed to read file' });
    }

    let responseData;
    try {
      responseData = JSON.parse(responseBody);
    } catch {
      log('ERROR', 'Invalid JSON in S3', { id });
      return response(500, { error: 'Invalid file format' });
    }

    // Mark as downloaded in DynamoDB
    await dynamodb.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression:
          'SET #status = :status, downloadedAt = :downloadedAt, downloadedBy = :downloadedBy',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': 'downloaded',
          ':downloadedAt': new Date().toISOString(),
          ':downloadedBy': 'external-api',
        },
      })
    );

    log('INFO', 'Response downloaded successfully', { id });

    return response(200, {
      id,
      downloadedAt: new Date().toISOString(),
      response: responseData,
    });
  } catch (error) {
    log('ERROR', 'S3 download error', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return response(500, { error: 'Failed to download response' });
  }
}

async function unmarkResponse(id: string): Promise<LambdaResponse> {
  const tableName = process.env.RESPONSE_DOWNLOAD_TABLE_NAME;
  if (!tableName) {
    return response(500, { error: 'Configuration error' });
  }

  // Update status back to pending
  await dynamodb.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression:
        'SET #status = :status, downloadedAt = :downloadedAt, downloadedBy = :downloadedBy',
      ExpressionAttributeNames: { '#status': 'status' },
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

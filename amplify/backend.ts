import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { responsesApi } from './functions/responses-api/resource';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';

const backend = defineBackend({
  auth,
  data,
  storage,
  responsesApi,
});

// Create a function URL for the responses API
const responsesApiLambda = backend.responsesApi.resources.lambda;

// SECURITY: Restrict CORS to specific origins
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  // Add your production domain here after deployment
  // 'https://your-app.amplifyapp.com',
];

const functionUrl = responsesApiLambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE, // API Key validation is done in the handler
  cors: {
    allowedOrigins,
    allowedHeaders: ['Content-Type', 'x-api-key', 'X-Api-Key'],
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    maxAge: 86400, // 24 hours
  },
});

// Grant the Lambda access to the ResponseDownload table
const responseDownloadTable = backend.data.resources.tables['ResponseDownload'];
responseDownloadTable.grantReadWriteData(responsesApiLambda);

// Grant the Lambda access to S3 bucket
const storageBucket = backend.storage.resources.bucket;
storageBucket.grantRead(responsesApiLambda);

// Add environment variables to Lambda
responsesApiLambda.addEnvironment('RESPONSE_DOWNLOAD_TABLE_NAME', responseDownloadTable.tableName);
responsesApiLambda.addEnvironment('S3_BUCKET_NAME', storageBucket.bucketName);
responsesApiLambda.addEnvironment('EXTERNAL_API_KEY', process.env.EXTERNAL_API_KEY || 'dev-api-key-change-in-production');

// Output the function URL
backend.addOutput({
  custom: {
    responsesApiUrl: functionUrl.url,
  },
});

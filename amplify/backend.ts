import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { responsesApi } from './functions/responses-api/resource';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Function } from 'aws-cdk-lib/aws-lambda';

const backend = defineBackend({
  auth,
  data,
  storage,
  responsesApi,
});

// Create a function URL for the responses API
const responsesApiLambda = backend.responsesApi.resources.lambda;

const functionUrl = responsesApiLambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE, // API Key validation is done in the handler
  cors: {
    allowedOrigins: ['*'], // Lambda handler validates API key for security
    allowedHeaders: ['Content-Type', 'x-api-key', 'X-Api-Key'],
    allowedMethods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.OPTIONS],
    maxAge: Duration.hours(24),
  },
});

// Grant the Lambda access to the ResponseDownload table
const responseDownloadTable = backend.data.resources.tables['ResponseDownload'];
responseDownloadTable.grantReadWriteData(responsesApiLambda);

// Grant the Lambda access to S3 bucket
const storageBucket = backend.storage.resources.bucket;
storageBucket.grantRead(responsesApiLambda);

// Add environment variables to Lambda (cast to Function to access addEnvironment)
const lambdaFn = responsesApiLambda as unknown as Function;
lambdaFn.addEnvironment('RESPONSE_DOWNLOAD_TABLE_NAME', responseDownloadTable.tableName);
lambdaFn.addEnvironment('S3_BUCKET_NAME', storageBucket.bucketName);
lambdaFn.addEnvironment('EXTERNAL_API_KEY', 'dev-api-key-change-in-production');

// Output the function URL
backend.addOutput({
  custom: {
    responsesApiUrl: functionUrl.url,
  },
});

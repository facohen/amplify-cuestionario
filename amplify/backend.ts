import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { responsesApi } from './functions/responses-api/resource';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Function } from 'aws-cdk-lib/aws-lambda';

const backend = defineBackend({
  auth,
  data,
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

// Grant the Lambda access to the CuestionarioResponse table
const cuestionarioResponseTable = backend.data.resources.tables['CuestionarioResponse'];
cuestionarioResponseTable.grantReadWriteData(responsesApiLambda);

// Add environment variables to Lambda (cast to Function to access addEnvironment)
const lambdaFn = responsesApiLambda as unknown as Function;
lambdaFn.addEnvironment('CUESTIONARIO_RESPONSE_TABLE_NAME', cuestionarioResponseTable.tableName);
lambdaFn.addEnvironment('EXTERNAL_API_KEY', 'dev-api-key-change-in-production');

// Output the function URL
backend.addOutput({
  custom: {
    responsesApiUrl: functionUrl.url,
  },
});

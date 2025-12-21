import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { FunctionUrlAuthType, HttpMethod, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

const backend = defineBackend({
  auth,
  data,
});

// Create the responses API Lambda using NodejsFunction for proper bundling
const responsesApiLambda = new NodejsFunction(backend.stack, 'ResponsesApiFunction', {
  functionName: 'responses-api',
  entry: new URL('./functions/responses-api/handler.ts', import.meta.url).pathname,
  handler: 'handler',
  runtime: Runtime.NODEJS_20_X,
  timeout: Duration.seconds(30),
  bundling: {
    externalModules: [
      '@aws-sdk/client-dynamodb',
      '@aws-sdk/lib-dynamodb',
      '@aws-sdk/client-secrets-manager',
    ],
  },
});

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

// Create a secret for the external API key
const apiKeySecret = new Secret(backend.stack, 'ExternalApiKeySecret', {
  secretName: 'cuestionario/external-api-key',
  description: 'API key for external systems to access the responses API',
  generateSecretString: {
    secretStringTemplate: JSON.stringify({}),
    generateStringKey: 'apiKey',
    excludePunctuation: true,
    passwordLength: 32,
  },
});

// Grant Lambda permission to read the secret
apiKeySecret.grantRead(responsesApiLambda);

// Add environment variables to Lambda
responsesApiLambda.addEnvironment('CUESTIONARIO_RESPONSE_TABLE_NAME', cuestionarioResponseTable.tableName);
responsesApiLambda.addEnvironment('API_KEY_SECRET_ARN', apiKeySecret.secretArn);

// Output the function URL
backend.addOutput({
  custom: {
    responsesApiUrl: functionUrl.url,
  },
});

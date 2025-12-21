import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { responsesApi } from './functions/responses-api/resource';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

const backend = defineBackend({
  auth,
  data,
  responsesApi,
});

// Get the Lambda function from Amplify's defineFunction
const responsesApiLambda = backend.responsesApi.resources.lambda;

// Add function URL
const functionUrl = responsesApiLambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE, // API Key validation is done in the handler
  cors: {
    allowedOrigins: ['*'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'X-Api-Key'],
    allowedMethods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.OPTIONS],
    maxAge: Duration.hours(24),
  },
});

// Grant the Lambda access to the CuestionarioResponse table
const cuestionarioResponseTable = backend.data.resources.tables['CuestionarioResponse'];
cuestionarioResponseTable.grantReadWriteData(responsesApiLambda);

// Reference existing secret for the external API key (created manually in AWS Secrets Manager)
const apiKeySecret = Secret.fromSecretNameV2(
  backend.stack,
  'ExternalApiKeySecret',
  'cuestionario/external-api-key'
);

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

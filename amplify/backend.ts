import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { FunctionUrlAuthType, HttpMethod, Runtime, Code, Function, Tracing } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Alarm, ComparisonOperator, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Topic } from 'aws-cdk-lib/aws-sns';

const backend = defineBackend({
  auth,
  data,
});

// Create Python Lambda directly with CDK (Amplify defineFunction only supports JS/TS)
// Note: functionName is omitted to let CloudFormation generate unique names per environment
const responsesApiLambda = new Function(backend.stack, 'ResponsesApiFunction', {
  runtime: Runtime.PYTHON_3_12,
  handler: 'handler.handler',
  code: Code.fromAsset(new URL('./functions/responses-api', import.meta.url).pathname),
  timeout: Duration.seconds(30),
  tracing: Tracing.ACTIVE, // Enable X-Ray tracing
});

// Add function URL
const functionUrl = responsesApiLambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE, // API Key validation is done in the handler
  cors: {
    allowedOrigins: ['*'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'X-Api-Key'],
    allowedMethods: [HttpMethod.GET, HttpMethod.POST], // OPTIONS handled automatically by Lambda Function URL
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

// ============ CloudWatch Alarms ============

// Create SNS topic for alerts (optional - can be subscribed to manually in AWS Console)
// Note: topicName is omitted to let CloudFormation generate unique names per environment
const alertsTopic = new Topic(backend.stack, 'ResponsesApiAlerts', {
  displayName: 'Responses API Alerts',
});

// Alarm: Lambda errors > 5 in 5 minutes
// Note: alarmName is omitted to let CloudFormation generate unique names per environment
const errorAlarm = new Alarm(backend.stack, 'ResponsesApiErrorAlarm', {
  alarmDescription: 'Lambda function errors exceed threshold',
  metric: responsesApiLambda.metricErrors({
    period: Duration.minutes(5),
    statistic: 'Sum',
  }),
  threshold: 5,
  evaluationPeriods: 1,
  comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
  treatMissingData: TreatMissingData.NOT_BREACHING,
});
errorAlarm.addAlarmAction(new SnsAction(alertsTopic));

// Alarm: Lambda duration > 10 seconds (indicating slow performance)
// Note: alarmName is omitted to let CloudFormation generate unique names per environment
const durationAlarm = new Alarm(backend.stack, 'ResponsesApiDurationAlarm', {
  alarmDescription: 'Lambda function taking too long to respond',
  metric: responsesApiLambda.metricDuration({
    period: Duration.minutes(5),
    statistic: 'Average',
  }),
  threshold: 10000, // 10 seconds in milliseconds
  evaluationPeriods: 2,
  comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
  treatMissingData: TreatMissingData.NOT_BREACHING,
});
durationAlarm.addAlarmAction(new SnsAction(alertsTopic));

// Alarm: Throttles > 0 (indicates capacity issues)
// Note: alarmName is omitted to let CloudFormation generate unique names per environment
const throttleAlarm = new Alarm(backend.stack, 'ResponsesApiThrottleAlarm', {
  alarmDescription: 'Lambda function is being throttled',
  metric: responsesApiLambda.metricThrottles({
    period: Duration.minutes(5),
    statistic: 'Sum',
  }),
  threshold: 0,
  evaluationPeriods: 1,
  comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
  treatMissingData: TreatMissingData.NOT_BREACHING,
});
throttleAlarm.addAlarmAction(new SnsAction(alertsTopic));

// Output the function URL
backend.addOutput({
  custom: {
    responsesApiUrl: functionUrl.url,
    alertsTopicArn: alertsTopic.topicArn,
  },
});

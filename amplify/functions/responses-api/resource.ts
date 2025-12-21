import { defineFunction } from '@aws-amplify/backend';

export const responsesApi = defineFunction({
  name: 'responses-api',
  entry: './handler.py',
  runtime: 20, // Python 3.12
  timeoutSeconds: 30,
});

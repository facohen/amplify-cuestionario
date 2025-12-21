import { defineFunction } from '@aws-amplify/backend';

export const responsesApi = defineFunction({
  name: 'responses-api',
  entry: './handler.ts',
  timeoutSeconds: 30,
});

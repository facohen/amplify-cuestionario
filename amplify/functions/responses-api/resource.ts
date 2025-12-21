import { defineFunction } from '@aws-amplify/backend';

export const responsesApi = defineFunction({
  name: 'responses-api',
  entry: './handler.ts',
  timeoutSeconds: 30,
  bundling: {
    externalModules: [
      '@aws-sdk/client-dynamodb',
      '@aws-sdk/lib-dynamodb',
      '@aws-sdk/client-secrets-manager',
    ],
  },
});

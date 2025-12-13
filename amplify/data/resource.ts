import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // Token de acceso único para el cuestionario
  Token: a
    .model({
      cuestionarioId: a.string().required(),
      expiresAt: a.datetime(),
      usedAt: a.datetime(),
      status: a.enum(['active', 'used', 'expired', 'revoked']),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read', 'update']),
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
    ]),

  // Definición del cuestionario
  CuestionarioDefinition: a
    .model({
      version: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      totalQuestions: a.integer().required(),
      creadoPor: a.string(),
      status: a.enum(['draft', 'active', 'archived']),
      questionsJson: a.json().required(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
    ]),

  // Respuestas del cuestionario
  CuestionarioResponse: a
    .model({
      tokenId: a.string().required(),
      cuestionarioId: a.string().required(),
      cuestionarioVersion: a.string().required(),
      startedAt: a.datetime().required(),
      finishedAt: a.datetime(),
      totalTimeMs: a.integer(),
      answersJson: a.json().required(),
      status: a.enum(['in_progress', 'completed', 'abandoned']),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['create', 'update']),
      allow.authenticated().to(['read', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

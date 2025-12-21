import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'cuestionariosStorage',
  access: (allow) => ({
    // Cuestionarios JSON - públicos para lectura, admin para escritura
    'cuestionarios/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    // Respuestas - guest puede escribir, authenticated puede todo
    // Path: respuestas/{cuestionarioId}/{tokenId}_{timestamp}.json
    'respuestas/*': [
      allow.guest.to(['write']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});

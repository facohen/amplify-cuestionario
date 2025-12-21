import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'cuestionariosStorage',
  access: (allow) => ({
    // Cuestionarios JSON - públicos para lectura, admin para escritura
    'cuestionarios/*': [
      allow.guest.to(['read', 'list']),
      allow.authenticated.to(['read', 'write', 'delete', 'list']),
    ],
    // Respuestas - guest puede escribir en subdirectorios
    // Path: respuestas/{cuestionarioId}/{tokenId}_{timestamp}.json
    'respuestas/*': [
      allow.guest.to(['write', 'list']),
      allow.authenticated.to(['read', 'write', 'delete', 'list']),
    ],
    'respuestas/*/*': [
      allow.guest.to(['write']),
      allow.authenticated.to(['read', 'write', 'delete', 'list']),
    ],
  }),
});

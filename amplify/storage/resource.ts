import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'cuestionariosStorage',
  access: (allow) => ({
    // Cuestionarios JSON - públicos para lectura, admin para escritura
    'cuestionarios/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    // Respuestas - solo admin puede leer, público puede escribir
    'respuestas/*': [
      allow.guest.to(['write']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});

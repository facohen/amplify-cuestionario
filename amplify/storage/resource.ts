import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'cuestionariosStorage',
  access: (allow) => ({
    // Cuestionarios JSON - públicos para lectura, admin para escritura
    'cuestionarios/*': [
      allow.guest.to(['read', 'list']),
      allow.authenticated.to(['read', 'write', 'delete', 'list']),
    ],
    // SECURITY: Respuestas - guest solo puede escribir (submit), no leer otros
    // La lectura de respuestas solo es para admin autenticado
    'respuestas/*': [
      allow.guest.to(['write']), // Solo escribir su propia respuesta
      allow.authenticated.to(['read', 'write', 'delete', 'list']),
    ],
  }),
});

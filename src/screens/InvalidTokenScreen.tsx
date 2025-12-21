import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function InvalidTokenScreen() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  const messages: Record<string, { title: string; description: string; emoji: string }> = {
    used: {
      title: 'Token ya utilizado',
      description: 'Este enlace ya ha sido usado para completar el cuestionario.',
      emoji: '🔒',
    },
    expired: {
      title: 'Token expirado',
      description: 'Este enlace ha expirado y ya no es valido.',
      emoji: '⏰',
    },
    invalid: {
      title: 'Token invalido',
      description: 'El enlace que intentas usar no es valido.',
      emoji: '❌',
    },
    revoked: {
      title: 'Token revocado',
      description: 'Este enlace ha sido revocado por el administrador.',
      emoji: '🚫',
    },
    no_active: {
      title: 'Cuestionario no disponible',
      description: 'No hay un cuestionario activo en este momento. Intenta mas tarde.',
      emoji: '📋',
    },
    error: {
      title: 'Error al cargar',
      description: 'Hubo un error al cargar el cuestionario. Intenta mas tarde.',
      emoji: '⚠️',
    },
  };

  const content = messages[reason || 'invalid'] || messages.invalid;

  return (
    <div className="min-h-screen bg-gradient-questionnaire flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-6">{content.emoji}</div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {content.title}
          </h1>

          <p className="text-gray-600 mb-8">{content.description}</p>

          <p className="text-sm text-gray-500 mb-6">
            Si crees que esto es un error, contacta al administrador del cuestionario.
          </p>

          <Link to="/">
            <Button variant="secondary">Volver al inicio</Button>
          </Link>
        </motion.div>
      </Card>
    </div>
  );
}

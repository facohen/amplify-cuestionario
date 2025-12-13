import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function WelcomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-questionnaire flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-6">📋</div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Bienvenido al Cuestionario
          </h1>

          <p className="text-gray-600 mb-6">
            Para comenzar, necesitas un enlace de acceso con un token valido. Si
            tienes uno, haz clic en el enlace que recibiste.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">
              El enlace tiene el formato:
            </p>
            <code className="text-primary-purple text-sm">
              /q/tu-token-aqui
            </code>
          </div>

          <div className="space-y-3">
            <Link to="/admin">
              <Button variant="outline" fullWidth>
                Panel de Administracion
              </Button>
            </Link>

            <Link to="/terms">
              <Button variant="secondary" fullWidth>
                Terminos y Condiciones
              </Button>
            </Link>
          </div>
        </motion.div>
      </Card>
    </div>
  );
}

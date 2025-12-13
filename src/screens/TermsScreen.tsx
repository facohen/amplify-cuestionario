import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function TermsScreen() {
  return (
    <div className="min-h-screen bg-gradient-questionnaire flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Terminos y Condiciones
        </h1>

        <div className="prose prose-gray max-w-none">
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              1. Proposito del Cuestionario
            </h2>
            <p className="text-gray-600 text-sm">
              Este cuestionario tiene como proposito recopilar informacion para
              fines de evaluacion. Sus respuestas seran tratadas de manera
              confidencial.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              2. Uso de Datos
            </h2>
            <p className="text-gray-600 text-sm">
              La informacion recopilada sera utilizada unicamente para los fines
              especificados. No compartiremos sus datos personales con terceros
              sin su consentimiento explicito.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              3. Confidencialidad
            </h2>
            <p className="text-gray-600 text-sm">
              Nos comprometemos a mantener la confidencialidad de sus
              respuestas. Los datos seran almacenados de forma segura y solo
              seran accesibles por personal autorizado.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              4. Participacion Voluntaria
            </h2>
            <p className="text-gray-600 text-sm">
              Su participacion en este cuestionario es completamente voluntaria.
              Puede optar por no responder cualquier pregunta o abandonar el
              cuestionario en cualquier momento.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              5. Contacto
            </h2>
            <p className="text-gray-600 text-sm">
              Si tiene preguntas sobre estos terminos o sobre el uso de sus
              datos, puede contactar al administrador del cuestionario.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link to="/">
            <Button variant="secondary">Volver al inicio</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

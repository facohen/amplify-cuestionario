import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Cuestionario } from '../../types/cuestionario';
import { createAssistedToken } from '../../services/tokenService';
import {
  validateCuil,
  formatCuil,
  validateEmail,
  validateRespondentName,
} from '../../utils/cuilValidation';
import { fetchUserAttributes } from 'aws-amplify/auth';

interface CargaAsistidaTabProps {
  cuestionarios: Cuestionario[];
  onStartQuestionnaire: (tokenId: string) => void;
}

export default function CargaAsistidaTab({
  cuestionarios,
  onStartQuestionnaire,
}: CargaAsistidaTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCuestionarioId, setSelectedCuestionarioId] = useState<string>('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [cuil, setCuil] = useState('');
  const [errors, setErrors] = useState<{
    nombre?: string;
    email?: string;
    cuil?: string;
  }>({});

  // Seleccionar automáticamente el cuestionario activo
  useEffect(() => {
    const activeCuestionario = cuestionarios.find((c) => c.status === 'active');
    if (activeCuestionario) {
      setSelectedCuestionarioId(activeCuestionario.id_cuestionario);
    } else if (cuestionarios.length > 0) {
      setSelectedCuestionarioId(cuestionarios[0].id_cuestionario);
    }
  }, [cuestionarios]);

  function handleCuilChange(value: string) {
    const formatted = formatCuil(value);
    setCuil(formatted);

    // Limpiar error al escribir
    if (errors.cuil) {
      setErrors((prev) => ({ ...prev, cuil: undefined }));
    }
  }

  function validateForm(): boolean {
    const newErrors: typeof errors = {};

    const nombreResult = validateRespondentName(nombre);
    if (!nombreResult.valid) {
      newErrors.nombre = nombreResult.error;
    }

    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      newErrors.email = emailResult.error;
    }

    const cuilResult = validateCuil(cuil);
    if (!cuilResult.valid) {
      newErrors.cuil = cuilResult.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!selectedCuestionarioId) {
      alert('Selecciona un cuestionario primero');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsCreating(true);

      // Obtener el email del admin actual
      let createdBy = 'admin';
      try {
        const attributes = await fetchUserAttributes();
        createdBy = attributes.email || 'admin';
      } catch {
        console.warn('Could not fetch user attributes');
      }

      const cuilResult = validateCuil(cuil);
      const token = await createAssistedToken(
        selectedCuestionarioId,
        {
          name: nombre.trim(),
          email: email.trim().toLowerCase(),
          cuil: cuilResult.normalized,
        },
        createdBy
      );

      // Limpiar formulario
      setNombre('');
      setEmail('');
      setCuil('');
      setErrors({});

      // Navegar al cuestionario
      onStartQuestionnaire(token.id);
    } catch (error) {
      console.error('Error creating assisted token:', error);
      alert('Error al crear el token. Intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  }

  const activeCuestionarios = cuestionarios.filter(
    (c) => c.status === 'active' || c.status === 'draft'
  );

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Registrar Encuestado
      </h2>

      <div className="max-w-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cuestionario
          </label>
          <select
            value={selectedCuestionarioId}
            onChange={(e) => setSelectedCuestionarioId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-colors"
          >
            <option value="">Selecciona un cuestionario</option>
            {activeCuestionarios.map((c) => (
              <option key={c.id_cuestionario} value={c.id_cuestionario}>
                {c.title} {c.status === 'active' && '(Activo)'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (errors.nombre) {
                setErrors((prev) => ({ ...prev, nombre: undefined }));
              }
            }}
            placeholder="Juan Pérez"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-colors ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder="juan.perez@email.com"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CUIL
          </label>
          <input
            type="text"
            value={cuil}
            onChange={(e) => handleCuilChange(e.target.value)}
            placeholder="20-12345678-9"
            maxLength={13}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-colors font-mono ${
              errors.cuil ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.cuil && (
            <p className="mt-1 text-sm text-red-600">{errors.cuil}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Formato: XX-XXXXXXXX-X (11 dígitos)
          </p>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isCreating || !selectedCuestionarioId}
            fullWidth
            size="lg"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Creando...
              </span>
            ) : (
              'Iniciar Cuestionario'
            )}
          </Button>
        </div>

        <p className="text-sm text-gray-500 text-center">
          Al hacer clic, se creará un token y la pantalla cambiará al
          cuestionario. Entrega la tablet al encuestado.
        </p>
      </div>
    </Card>
  );
}

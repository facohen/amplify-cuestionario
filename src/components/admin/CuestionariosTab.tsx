import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Cuestionario } from '../../types/cuestionario';
import {
  createCuestionario,
  deleteCuestionario,
  updateCuestionarioStatus,
} from '../../services/cuestionarioService';
import { validateCuestionario, formatValidationErrors } from '../../utils/validation';

interface CuestionariosTabProps {
  cuestionarios: Cuestionario[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export default function CuestionariosTab({
  cuestionarios,
  isLoading,
  onRefresh,
}: CuestionariosTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert('El archivo es demasiado grande. Maximo 5MB.');
      return;
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
      alert('Solo se permiten archivos .json');
      return;
    }

    try {
      setIsUploading(true);
      const text = await file.text();

      // Parse JSON with error handling
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(text);
      } catch {
        throw new Error('El archivo no contiene JSON valido');
      }

      // Validate cuestionario structure
      const validation = validateCuestionario(parsedData);
      if (!validation.valid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      const cuestionario = parsedData as Cuestionario;

      // Check for duplicate ID
      const existingIds = cuestionarios.map(c => c.id_cuestionario);
      if (existingIds.includes(cuestionario.id_cuestionario)) {
        throw new Error(`Ya existe un cuestionario con ID "${cuestionario.id_cuestionario}"`);
      }

      // Set default status
      if (!cuestionario.status) {
        cuestionario.status = 'draft';
      }

      // Auto-calculate total_questions if not set
      if (!cuestionario.total_questions) {
        cuestionario.total_questions = cuestionario.questions.length;
      }

      await createCuestionario(cuestionario);
      await onRefresh();
      alert(`Cuestionario "${cuestionario.title}" subido exitosamente con ${cuestionario.questions.length} preguntas`);
    } catch (error) {
      console.error('Error uploading cuestionario:', error);
      alert(`Error al subir cuestionario:\n\n${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleDelete(cuestionarioId: string, status?: string) {
    if (status === 'active') {
      alert('No se puede eliminar un cuestionario activo. Primero desactivalo o archivalo.');
      return;
    }

    if (!confirm(`Estas seguro de eliminar el cuestionario "${cuestionarioId}"?`)) return;

    try {
      await deleteCuestionario(cuestionarioId);
      await onRefresh();
    } catch (error) {
      console.error('Error deleting cuestionario:', error);
      alert('Error al eliminar cuestionario');
    }
  }

  async function handleActivate(cuestionarioId: string) {
    try {
      // Deactivate any currently active cuestionario
      for (const c of cuestionarios) {
        if (c.status === 'active' && c.id_cuestionario !== cuestionarioId) {
          await updateCuestionarioStatus(c.id_cuestionario, 'draft');
        }
      }
      await updateCuestionarioStatus(cuestionarioId, 'active');
      await onRefresh();
    } catch (error) {
      console.error('Error activating cuestionario:', error);
      alert(`Error al activar cuestionario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async function handleDeactivate(cuestionarioId: string) {
    try {
      await updateCuestionarioStatus(cuestionarioId, 'draft');
      await onRefresh();
    } catch (error) {
      console.error('Error deactivating cuestionario:', error);
      alert(`Error al cambiar estado del cuestionario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async function handleArchive(cuestionarioId: string) {
    try {
      await updateCuestionarioStatus(cuestionarioId, 'archived');
      await onRefresh();
    } catch (error) {
      console.error('Error archiving cuestionario:', error);
      alert('Error al archivar cuestionario');
    }
  }

  return (
    <>
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Subir Cuestionario</h2>
        <p className="text-sm text-gray-600 mb-4">
          Sube un archivo JSON con el cuestionario. El archivo debe tener la estructura correcta
          con id_cuestionario, version, title, y questions.
        </p>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            id="cuestionario-upload"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Seleccionar archivo JSON'}
          </Button>
          {isUploading && <LoadingSpinner size="sm" />}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Cuestionarios ({cuestionarios.length})
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : cuestionarios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay cuestionarios cargados</p>
            <p className="text-sm text-gray-400">
              Sube un archivo JSON para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cuestionarios.map((cuestionario) => (
              <motion.div
                key={cuestionario.id_cuestionario}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  cuestionario.status === 'active'
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 hover:border-fuchsia-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">
                        {cuestionario.title}
                      </h3>
                      {cuestionario.status === 'active' && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                          ACTIVO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {cuestionario.description}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>ID: {cuestionario.id_cuestionario}</span>
                      <span>Version: {cuestionario.version}</span>
                      <span>Preguntas: {cuestionario.total_questions}</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        cuestionario.status === 'active' ? 'bg-green-100 text-green-700' :
                        cuestionario.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {cuestionario.status || 'draft'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {cuestionario.status !== 'active' && (
                      <button
                        onClick={() => handleActivate(cuestionario.id_cuestionario)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 border border-green-300 rounded hover:bg-green-50"
                      >
                        Activar
                      </button>
                    )}
                    {cuestionario.status === 'active' && (
                      <button
                        onClick={() => handleDeactivate(cuestionario.id_cuestionario)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium px-3 py-1 border border-yellow-300 rounded hover:bg-yellow-50"
                      >
                        Desactivar
                      </button>
                    )}
                    {cuestionario.status !== 'archived' && cuestionario.status !== 'active' && (
                      <button
                        onClick={() => handleArchive(cuestionario.id_cuestionario)}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Archivar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(cuestionario.id_cuestionario, cuestionario.status)}
                      disabled={cuestionario.status === 'active'}
                      className={`text-sm font-medium px-3 py-1 border rounded ${
                        cuestionario.status === 'active'
                          ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50'
                      }`}
                      title={cuestionario.status === 'active' ? 'No se puede eliminar un cuestionario activo' : ''}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

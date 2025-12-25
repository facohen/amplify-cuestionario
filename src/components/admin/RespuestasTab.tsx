import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Cuestionario } from '../../types/cuestionario';
import {
  getResponse,
  unmarkResponse,
  StoredResponseData,
} from '../../services/cuestionarioService';

interface RespuestasTabProps {
  respuestas: StoredResponseData[];
  cuestionarios: Cuestionario[];
  isLoading: boolean;
  filterCuestionarioId: string;
  onFilterChange: (cuestionarioId: string) => void;
  onRefresh: () => Promise<void>;
}

export default function RespuestasTab({
  respuestas,
  cuestionarios,
  isLoading,
  filterCuestionarioId,
  onFilterChange,
  onRefresh,
}: RespuestasTabProps) {
  const [selectedRespuestas, setSelectedRespuestas] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleUnmarkResponse(item: StoredResponseData) {
    try {
      await unmarkResponse(item.id);
      await onRefresh();
    } catch (error) {
      console.error('Error unmarking response:', error);
      alert('Error al desmarcar respuesta');
    }
  }

  function toggleSelectRespuesta(id: string) {
    const newSelected = new Set(selectedRespuestas);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRespuestas(newSelected);
  }

  function toggleSelectAll() {
    if (selectedRespuestas.size === respuestas.length) {
      setSelectedRespuestas(new Set());
    } else {
      setSelectedRespuestas(new Set(respuestas.map(r => r.id)));
    }
  }

  async function downloadSingleResponse(item: StoredResponseData) {
    try {
      const data = await getResponse(item.id);
      if (data) {
        const exportData = {
          tokenId: data.tokenId,
          submittedAt: data.createdAt,
          startedAt: data.startedAt,
          finishedAt: data.finishedAt,
          totalTimeMs: data.totalTimeMs,
          totalTimeAdjustedMs: data.totalTimeAdjustedMs,
          respondent: data.respondentName ? {
            name: data.respondentName,
            email: data.respondentEmail,
            cuil: data.respondentCuil,
          } : null,
          cuestionario: {
            id: data.cuestionarioId,
            version: data.cuestionarioVersion,
            title: data.cuestionarioTitle,
          },
          answers: data.answersJson,
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `respuesta_${item.tokenId}_${item.createdAt.replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading respuesta:', error);
      alert('Error al descargar respuesta');
    }
  }

  async function downloadSelectedResponses() {
    if (selectedRespuestas.size === 0) {
      alert('Selecciona al menos una respuesta');
      return;
    }

    try {
      setIsDownloading(true);
      const selectedItems = respuestas.filter(r => selectedRespuestas.has(r.id));

      const downloadedData: { fileName: string; data: unknown }[] = [];

      for (const item of selectedItems) {
        const data = await getResponse(item.id);
        if (data) {
          const exportData = {
            tokenId: data.tokenId,
            submittedAt: data.createdAt,
            startedAt: data.startedAt,
            finishedAt: data.finishedAt,
            totalTimeMs: data.totalTimeMs,
            totalTimeAdjustedMs: data.totalTimeAdjustedMs,
            respondent: data.respondentName ? {
              name: data.respondentName,
              email: data.respondentEmail,
              cuil: data.respondentCuil,
            } : null,
            cuestionario: {
              id: data.cuestionarioId,
              version: data.cuestionarioVersion,
              title: data.cuestionarioTitle,
            },
            answers: data.answersJson,
          };
          downloadedData.push({
            fileName: `respuesta_${item.tokenId}_${item.createdAt.replace(/[:.]/g, '-')}.json`,
            data: exportData,
          });
        }
      }

      if (downloadedData.length === 1) {
        const { fileName, data } = downloadedData[0];
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const combined = {
          exportedAt: new Date().toISOString(),
          totalResponses: downloadedData.length,
          responses: downloadedData.map(d => d.data),
        };
        const blob = new Blob([JSON.stringify(combined, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `respuestas_batch_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      alert(`${downloadedData.length} respuesta(s) descargada(s)`);
    } catch (error) {
      console.error('Error downloading respuestas:', error);
      alert('Error al descargar respuestas');
    } finally {
      setIsDownloading(false);
    }
  }

  function formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

  return (
    <>
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end justify-between">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Filtrar por Cuestionario</label>
            <select
              value={filterCuestionarioId}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
            >
              <option value="">Todos los cuestionarios</option>
              {cuestionarios.map((c) => (
                <option key={c.id_cuestionario} value={c.id_cuestionario}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={toggleSelectAll}
              variant="secondary"
              disabled={respuestas.length === 0}
            >
              {selectedRespuestas.size === respuestas.length && respuestas.length > 0
                ? 'Deseleccionar Todos'
                : 'Seleccionar Todos'}
            </Button>
            <Button
              onClick={downloadSelectedResponses}
              disabled={selectedRespuestas.size === 0 || isDownloading}
            >
              {isDownloading
                ? 'Descargando...'
                : `Descargar (${selectedRespuestas.size})`}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Respuestas ({respuestas.length})
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : respuestas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay respuestas</p>
            <p className="text-sm text-gray-400">
              Las respuestas apareceran aqui cuando los usuarios completen cuestionarios
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={selectedRespuestas.size === respuestas.length && respuestas.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-fuchsia-600 focus:ring-fuchsia-500"
                    />
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Token ID</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Respondente</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Cuestionario</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Fecha</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Estado</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Estado API</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {respuestas.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      selectedRespuestas.has(item.id) ? 'bg-fuchsia-50' : ''
                    }`}
                  >
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedRespuestas.has(item.id)}
                        onChange={() => toggleSelectRespuesta(item.id)}
                        className="rounded border-gray-300 text-fuchsia-600 focus:ring-fuchsia-500"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {item.tokenId.substring(0, 12)}...
                      </code>
                    </td>
                    <td className="py-3 px-2">
                      {item.respondentName ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.respondentName}</p>
                          <p className="text-xs text-gray-500">{item.respondentEmail}</p>
                          <p className="text-xs text-gray-400 font-mono">{item.respondentCuil}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin datos</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-gray-600 text-xs">
                      {item.cuestionarioTitle || item.cuestionarioId}
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'abandoned'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status === 'completed' ? 'Completado' :
                         item.status === 'abandoned' ? 'Abandonado' :
                         item.status || 'Desconocido'}
                      </span>
                      {item.status === 'abandoned' && (
                        <span className="block text-xs text-gray-500 mt-1">
                          {item.answersJson?.length || 0} respuestas
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {item.downloadStatus === 'downloaded' ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Descargado
                          </span>
                          <button
                            onClick={() => handleUnmarkResponse(item)}
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                          >
                            Desmarcar
                          </button>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => downloadSingleResponse(item)}
                        className="text-fuchsia-600 hover:text-fuchsia-800 text-sm font-medium"
                      >
                        Descargar JSON
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

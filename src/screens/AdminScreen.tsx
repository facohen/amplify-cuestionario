import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Token } from '../types/token';
import { Cuestionario } from '../types/cuestionario';
import { listTokens, createToken, createTokensBatch, revokeToken } from '../services/tokenService';
import {
  uploadCuestionario,
  downloadCuestionario,
  listCuestionarios,
  deleteCuestionario,
  updateCuestionarioStatus,
  listRespuestas,
  downloadRespuesta,
  StoredResponse,
} from '../services/cuestionarioStorageService';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

type FilterStatus = 'all' | 'active' | 'used' | 'expired' | 'revoked';
type AdminTab = 'tokens' | 'cuestionarios' | 'respuestas';
type DownloadStatus = 'pending' | 'downloaded' | 'unknown';

interface ResponseItem {
  path: string;
  cuestionarioId: string;
  tokenId: string;
  timestamp: string;
  data?: StoredResponse;
  downloadStatus?: DownloadStatus;
  downloadRecordId?: string;
}

function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('cuestionarios');

  // Token state
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [batchCount, setBatchCount] = useState(10);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCuestionarioId, setSelectedCuestionarioId] = useState<string>('');

  // Cuestionario state
  const [cuestionarios, setCuestionarios] = useState<{ id: string; data?: Cuestionario }[]>([]);
  const [isLoadingCuestionarios, setIsLoadingCuestionarios] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Respuestas state
  const [respuestas, setRespuestas] = useState<ResponseItem[]>([]);
  const [isLoadingRespuestas, setIsLoadingRespuestas] = useState(false);
  const [selectedRespuestas, setSelectedRespuestas] = useState<Set<string>>(new Set());
  const [filterCuestionarioId, setFilterCuestionarioId] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadTokens();
    loadCuestionarios();
  }, []);

  useEffect(() => {
    if (activeTab === 'respuestas') {
      loadRespuestas();
    }
  }, [activeTab, filterCuestionarioId]);

  useEffect(() => {
    // Set default selected cuestionario when list loads
    if (cuestionarios.length > 0 && !selectedCuestionarioId) {
      setSelectedCuestionarioId(cuestionarios[0].id);
    }
  }, [cuestionarios, selectedCuestionarioId]);

  async function loadTokens() {
    try {
      setIsLoadingTokens(true);
      const data = await listTokens();
      setTokens(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  }

  async function loadCuestionarios() {
    try {
      setIsLoadingCuestionarios(true);
      const ids = await listCuestionarios();
      // Load full data for each cuestionario
      const loaded = await Promise.all(
        ids.map(async (id) => {
          const data = await downloadCuestionario(id);
          return { id, data: data || undefined };
        })
      );
      setCuestionarios(loaded.filter((c) => c.data));
    } catch (error) {
      console.error('Error loading cuestionarios:', error);
    } finally {
      setIsLoadingCuestionarios(false);
    }
  }

  async function loadRespuestas() {
    try {
      setIsLoadingRespuestas(true);
      const paths = await listRespuestas(filterCuestionarioId || undefined);

      // Load download status from DynamoDB
      const downloadRecords = await client.models.ResponseDownload.list();
      const downloadStatusMap = new Map<string, { status: DownloadStatus; id: string }>();
      downloadRecords.data?.forEach((record) => {
        if (record.s3Path) {
          downloadStatusMap.set(record.s3Path, {
            status: (record.status as DownloadStatus) || 'unknown',
            id: record.id,
          });
        }
      });

      // Parse path info: respuestas/{cuestionarioId}/{tokenId}_{timestamp}.json
      const items: ResponseItem[] = paths
        .filter(path => path.endsWith('.json'))
        .map(path => {
          const parts = path.replace('respuestas/', '').split('/');
          const cuestionarioId = parts[0] || '';
          const fileName = parts[1] || '';
          const [tokenId, ...timestampParts] = fileName.replace('.json', '').split('_');
          const timestamp = timestampParts.join('_');

          const downloadInfo = downloadStatusMap.get(path);

          return {
            path,
            cuestionarioId,
            tokenId: tokenId || '',
            timestamp: timestamp || '',
            downloadStatus: downloadInfo?.status || 'unknown',
            downloadRecordId: downloadInfo?.id,
          };
        })
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Most recent first

      setRespuestas(items);
      setSelectedRespuestas(new Set());
    } catch (error) {
      console.error('Error loading respuestas:', error);
    } finally {
      setIsLoadingRespuestas(false);
    }
  }

  async function handleUnmarkResponse(item: ResponseItem) {
    if (!item.downloadRecordId) {
      alert('No hay registro de descarga para esta respuesta');
      return;
    }

    try {
      await client.models.ResponseDownload.update({
        id: item.downloadRecordId,
        status: 'pending',
        downloadedAt: null,
        downloadedBy: null,
      });
      await loadRespuestas();
    } catch (error) {
      console.error('Error unmarking response:', error);
      alert('Error al desmarcar respuesta');
    }
  }

  function toggleSelectRespuesta(path: string) {
    const newSelected = new Set(selectedRespuestas);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedRespuestas(newSelected);
  }

  function toggleSelectAll() {
    if (selectedRespuestas.size === respuestas.length) {
      setSelectedRespuestas(new Set());
    } else {
      setSelectedRespuestas(new Set(respuestas.map(r => r.path)));
    }
  }

  async function downloadSingleResponse(item: ResponseItem) {
    try {
      const data = await downloadRespuesta(item.path);
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `respuesta_${item.tokenId}_${item.timestamp}.json`;
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
      const selectedItems = respuestas.filter(r => selectedRespuestas.has(r.path));

      // Download all selected responses
      const downloadedData: { fileName: string; data: StoredResponse }[] = [];

      for (const item of selectedItems) {
        const data = await downloadRespuesta(item.path);
        if (data) {
          downloadedData.push({
            fileName: `respuesta_${item.tokenId}_${item.timestamp}.json`,
            data,
          });
        }
      }

      if (downloadedData.length === 1) {
        // Single file download
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
        // Multiple files - create a combined JSON with all responses
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

  function formatTimestamp(timestamp: string): string {
    // Format: 2024-01-15T10-30-45-123Z -> 15/01/2024 10:30:45
    try {
      const isoString = timestamp.replace(/-/g, (m, i) => (i > 9 ? ':' : m)).replace('T', ' ');
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const text = await file.text();
      const cuestionario = JSON.parse(text) as Cuestionario;

      // Validate basic structure
      if (!cuestionario.id_cuestionario || !cuestionario.questions) {
        throw new Error('Archivo JSON inválido: falta id_cuestionario o questions');
      }

      // Ensure new uploads default to draft status
      if (!cuestionario.status) {
        cuestionario.status = 'draft';
      }

      await uploadCuestionario(cuestionario);
      await loadCuestionarios();
      alert('Cuestionario subido exitosamente');
    } catch (error) {
      console.error('Error uploading cuestionario:', error);
      alert(`Error al subir cuestionario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleDeleteCuestionario(cuestionarioId: string, status?: string) {
    // Prevent deletion of active cuestionarios
    if (status === 'active') {
      alert('No se puede eliminar un cuestionario activo. Primero desactívalo o archívalo.');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el cuestionario "${cuestionarioId}"?`)) return;

    try {
      await deleteCuestionario(cuestionarioId);
      await loadCuestionarios();
      if (selectedCuestionarioId === cuestionarioId) {
        setSelectedCuestionarioId('');
      }
    } catch (error) {
      console.error('Error deleting cuestionario:', error);
      alert('Error al eliminar cuestionario');
    }
  }

  async function handleActivateCuestionario(cuestionarioId: string) {
    try {
      console.log('Activating cuestionario:', cuestionarioId);
      // First, deactivate all other cuestionarios that are currently active
      for (const c of cuestionarios) {
        if (c.data?.status === 'active' && c.id !== cuestionarioId) {
          console.log('Deactivating cuestionario:', c.id);
          await updateCuestionarioStatus(c.id, 'draft');
        }
      }
      // Activate the selected one
      console.log('Setting cuestionario to active:', cuestionarioId);
      await updateCuestionarioStatus(cuestionarioId, 'active');
      console.log('Cuestionario activated, reloading list...');
      await loadCuestionarios();
    } catch (error) {
      console.error('Error activating cuestionario:', error);
      alert(`Error al activar cuestionario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async function handleArchiveCuestionario(cuestionarioId: string) {
    try {
      await updateCuestionarioStatus(cuestionarioId, 'archived');
      await loadCuestionarios();
    } catch (error) {
      console.error('Error archiving cuestionario:', error);
      alert('Error al archivar cuestionario');
    }
  }

  async function handleDraftCuestionario(cuestionarioId: string) {
    try {
      console.log('Deactivating cuestionario:', cuestionarioId);
      await updateCuestionarioStatus(cuestionarioId, 'draft');
      console.log('Cuestionario deactivated, reloading list...');
      await loadCuestionarios();
    } catch (error) {
      console.error('Error setting cuestionario to draft:', error);
      alert(`Error al cambiar estado del cuestionario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async function handleCreateSingle() {
    if (!selectedCuestionarioId) {
      alert('Selecciona un cuestionario primero');
      return;
    }
    try {
      setIsCreating(true);
      const token = await createToken(selectedCuestionarioId);
      setTokens([token, ...tokens]);
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Error al crear token');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCreateBatch() {
    if (!selectedCuestionarioId) {
      alert('Selecciona un cuestionario primero');
      return;
    }
    try {
      setIsCreating(true);
      const newTokens = await createTokensBatch(selectedCuestionarioId, batchCount);
      setTokens([...newTokens.reverse(), ...tokens]);
    } catch (error) {
      console.error('Error creating tokens:', error);
      alert('Error al crear tokens');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRevoke(tokenId: string) {
    if (!confirm('Estas seguro de revocar este token?')) return;

    try {
      await revokeToken(tokenId);
      setTokens(tokens.map((t) => (t.id === tokenId ? { ...t, status: 'revoked' as const } : t)));
    } catch (error) {
      console.error('Error revoking token:', error);
      alert('Error al revocar token');
    }
  }

  function copyToClipboard(tokenId: string) {
    const url = `${window.location.origin}/q/${tokenId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(tokenId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredTokens =
    filterStatus === 'all' ? tokens : tokens.filter((t) => t.status === filterStatus);

  const statusCounts = {
    all: tokens.length,
    active: tokens.filter((t) => t.status === 'active').length,
    used: tokens.filter((t) => t.status === 'used').length,
    expired: tokens.filter((t) => t.status === 'expired').length,
    revoked: tokens.filter((t) => t.status === 'revoked').length,
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    used: 'bg-blue-100 text-blue-800',
    expired: 'bg-yellow-100 text-yellow-800',
    revoked: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Panel de Administracion
          </h1>
          <p className="text-gray-600 mb-6">Gestión de cuestionarios y tokens</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('cuestionarios')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'cuestionarios'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📋 Cuestionarios
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'tokens'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🎫 Tokens
          </button>
          <button
            onClick={() => setActiveTab('respuestas')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'respuestas'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📊 Respuestas
          </button>
        </div>

        {/* Cuestionarios Tab */}
        {activeTab === 'cuestionarios' && (
          <>
            {/* Upload cuestionario */}
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

            {/* Cuestionarios list */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Cuestionarios ({cuestionarios.length})
              </h2>

              {isLoadingCuestionarios ? (
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
                  {cuestionarios.map(({ id, data }) => (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        data?.status === 'active'
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-200 hover:border-fuchsia-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800">
                              {data?.title || id}
                            </h3>
                            {data?.status === 'active' && (
                              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                                ACTIVO
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {data?.description}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>ID: {id}</span>
                            <span>Versión: {data?.version}</span>
                            <span>Preguntas: {data?.total_questions}</span>
                            <span className={`px-2 py-0.5 rounded-full ${
                              data?.status === 'active' ? 'bg-green-100 text-green-700' :
                              data?.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {data?.status || 'draft'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          {/* Status action buttons */}
                          {data?.status !== 'active' && (
                            <button
                              onClick={() => handleActivateCuestionario(id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 border border-green-300 rounded hover:bg-green-50"
                            >
                              Activar
                            </button>
                          )}
                          {data?.status === 'active' && (
                            <button
                              onClick={() => handleDraftCuestionario(id)}
                              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium px-3 py-1 border border-yellow-300 rounded hover:bg-yellow-50"
                            >
                              Desactivar
                            </button>
                          )}
                          {data?.status !== 'archived' && data?.status !== 'active' && (
                            <button
                              onClick={() => handleArchiveCuestionario(id)}
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Archivar
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCuestionario(id, data?.status)}
                            disabled={data?.status === 'active'}
                            className={`text-sm font-medium px-3 py-1 border rounded ${
                              data?.status === 'active'
                                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50'
                            }`}
                            title={data?.status === 'active' ? 'No se puede eliminar un cuestionario activo' : ''}
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
        )}

        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <>
            {/* Select cuestionario + Create tokens */}
            <Card className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Crear Tokens</h2>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Cuestionario</label>
                <select
                  value={selectedCuestionarioId}
                  onChange={(e) => setSelectedCuestionarioId(e.target.value)}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                >
                  <option value="">Selecciona un cuestionario</option>
                  {cuestionarios.map(({ id, data }) => (
                    <option key={id} value={id}>
                      {data?.title || id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <Button
                    onClick={handleCreateSingle}
                    disabled={isCreating || !selectedCuestionarioId}
                  >
                    {isCreating ? 'Creando...' : 'Crear Token Individual'}
                  </Button>
                </div>

                <div className="flex items-end gap-2">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={batchCount}
                      onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                    />
                  </div>
                  <Button
                    onClick={handleCreateBatch}
                    disabled={isCreating || !selectedCuestionarioId}
                    variant="secondary"
                  >
                    {isCreating ? 'Creando...' : 'Crear Lote'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Filters */}
            <Card className="mb-6">
              <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'used', 'expired', 'revoked'] as FilterStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === status
                        ? 'bg-fuchsia-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)} (
                    {statusCounts[status]})
                  </button>
                ))}
              </div>
            </Card>

            {/* Tokens list */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Tokens ({filteredTokens.length})
              </h2>

              {isLoadingTokens ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredTokens.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay tokens para mostrar</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium text-gray-600">ID</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Cuestionario</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Estado</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Creado</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Usado</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTokens.map((token) => (
                        <motion.tr
                          key={token.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {token.id.substring(0, 12)}...
                            </code>
                          </td>
                          <td className="py-3 px-2 text-gray-600 text-xs">
                            {token.cuestionarioId}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                statusColors[token.status]
                              }`}
                            >
                              {token.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-600">
                            {new Date(token.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-gray-600">
                            {token.usedAt
                              ? new Date(token.usedAt).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => copyToClipboard(token.id)}
                                className="text-fuchsia-600 hover:text-fuchsia-800 text-sm font-medium"
                              >
                                {copiedId === token.id ? 'Copiado!' : 'Copiar URL'}
                              </button>
                              {token.status === 'active' && (
                                <button
                                  onClick={() => handleRevoke(token.id)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Revocar
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Respuestas Tab */}
        {activeTab === 'respuestas' && (
          <>
            {/* Filter and actions */}
            <Card className="mb-6">
              <div className="flex flex-wrap gap-4 items-end justify-between">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Filtrar por Cuestionario</label>
                  <select
                    value={filterCuestionarioId}
                    onChange={(e) => setFilterCuestionarioId(e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                  >
                    <option value="">Todos los cuestionarios</option>
                    {cuestionarios.map(({ id, data }) => (
                      <option key={id} value={id}>
                        {data?.title || id}
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

            {/* Respuestas list */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Respuestas ({respuestas.length})
              </h2>

              {isLoadingRespuestas ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : respuestas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No hay respuestas</p>
                  <p className="text-sm text-gray-400">
                    Las respuestas aparecerán aquí cuando los usuarios completen cuestionarios
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
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Cuestionario</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Fecha</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Estado API</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {respuestas.map((item) => (
                        <motion.tr
                          key={item.path}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            selectedRespuestas.has(item.path) ? 'bg-fuchsia-50' : ''
                          }`}
                        >
                          <td className="py-3 px-2">
                            <input
                              type="checkbox"
                              checked={selectedRespuestas.has(item.path)}
                              onChange={() => toggleSelectRespuesta(item.path)}
                              className="rounded border-gray-300 text-fuchsia-600 focus:ring-fuchsia-500"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {item.tokenId.substring(0, 12)}...
                            </code>
                          </td>
                          <td className="py-3 px-2 text-gray-600 text-xs">
                            {item.cuestionarioId}
                          </td>
                          <td className="py-3 px-2 text-gray-600">
                            {formatTimestamp(item.timestamp)}
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
                            ) : item.downloadStatus === 'pending' ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                Pendiente
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                Sin registro
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
        )}
      </div>
    </div>
  );
}

export default function AdminScreen() {
  return (
    <Authenticator>
      {({ signOut }) => (
        <div>
          <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-gray-600">Panel de Administracion</span>
            <button
              onClick={signOut}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Cerrar sesion
            </button>
          </div>
          <AdminPanel />
        </div>
      )}
    </Authenticator>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Token } from '../../types/token';
import { Cuestionario } from '../../types/cuestionario';
import { createTokensBatch, revokeToken } from '../../services/tokenService';

type FilterStatus = 'all' | 'active' | 'used' | 'expired' | 'revoked';

interface TokensTabProps {
  tokens: Token[];
  cuestionarios: Cuestionario[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export default function TokensTab({
  tokens,
  cuestionarios,
  isLoading,
  onRefresh,
}: TokensTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [batchCount, setBatchCount] = useState(10);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCuestionarioId, setSelectedCuestionarioId] = useState<string>(
    cuestionarios[0]?.id_cuestionario || ''
  );

  async function handleCreateBatch() {
    if (!selectedCuestionarioId) {
      alert('Selecciona un cuestionario primero');
      return;
    }
    try {
      setIsCreating(true);
      await createTokensBatch(selectedCuestionarioId, batchCount);
      await onRefresh();
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
      await onRefresh();
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
    <>
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
            {cuestionarios.map((c) => (
              <option key={c.id_cuestionario} value={c.id_cuestionario}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
            <input
              type="number"
              min="1"
              max="100"
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={handleCreateBatch}
            disabled={isCreating || !selectedCuestionarioId}
          >
            {isCreating ? 'Creando...' : `Crear ${batchCount} Token${batchCount !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </Card>

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

      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Tokens ({filteredTokens.length})
        </h2>

        {isLoading ? (
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
  );
}

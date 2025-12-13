import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Token } from '../types/token';
import { listTokens, createToken, createTokensBatch, revokeToken } from '../services/tokenService';
import { cuestionarioData } from '../data/cuestionario';

type FilterStatus = 'all' | 'active' | 'used' | 'expired' | 'revoked';

function AdminPanel() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [batchCount, setBatchCount] = useState(10);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadTokens();
  }, []);

  async function loadTokens() {
    try {
      setIsLoading(true);
      const data = await listTokens();
      setTokens(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateSingle() {
    try {
      setIsCreating(true);
      const token = await createToken(cuestionarioData.id_cuestionario);
      setTokens([token, ...tokens]);
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Error al crear token');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCreateBatch() {
    try {
      setIsCreating(true);
      const newTokens = await createTokensBatch(cuestionarioData.id_cuestionario, batchCount);
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
          <p className="text-gray-600 mb-6">Gestion de tokens para el cuestionario</p>
        </motion.div>

        {/* Create tokens section */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Crear Tokens</h2>

          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Button onClick={handleCreateSingle} disabled={isCreating}>
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
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                />
              </div>
              <Button onClick={handleCreateBatch} disabled={isCreating} variant="secondary">
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
                    ? 'bg-primary-purple text-white'
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
                            className="text-primary-purple hover:text-primary-purple-dark text-sm font-medium"
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

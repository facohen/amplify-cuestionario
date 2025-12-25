import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Token } from '../types/token';
import { Cuestionario } from '../types/cuestionario';
import { listTokens } from '../services/tokenService';
import {
  listCuestionarios,
  listResponses,
  StoredResponseData,
} from '../services/cuestionarioService';
import CuestionariosTab from '../components/admin/CuestionariosTab';
import TokensTab from '../components/admin/TokensTab';
import RespuestasTab from '../components/admin/RespuestasTab';
import CargaAsistidaTab from '../components/admin/CargaAsistidaTab';

type AdminTab = 'tokens' | 'cuestionarios' | 'respuestas' | 'carga_asistida';

function AdminPanel() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>('cuestionarios');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Token state
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);

  // Cuestionario state
  const [cuestionarios, setCuestionarios] = useState<Cuestionario[]>([]);
  const [isLoadingCuestionarios, setIsLoadingCuestionarios] = useState(true);

  // Respuestas state
  const [respuestas, setRespuestas] = useState<StoredResponseData[]>([]);
  const [isLoadingRespuestas, setIsLoadingRespuestas] = useState(false);
  const [filterCuestionarioId, setFilterCuestionarioId] = useState<string>('');

  // Verificar si viene de completar un cuestionario asistido
  useEffect(() => {
    const completed = searchParams.get('completed');
    if (completed === 'true') {
      setSuccessMessage('Cuestionario completado exitosamente');
      setActiveTab('carga_asistida');
      // Limpiar el parámetro de la URL
      setSearchParams({});
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    loadTokens();
    loadCuestionarios();
  }, []);

  useEffect(() => {
    if (activeTab === 'respuestas') {
      loadRespuestas();
    }
  }, [activeTab, filterCuestionarioId]);

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
      const data = await listCuestionarios();
      setCuestionarios(data);
    } catch (error) {
      console.error('Error loading cuestionarios:', error);
    } finally {
      setIsLoadingCuestionarios(false);
    }
  }

  async function loadRespuestas() {
    try {
      setIsLoadingRespuestas(true);
      const data = await listResponses(filterCuestionarioId || undefined);
      const sorted = data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRespuestas(sorted);
    } catch (error) {
      console.error('Error loading respuestas:', error);
    } finally {
      setIsLoadingRespuestas(false);
    }
  }

  function handleStartAssistedQuestionnaire(tokenId: string) {
    navigate(`/asistida/${tokenId}`);
  }

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
          <p className="text-gray-600 mb-6">Gestion de cuestionarios y tokens</p>
        </motion.div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('carga_asistida')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'carga_asistida'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Carga Asistida
          </button>
          <button
            onClick={() => setActiveTab('cuestionarios')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'cuestionarios'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cuestionarios
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'tokens'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setActiveTab('respuestas')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'respuestas'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Respuestas
          </button>
        </div>

        {activeTab === 'carga_asistida' && (
          <CargaAsistidaTab
            cuestionarios={cuestionarios}
            onStartQuestionnaire={handleStartAssistedQuestionnaire}
          />
        )}

        {activeTab === 'cuestionarios' && (
          <CuestionariosTab
            cuestionarios={cuestionarios}
            isLoading={isLoadingCuestionarios}
            onRefresh={loadCuestionarios}
          />
        )}

        {activeTab === 'tokens' && (
          <TokensTab
            tokens={tokens}
            cuestionarios={cuestionarios}
            isLoading={isLoadingTokens}
            onRefresh={loadTokens}
          />
        )}

        {activeTab === 'respuestas' && (
          <RespuestasTab
            respuestas={respuestas}
            cuestionarios={cuestionarios}
            isLoading={isLoadingRespuestas}
            filterCuestionarioId={filterCuestionarioId}
            onFilterChange={setFilterCuestionarioId}
            onRefresh={loadRespuestas}
          />
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

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Cuestionario } from '../types/cuestionario';
import { listCuestionarios, listResponsesByAdministrator, StoredResponseData } from '../services/cuestionarioService';
import { createAssistedToken } from '../services/tokenService';
import {
  validateCuil,
  formatCuil,
  validateEmail,
  validateRespondentName,
} from '../utils/cuilValidation';

type TabType = 'nueva' | 'historial';

interface AdminInfo {
  email: string;
  name?: string;
}

interface KPIStats {
  total7Days: number;
  completed: number;
  abandoned: number;
  inProgress: number;
  completionRate: number;
}

function EncuestaPanel({ signOut }: { signOut?: () => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('nueva');
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<StoredResponseData | null>(null);

  // Form state
  const [cuestionarios, setCuestionarios] = useState<Cuestionario[]>([]);
  const [selectedCuestionarioId, setSelectedCuestionarioId] = useState<string>('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [cuil, setCuil] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<{
    nombre?: string;
    email?: string;
    cuil?: string;
  }>({});

  // Historial state
  const [historial, setHistorial] = useState<StoredResponseData[]>([]);
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);

  // Calcular KPIs
  const kpiStats = useMemo<KPIStats>(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7Days = historial.filter(
      (item) => new Date(item.createdAt) >= sevenDaysAgo
    );

    const completed = last7Days.filter((item) => item.status === 'completed').length;
    const abandoned = last7Days.filter((item) => item.status === 'abandoned').length;
    const inProgress = last7Days.filter((item) => item.status === 'in_progress').length;
    const total = last7Days.length;

    return {
      total7Days: total,
      completed,
      abandoned,
      inProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [historial]);

  // Cargar info del admin y historial inicial
  useEffect(() => {
    async function loadAdminInfo() {
      try {
        const attributes = await fetchUserAttributes();
        const adminEmail = attributes.email || '';
        setAdminInfo({
          email: adminEmail,
          name: attributes.name || adminEmail.split('@')[0],
        });
        // Cargar historial inmediatamente
        if (adminEmail) {
          loadHistorialByEmail(adminEmail);
        }
      } catch (error) {
        console.error('Error fetching user attributes:', error);
      }
    }
    loadAdminInfo();
    loadCuestionarios();
  }, []);

  async function loadCuestionarios() {
    try {
      const data = await listCuestionarios();
      setCuestionarios(data);
      const active = data.find((c) => c.status === 'active');
      if (active) {
        setSelectedCuestionarioId(active.id_cuestionario);
      } else if (data.length > 0) {
        setSelectedCuestionarioId(data[0].id_cuestionario);
      }
    } catch (error) {
      console.error('Error loading cuestionarios:', error);
    }
  }

  async function loadHistorialByEmail(email: string) {
    try {
      setIsLoadingHistorial(true);
      const data = await listResponsesByAdministrator(email);
      setHistorial(data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading historial:', error);
    } finally {
      setIsLoadingHistorial(false);
    }
  }

  async function loadHistorial() {
    if (!adminInfo?.email) return;
    loadHistorialByEmail(adminInfo.email);
  }

  function handleCuilChange(value: string) {
    const formatted = formatCuil(value);
    setCuil(formatted);
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

      const cuilResult = validateCuil(cuil);
      const token = await createAssistedToken(
        selectedCuestionarioId,
        {
          name: nombre.trim(),
          email: email.trim().toLowerCase(),
          cuil: cuilResult.normalized,
        },
        adminInfo?.email || 'unknown'
      );

      setNombre('');
      setEmail('');
      setCuil('');
      setErrors({});

      navigate(`/asistida/${token.id}`, {
        state: {
          adminEmail: adminInfo?.email,
          adminName: adminInfo?.name,
        }
      });
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

  function getStatusBadge(status: string) {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completada</span>;
      case 'abandoned':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Abandonada</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">En progreso</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function getAbandonReasonLabel(reason: string | null): string {
    const reasons: Record<string, string> = {
      'too_long': 'Muy extenso',
      'too_difficult': 'Muy dificil',
      'no_share_info': 'No quiere dar informacion',
      'no_time': 'Sin tiempo',
      'other': 'Otro motivo',
    };
    return reason ? reasons[reason] || reason : '-';
  }

  function getFeedbackLabel(value: number | null, type: 'ease' | 'length'): string {
    if (value === null) return '-';
    if (type === 'ease') {
      const labels = ['', 'Muy dificil', 'Dificil', 'Normal', 'Facil', 'Muy facil'];
      return labels[value] || '-';
    } else {
      const labels = ['', 'Muy corto', 'Corto', 'Adecuado', 'Largo', 'Muy largo'];
      return labels[value] || '-';
    }
  }

  // Vista de detalle de encuesta
  if (selectedSurvey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <button
              onClick={() => setSelectedSurvey(null)}
              className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <span className="text-sm text-purple-200">Detalle de Encuesta</span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/95 backdrop-blur mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedSurvey.respondentName || 'Sin nombre'}
                  </h2>
                  <p className="text-gray-500 font-mono">{selectedSurvey.respondentCuil || '-'}</p>
                </div>
                {getStatusBadge(selectedSurvey.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedSurvey.answersJson?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Respuestas</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedSurvey.totalTimeMs ? formatTime(selectedSurvey.totalTimeMs) : '-'}
                  </p>
                  <p className="text-xs text-gray-500">Tiempo</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(selectedSurvey.startedAt)}
                  </p>
                  <p className="text-xs text-gray-500">Inicio</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-800">
                    {selectedSurvey.finishedAt ? formatDate(selectedSurvey.finishedAt) : '-'}
                  </p>
                  <p className="text-xs text-gray-500">Fin</p>
                </div>
              </div>

              {selectedSurvey.respondentEmail && (
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Email:</span> {selectedSurvey.respondentEmail}
                </p>
              )}

              {/* Info de abandono */}
              {selectedSurvey.status === 'abandoned' && selectedSurvey.abandonedAtQuestion && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-red-800 mb-2">Informacion de Abandono</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-red-600">Abandono en pregunta:</span>
                      <span className="ml-2 font-medium text-red-800">{selectedSurvey.abandonedAtQuestion}</span>
                    </div>
                    <div>
                      <span className="text-red-600">Motivo:</span>
                      <span className="ml-2 font-medium text-red-800">
                        {getAbandonReasonLabel(selectedSurvey.abandonReason)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback del usuario */}
              {selectedSurvey.feedbackSubmittedAt && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">Feedback del Encuestado</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-purple-600">Facilidad:</span>
                      <span className="ml-2 font-medium text-purple-800">
                        {getFeedbackLabel(selectedSurvey.feedbackEaseOfUse, 'ease')}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-600">Extension:</span>
                      <span className="ml-2 font-medium text-purple-800">
                        {getFeedbackLabel(selectedSurvey.feedbackSurveyLength, 'length')}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-600">Acepta propuestas:</span>
                      <span className="ml-2 font-medium text-purple-800">
                        {selectedSurvey.feedbackWillingToReceive === null
                          ? '-'
                          : selectedSurvey.feedbackWillingToReceive
                          ? 'Si'
                          : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {selectedSurvey.answersJson && selectedSurvey.answersJson.length > 0 && (
              <Card className="bg-white/95 backdrop-blur">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Respuestas</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedSurvey.answersJson.map((answer, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                      <p className="text-sm text-gray-500 mb-1">Pregunta {answer.question_number}</p>
                      <p className="text-gray-800">{answer.question_text}</p>
                      <p className="text-purple-600 font-medium mt-1">{answer.selected_option_text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Tiempo: {formatTime(answer.time_to_answer_ms)}
                        {answer.changed_answer && ` · Cambios: ${answer.change_count}`}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Sistema de Administracion</h1>
            <p className="text-sm text-purple-200">Tests Psicometricos</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-purple-200">
              {adminInfo?.name || adminInfo?.email}
            </span>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-white">{kpiStats.total7Days}</p>
            <p className="text-xs text-purple-200">Ultimos 7 dias</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-500/20 backdrop-blur rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-green-400">{kpiStats.completed}</p>
            <p className="text-xs text-green-200">Completadas</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-500/20 backdrop-blur rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-red-400">{kpiStats.abandoned}</p>
            <p className="text-xs text-red-200">Abandonadas</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-purple-500/20 backdrop-blur rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-purple-300">{kpiStats.completionRate}%</p>
            <p className="text-xs text-purple-200">Tasa exito</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('nueva')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'nueva'
                ? 'bg-white text-purple-900 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Nueva Encuesta
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'historial'
                ? 'bg-white text-purple-900 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Mis Encuestas
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Nueva Encuesta Tab */}
          {activeTab === 'nueva' && (
            <motion.div
              key="nueva"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/95 backdrop-blur">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Registrar Nuevo Encuestado
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuestionario
                    </label>
                    <select
                      value={selectedCuestionarioId}
                      onChange={(e) => setSelectedCuestionarioId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
                      Nombre Completo del Encuestado
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
                      placeholder="Juan Perez"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                        errors.nombre ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.nombre && (
                      <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email del Encuestado
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CUIL del Encuestado
                    </label>
                    <input
                      type="text"
                      value={cuil}
                      onChange={(e) => handleCuilChange(e.target.value)}
                      placeholder="20-12345678-9"
                      maxLength={13}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors font-mono ${
                        errors.cuil ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cuil && (
                      <p className="mt-1 text-sm text-red-600">{errors.cuil}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Formato: XX-XXXXXXXX-X (11 digitos)
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
                          Iniciando...
                        </span>
                      ) : (
                        'Iniciar Test'
                      )}
                    </Button>
                  </div>

                  <p className="text-sm text-gray-500 text-center">
                    Al hacer clic, se iniciara el test psicometrico.
                    Entrega el dispositivo al encuestado.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Historial Tab */}
          {activeTab === 'historial' && (
            <motion.div
              key="historial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/95 backdrop-blur">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Encuestas Administradas
                  </h2>
                  <button
                    onClick={loadHistorial}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    Actualizar
                  </button>
                </div>

                {isLoadingHistorial ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : historial.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No has administrado ninguna encuesta aun.</p>
                    <p className="text-sm mt-2">Las encuestas que administres apareceran aqui.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historial.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedSurvey(item)}
                        className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.respondentName || 'Sin nombre'}
                            </p>
                            <p className="text-sm text-gray-500 font-mono">
                              {item.respondentCuil || '-'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(item.status)}
                            {item.status === 'abandoned' && item.abandonedAtQuestion && (
                              <span className="text-xs text-red-500">
                                Pregunta {item.abandonedAtQuestion}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                          <span>{formatDate(item.createdAt)}</span>
                          <span>{item.answersJson?.length || 0} respuestas</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function EncuestaScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <Authenticator
        components={{
          Header() {
            return (
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Sistema de Administracion Asistida
                  </h1>
                  <p className="text-purple-200">
                    Tests Psicometricos
                  </p>
                </motion.div>
              </div>
            );
          },
        }}
      >
        {({ signOut }) => <EncuestaPanel signOut={signOut} />}
      </Authenticator>
    </div>
  );
}

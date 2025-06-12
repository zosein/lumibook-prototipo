import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import * as ReservationService from '../services/ReservationService';
import { toast } from 'react-toastify';

export default function UserReservationsPage({ setCurrentPage, user, isLoggedIn }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    async function fetchReservations() {
      setLoading(true);
      try {
        const data = await ReservationService.getActiveReservations(user.id);
        setReservations(data);
      } catch (err) {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReservations();
  }, [user.id]);

  const handleCancelReservation = async (reservationId) => {
    setCancelingId(reservationId);
    try {
      await ReservationService.cancelReservation(reservationId);
      const data = await ReservationService.getActiveReservations(user.id);
      setReservations(data);
      toast.success('Reserva cancelada!');
    } catch (err) {
      toast.error('Erro ao cancelar reserva: ' + (err.response?.data?.message || err.message));
    }
    setCancelingId(null);
  };

  const fetchReservationHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await ReservationService.getReservationHistory(user.id);
      setHistory(data);
      setShowHistory(true);
    } catch (err) {
      setHistory([]);
      setShowHistory(true);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full bg-blue-600 flex items-center gap-4 px-4 py-3 shadow-lg">
        <button onClick={() => setCurrentPage('perfil')} className="text-white p-2 rounded hover:bg-blue-500 transition-all duration-200">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen size={24} /> Minhas Reservas
        </h1>
      </header>
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reservas Ativas</h2>
          {loading ? (
            <div>Carregando reservas...</div>
          ) : reservations.length === 0 ? (
            <div>Nenhuma reserva ativa.</div>
          ) : (
            <ul className="divide-y">
              {reservations.map((res) => (
                <li key={res.id} className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{res.tituloLivro}</span>
                      <div className="text-sm text-gray-500">
                        <p>Data da reserva: {new Date(res.dataReserva).toLocaleDateString()}</p>
                        <p className="mt-1">
                          Status: 
                          <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                            res.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                            res.status === 'ativa' ? 'bg-green-100 text-green-800' :
                            res.status === 'finalizada' ? 'bg-blue-100 text-blue-800' :
                            res.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                            res.status === 'atendida' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {res.status === 'pendente' && (
                        <button 
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors" 
                          onClick={() => handleCancelReservation(res.id)} 
                          disabled={cancelingId === res.id}
                        >
                          {cancelingId === res.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
                      {res.status === 'ativa' && (
                        <button 
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors" 
                          onClick={() => handleCancelReservation(res.id)} 
                          disabled={cancelingId === res.id}
                        >
                          {cancelingId === res.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" 
            onClick={fetchReservationHistory}
          >
            Ver histórico de reservas
          </button>
          {showHistory && (
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Histórico de Reservas</h3>
              {loadingHistory ? (
                <div>Carregando histórico...</div>
              ) : history.length === 0 ? (
                <div>Nenhuma reserva anterior encontrada.</div>
              ) : (
                <ul className="divide-y">
                  {history.map((res) => (
                    <li key={res.id} className="py-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{res.tituloLivro}</span>
                          <div className="text-sm text-gray-500">
                            <p>Data: {new Date(res.dataReserva).toLocaleDateString()}</p>
                            <p className="mt-1">
                              Status: 
                              <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                                res.status === 'finalizada' ? 'bg-green-100 text-green-800' :
                                res.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button 
                className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors" 
                onClick={() => setShowHistory(false)}
              >
                Fechar histórico
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
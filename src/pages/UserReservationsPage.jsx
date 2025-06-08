import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import * as ReservationService from '../services/ReservationService';

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
        const token = localStorage.getItem('authToken');
        const data = await ReservationService.getActiveReservations(user.id, token);
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
      const token = localStorage.getItem('authToken');
      await ReservationService.cancelReservation(reservationId, token);
      setReservations(reservations.filter(r => r.id !== reservationId));
    } catch (err) {}
    setCancelingId(null);
  };

  const fetchReservationHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('authToken');
      const data = await ReservationService.getReservationHistory(user.id, token);
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
                <li key={res.id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{res.tituloLivro}</span> <span className="text-sm text-gray-500">({res.dataReserva})</span>
                  </div>
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-sm" onClick={() => handleCancelReservation(res.id)} disabled={cancelingId === res.id}>
                    {cancelingId === res.id ? 'Cancelando...' : 'Cancelar'}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={fetchReservationHistory}>Ver histórico de reservas</button>
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
                    <li key={res.id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-medium">{res.tituloLivro}</span> <span className="text-sm text-gray-500">({res.dataReserva} - {res.status})</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => setShowHistory(false)}>Fechar histórico</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
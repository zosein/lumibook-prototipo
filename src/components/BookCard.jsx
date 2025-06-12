import { Book, Clock, AlertTriangle, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as ReservationService from '../services/ReservationService';

export default function BookCard({ book, onStatusChange }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleReserve = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        toast.error('Você precisa estar logado para fazer uma reserva');
        navigate('/login');
        return;
      }

      await ReservationService.createReservation(book._id);
      toast.success('Livro reservado com sucesso! Redirecionando para suas reservas...');
      navigate('/reservas');
    } catch (error) {
      toast.error(error.message || 'Erro ao reservar livro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{book.author}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Book className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600">
              {book.available ? 'Disponível' : 'Indisponível'}
            </span>
          </div>
          
          <button
            onClick={handleReserve}
            disabled={!book.available || loading}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              book.available && !loading
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Reservar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 
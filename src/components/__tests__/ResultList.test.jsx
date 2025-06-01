import { render, screen, act, waitFor } from '@testing-library/react';
import ResultList from '../ResultList';
import CatalogService from '../../services/CatalogService';

describe('ResultList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('authToken', 'fake-token');
    jest.spyOn(CatalogService, 'searchBooks').mockImplementation((params, token) => {
      console.log('MOCK searchBooks params:', params, 'token:', token);
      return Promise.resolve([
        {
          id: '1',
          titulo: 'Livro Teste',
          autor: 'Autor Teste',
          ano: 2024,
          tipo: 'Fantasia',
          categoria: 'Fantasia',
          disponivel: true,
          edicao: '1ª edição',
          idioma: 'Português',
          isbn: '123',
          localizacao: 'Estante A',
          exemplares: { disponiveis: 2, total: 3 }
        }
      ]);
    });
  });

  it('deve renderizar resultados de busca', async () => {
    await act(async () => {
      render(
        <ResultList
          searchQuery="Teste"
          currentInputQuery="Teste"
          advancedFilters={{
            materialType: 'Todos',
            category: 'Todas',
            availability: 'Todos',
            publicationYear: 'Todos'
          }}
          navigateToDetails={() => {}}
          isSearchTriggered={true}
        />
      );
    });
    await waitFor(() => expect(screen.getByText(/Livro Teste/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/Autor Teste/i)).toBeInTheDocument());
  });
}); 
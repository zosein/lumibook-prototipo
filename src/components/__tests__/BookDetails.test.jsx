import { render, screen, act } from '@testing-library/react';
import BookDetails from '../BookDetails';
import CatalogService from '../../services/CatalogService';

describe('BookDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(CatalogService, 'getBookById').mockImplementation(() => Promise.resolve({
      id: '1',
      titulo: 'Livro Teste',
      autor: 'Autor Teste',
      ano: 2024,
      tipo: 'Fantasia',
      categoria: 'Fantasia',
      isbn: '123',
      localizacao: 'Estante A',
      edicao: '1ª edição',
      idioma: 'Português',
      sinopse: 'Sinopse...',
      paginas: 100,
      disponivel: true,
      editora: 'Editora Teste',
      exemplares: { disponiveis: 2, total: 3 },
      resumo: 'Sinopse...'
    }));
    jest.spyOn(CatalogService, 'getRelatedBooks').mockImplementation(() => Promise.resolve([]));
  });

  it('deve renderizar título e autor do livro', async () => {
    await act(async () => {
      render(<BookDetails setCurrentPage={() => {}} bookId="1" />);
    });
    expect(await screen.findByText(/Livro Teste/i)).toBeInTheDocument();
    expect(await screen.findByText(/Autor Teste/i)).toBeInTheDocument();
  });
}); 
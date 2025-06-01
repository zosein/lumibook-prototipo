import { render, screen, act } from '@testing-library/react';
import HomeContent from '../HomeContent';
import CatalogService from '../../services/CatalogService';

jest.spyOn(CatalogService, 'getRecentBooks').mockImplementation(() => Promise.resolve([
  { id: '1', titulo: 'Livro Teste', autor: 'Autor Teste' }
]));

describe('HomeContent', () => {
  it('deve renderizar categorias', async () => {
    await act(async () => {
      render(<HomeContent setCurrentPage={() => {}} />);
    });
    expect(screen.getAllByText(/Livros/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Periódicos/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/E-books/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Teses e Dissertações/i).length).toBeGreaterThan(0);
  });
}); 
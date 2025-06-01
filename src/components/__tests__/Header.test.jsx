import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('deve renderizar o nome do usuário', () => {
    render(<Header setCurrentPage={() => {}} isLoggedIn={true} user={{ nome: 'Usuário Teste', tipoLogin: 'email' }} onLogout={() => {}} />);
    expect(screen.getByText(/Usuário Teste/i)).toBeInTheDocument();
  });

  it('deve renderizar o botão de logout', () => {
    render(<Header setCurrentPage={() => {}} isLoggedIn={true} user={{ nome: 'Usuário Teste', tipoLogin: 'email' }} onLogout={() => {}} />);
    expect(screen.getByText(/Sair da conta/i)).toBeInTheDocument();
  });
}); 
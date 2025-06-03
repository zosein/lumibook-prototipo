import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import StudentProfile from '../StudentProfile';

expect.extend(toHaveNoViolations);

// Mocks básicos para serviços
jest.mock('../../services/ReservationService', () => ({
  getActiveReservations: jest.fn(() => Promise.resolve([
    { id: '1', tituloLivro: 'Livro Teste', dataReserva: '2024-06-01' }
  ])),
  cancelReservation: jest.fn(() => Promise.resolve()),
  getReservationHistory: jest.fn(() => Promise.resolve([
    { id: '2', tituloLivro: 'Livro Antigo', dataReserva: '2024-05-01', status: 'Expirada' }
  ])),
}));
jest.mock('../../services/FineService', () => ({
  getUserFines: jest.fn(() => Promise.resolve([])),
  payFine: jest.fn(() => Promise.resolve()),
  getFineHistory: jest.fn(() => Promise.resolve([])),
}));
jest.mock('../../services/StatsService', () => ({
  getUserStats: jest.fn(() => Promise.resolve({
    livrosDisponiveis: 2,
    livrosEmprestados: 1,
    devolucoesPendentes: 0,
    limiteConcorrente: 3,
    multasPendentes: 0,
    ultimaAtualizacao: new Date().toISOString(),
  })),
}));
jest.mock('../../services/UserService', () => ({
  getUserById: jest.fn(() => Promise.resolve({ nome: 'Usuário Teste', statusConta: 'ativa', membroDesde: '2024' })),
  getAuthToken: jest.fn(() => 'token'),
}));
jest.mock('../../services/avatarService', () => ({
  getUserAvatar: jest.fn(() => Promise.resolve('https://fake-avatar')),
}));

const userMock = {
  id: 'user1',
  name: 'Usuário Teste',
  email: 'teste@exemplo.com',
  papel: 'aluno',
  matricula: '1234567',
};

describe('StudentProfile - Página de Perfil', () => {
  it('renderiza informações básicas do perfil', async () => {
    render(<StudentProfile user={userMock} setCurrentPage={() => {}} isLoggedIn={true} />);
    expect(await screen.findByText('Meu Perfil')).toBeInTheDocument();
    expect(screen.getByText('Usuário Teste')).toBeInTheDocument();
    expect(screen.getByText('teste@exemplo.com')).toBeInTheDocument();
    expect(screen.getByText('Estudante')).toBeInTheDocument();
  });

  it('exibe toast ao cancelar reserva', async () => {
    render(<StudentProfile user={userMock} setCurrentPage={() => {}} isLoggedIn={true} />);
    const btn = await screen.findByRole('button', { name: /cancelar/i });
    userEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByText(/reserva cancelada/i)).toBeInTheDocument();
    });
  });

  it('abre modal de histórico de reservas', async () => {
    render(<StudentProfile user={userMock} setCurrentPage={() => {}} isLoggedIn={true} />);
    const btn = await screen.findByRole('button', { name: /ver histórico de reservas/i });
    userEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByText(/histórico de reservas/i)).toBeInTheDocument();
      expect(screen.getByText(/livro antigo/i)).toBeInTheDocument();
    });
    // Fecha modal
    userEvent.click(screen.getByLabelText(/fechar modal/i));
    await waitFor(() => {
      expect(screen.queryByText(/histórico de reservas/i)).not.toBeInTheDocument();
    });
  });

  it('menu mobile aparece em telas pequenas', async () => {
    // Força largura de tela pequena
    window.innerWidth = 400;
    render(<StudentProfile user={userMock} setCurrentPage={() => {}} isLoggedIn={true} />);
    const menuBtn = screen.getByLabelText(/abrir menu/i);
    userEvent.click(menuBtn);
    await waitFor(() => {
      expect(screen.getByText(/início/i)).toBeInTheDocument();
      expect(screen.getByText(/pesquisar/i)).toBeInTheDocument();
      expect(screen.getByText(/empréstimos/i)).toBeInTheDocument();
    });
    // Fecha menu
    userEvent.click(screen.getByLabelText(/fechar menu/i));
    await waitFor(() => {
      expect(screen.queryByText(/início/i)).not.toBeVisible();
    });
  });

  it('não possui violações de acessibilidade básicas', async () => {
    const { container } = render(<StudentProfile user={userMock} setCurrentPage={() => {}} isLoggedIn={true} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 
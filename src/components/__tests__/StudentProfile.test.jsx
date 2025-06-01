import { render, screen } from '@testing-library/react';
import StudentProfile from '../StudentProfile';

describe('StudentProfile', () => {
  const user = {
    name: 'Aluno Teste',
    email: 'aluno@teste.com',
    papel: 'aluno',
    matricula: '2023123456',
    tipoLogin: 'matricula',
  };

  it('deve renderizar o nome do usuário', () => {
    render(<StudentProfile user={user} setCurrentPage={() => {}} isLoggedIn={true} />);
    expect(screen.getAllByText(/Aluno Teste/i).length).toBeGreaterThan(0);
  });

  it('deve exibir a matrícula se for aluno', () => {
    render(<StudentProfile user={user} setCurrentPage={() => {}} isLoggedIn={true} />);
    expect(screen.getAllByText(/2023123456/).length).toBeGreaterThan(0);
  });
}); 
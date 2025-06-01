import { render, screen, fireEvent } from '@testing-library/react';
import FormInput from '../FormInput';

describe('FormInput', () => {
  it('deve renderizar o label e o input', () => {
    render(<FormInput label="Nome" id="nome" name="nome" value="" onChange={() => {}} />);
    expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument();
  });

  it('deve chamar onChange ao digitar', () => {
    const handleChange = jest.fn();
    render(<FormInput label="Nome" id="nome" name="nome" value="" onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'Teste' } });
    expect(handleChange).toHaveBeenCalled();
  });
}); 
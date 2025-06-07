/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthModal from './AuthModal';
import axios from 'axios';

// 🔧 Mock de Popup para evitar el useEffect y asegurar render directo
jest.mock('./Popup', () => (props) => (
  <div data-testid="popup">{props.message}</div>
));

jest.mock('axios');

const mockOnSuccess = jest.fn();

describe('AuthModal', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renderiza formulario de login por defecto', () => {
    render(<AuthModal onSuccess={mockOnSuccess} />);
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  test('permite cambiar al modo registro', () => {
    render(<AuthModal onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate'));
    expect(screen.getByRole('heading', { name: /Registrarse/i })).toBeInTheDocument();
  });

  test('actualiza inputs de usuario y contraseña', () => {
    render(<AuthModal onSuccess={mockOnSuccess} />);
    const userInput = screen.getByPlaceholderText('Usuario');
    const passInput = screen.getByPlaceholderText('Contraseña');

    fireEvent.change(userInput, { target: { value: 'user123' } });
    fireEvent.change(passInput, { target: { value: 'pass456' } });

    expect(userInput.value).toBe('user123');
    expect(passInput.value).toBe('pass456');
  });

  test('login exitoso guarda token y llama onSuccess', async () => {
    axios.post.mockResolvedValueOnce({ data: { access_token: 'token-login' } });

    render(<AuthModal onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'usuario' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'clave' } });
    fireEvent.click(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('token-login');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('registro seguido de login automático guarda token', async () => {
    axios.post
      .mockResolvedValueOnce({}) // /register
      .mockResolvedValueOnce({ data: { access_token: 'token-registro' } }); // /login

    render(<AuthModal onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate'));
    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'nuevo' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('token-registro');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('muestra popup si el usuario ya existe', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'User already exists' } }
    });

    render(<AuthModal onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate'));
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    await waitFor(() => {
      expect(screen.getByTestId('popup')).toHaveTextContent(/ya existe/i);
    });
  });

  test('muestra popup si el usuario no existe', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'User not found' } }
    });

    render(<AuthModal onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(screen.getByTestId('popup')).toHaveTextContent(/no se encuentra/i);
    });
  });

  test('muestra popup si la contraseña es incorrecta', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });

    render(<AuthModal onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(screen.getByTestId('popup')).toHaveTextContent(/Contraseña errónea/i);
    });
  });

  test('muestra popup con error genérico si no hay mensaje', async () => {
    axios.post.mockRejectedValueOnce(new Error('Algo fue mal'));

    render(<AuthModal onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Entrar'));

    await waitFor(() => {
      const popup = screen.getByTestId('popup');
      expect(popup).toHaveTextContent('Error en autenticación');
    });
  });

  test('renderiza el componente Popup cuando popupMessage está definido', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'User already exists' } }
    });

    render(<AuthModal onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate'));
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    await waitFor(() => {
      expect(screen.getByTestId('popup')).toBeInTheDocument();
    });
  });
});


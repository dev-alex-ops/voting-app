/* eslint-disable testing-library/no-unnecessary-act */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import App from './App';
import axios from 'axios';

jest.mock('axios');

// Mock AuthModal para simular login inmediato
jest.mock('./components/AuthModal', () => (props) => (
  <div data-testid="auth-modal">
    <button onClick={() => props.onSuccess()}>Simular Login</button>
  </div>
));

// Mock Popup
jest.mock('./components/Popup', () => (props) => (
  <div data-testid="popup">{props.message}</div>
));

describe('App.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    axios.get.mockResolvedValue({ data: { sevilla: 0, betis: 0 } });
  });

  test('render inicial con votos', async () => {
    localStorage.setItem('token', 'abc');
    axios.get.mockResolvedValueOnce({ data: { sevilla: 5, betis: 7 } });

    await act(async () => {
      render(<App />);
    });

    expect(await screen.findByText(/Votos: 5/)).toBeInTheDocument();
    expect(screen.getByText(/Votos: 7/)).toBeInTheDocument();
  });

  test('muestra modal si no hay token', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(await screen.findByTestId('auth-modal')).toBeInTheDocument();
  });

  test('oculta modal y vota tras login', async () => {
    await act(async () => {
      render(<App />);
    });

    fireEvent.click(await screen.findByText('Simular Login'));

    const votos = await screen.findAllByText(/Votos: 0/);
    expect(votos.length).toBe(2);
  });

  test('botón logout limpia token y muestra modal', async () => {
    localStorage.setItem('token', 'abc');

    await act(async () => {
      render(<App />);
    });

    expect(await screen.findByText(/Cerrar sesión/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Cerrar sesión/));
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe(null);
  });

  test('vota equipo por primera vez y muestra popup de voto emitido', async () => {
    localStorage.setItem('token', 'abc');
    axios.post.mockResolvedValueOnce({ data: { message: 'voto emitido' } });

    await act(async () => {
      render(<App />);
    });

    fireEvent.click(await screen.findByText(/Sevillista hasta la muerte/));

    await waitFor(() => {
      expect(screen.getByTestId('popup')).toHaveTextContent(/Voto emitido/i);
    });
  });

  test('modifica voto anterior y muestra popup de voto modificado', async () => {
    localStorage.setItem('token', 'abc');
    axios.post.mockResolvedValueOnce({ data: { message: 'voto modificado' } });

    await act(async () => {
      render(<App />);
    });

    fireEvent.click(await screen.findByText(/Manquepierda/));

    await waitFor(() => {
      expect(screen.getByTestId('popup')).toHaveTextContent(/Voto modificado/i);
    });
  });

  test('voto sin token lanza alerta', async () => {
    window.alert = jest.fn();

    await act(async () => {
      render(<App />);
    });

    fireEvent.click(screen.getByText(/Sevillista hasta la muerte/));
    expect(window.alert).toHaveBeenCalledWith('Debes iniciar sesión para votar');
  });

  test('error al cargar votos es capturado', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('error'));

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith('Error cargando votos:', expect.any(Error));
    });

    spy.mockRestore();
  });

  test('error al votar es capturado', async () => {
    localStorage.setItem('token', 'abc');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.post.mockRejectedValueOnce(new Error('fallo'));

    await act(async () => {
      render(<App />);
    });

    fireEvent.click(await screen.findByText(/Manquepierda/));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith('Error al votar:', expect.any(Error));
    });

    spy.mockRestore();
  });
});

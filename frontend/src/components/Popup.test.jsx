import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Popup from './Popup';

jest.useFakeTimers();

describe('Popup', () => {
  const message = 'Esto es un mensaje de prueba';
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza el mensaje correctamente', () => {
    render(<Popup message={message} onClose={mockOnClose} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test('llama a onClose automáticamente tras el timeout por defecto (3s)', () => {
    render(<Popup message={message} onClose={mockOnClose} />);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('usa la duración personalizada si se especifica', () => {
    render(<Popup message={message} onClose={mockOnClose} duration={1000} />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('limpia el timeout al desmontar el componente', () => {
    const { unmount } = render(<Popup message={message} onClose={mockOnClose} />);
    unmount();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

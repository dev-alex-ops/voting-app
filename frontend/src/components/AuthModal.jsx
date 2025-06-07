import React, { useState } from 'react';
import axios from 'axios';
import Popup from './Popup'; // importar el popup
import '../Popup.css';

function AuthModal({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const handleAuth = async () => {
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await axios.post(endpoint, { username, password });

      if (!isLogin) {
        const loginRes = await axios.post('/api/auth/login', { username, password });
        localStorage.setItem('token', loginRes.data.access_token);
      } else {
        localStorage.setItem('token', res.data.access_token);
      }

      onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg === 'User already exists') {
        setPopupMessage('El usuario ya existe, prueba a iniciar sesión o cambia de usuario');
      } else if (msg === 'User not found') {
        setPopupMessage('El usuario no se encuentra en la base de datos, registrese primero');
      } else if (msg === 'Invalid credentials') {
        setPopupMessage('Contraseña errónea. Por favor, pruebe de nuevo');
      } else {
        setPopupMessage('Error en autenticación');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isLogin ? 'Iniciar sesión' : 'Registrarse'}</h2>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleAuth}>
          {isLogin ? 'Entrar' : 'Registrarse'}
        </button>
        <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer' }}>
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </p>
      </div>
      {popupMessage && <Popup message={popupMessage} onClose={() => setPopupMessage('')} />}
    </div>
  );
}

export default AuthModal;

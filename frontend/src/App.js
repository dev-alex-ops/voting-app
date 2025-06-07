import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import './Modal.css';
import './Popup.css';
import AuthModal from './components/AuthModal';
import Popup from './components/Popup'; // nuevo import

import sevillaLogo from './assets/sevilla.png';
import betisLogo from './assets/betis.png';

function App() {
  const [votes, setVotes] = useState({ sevilla: 0, betis: 0 });
  const [showModal, setShowModal] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const fetchVotes = () => {
    axios.get('/api/votes')
      .then((res) => setVotes(res.data))
      .catch((err) => console.error('Error cargando votos:', err));
  };

  useEffect(() => {
    fetchVotes();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (!token) setShowModal(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  const vote = (team) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Debes iniciar sesión para votar');

    axios.post('/api/votes', { team }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      fetchVotes();
      const msg = res.data.message;
      if (msg.includes('modificado')) {
        setPopupMessage('Voto modificado. Muchas gracias');
      } else {
        setPopupMessage('Voto emitido. Muchas gracias');
      }
      setTimeout(() => setPopupMessage(''), 3000);
    })
    .catch((err) => {
      console.error('Error al votar:', err);
    });
  };

  return (
    <>
      {showModal && <AuthModal onSuccess={() => {
        setShowModal(false);
        fetchVotes();
      }} />}

      {!showModal && (
        <div className="logout-container">
          <button className="logout-button" onClick={() => {
            localStorage.removeItem('token');
            setShowModal(true);
          }}>
            Cerrar sesión
          </button>
        </div>
      )}

      <div className="container">
        <div className="team sevilla">
          <div className="content">
            <img src={sevillaLogo} alt="Escudo Sevilla" className="shield" />
            <h1>Sevilla FC</h1>
            <button onClick={() => vote('sevilla')}>Sevillista hasta la muerte</button>
            <div className="vote-counter">
              <p>Votos: {votes.sevilla}</p>
            </div>
          </div>
        </div>

        <div className="team betis">
          <div className="content">
            <img src={betisLogo} alt="Escudo Betis" className="shield" />
            <h1>Real Betis</h1>
            <button onClick={() => vote('betis')}>Manquepierda</button>
            <div className="vote-counter">
              <p>Votos: {votes.betis}</p>
            </div>
          </div>
        </div>
      </div>

      {popupMessage && <Popup message={popupMessage} onClose={() => setPopupMessage('')} />}
    </>
  );
}

export default App;

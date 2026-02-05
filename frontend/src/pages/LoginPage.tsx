import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/global.css';
import '../styles/login.css'

export function LoginPage() {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();
  

  async function handleLogin(e: any) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      
      // SALVA NO NAVEGADOR
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      navigate('/events'); // Vai para a galeria
    } catch (err: any) {
      alert(err.response?.data?.message || "E-mail ou senha incorretos");
    }
  }

  return (
    <div className="auth-container">
      <div className="card">
        <h1>Agenda Cultural</h1>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="E-mail" required onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" required onChange={e => setSenha(e.target.value)} />
          <button className="btn-main" type="submit">Entrar</button>
        </form>
        <button className="btn-secondary" onClick={() => navigate('/events')}>Entrar como Anônimo</button>
        <button className='btn-resg' onClick={() => navigate('/register')}>Criar Conta</button>
      </div>
    </div>
  );
}
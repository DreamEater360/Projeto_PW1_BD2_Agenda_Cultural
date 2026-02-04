import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/global.css';
import '../styles/login.css'

export function RegisterPage() {
  const [papel, setPapel] = useState('CIDADAO');
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', cnpj: '' });
  const navigate = useNavigate();

  async function handleRegister(e: any) {
    e.preventDefault();
    try {
      // O papel e os dados extras vão no mesmo objeto
      await api.post('/auth/register', { 
        ...formData, 
        papel 
      });
      
      alert("Conta criada com sucesso! Redirecionando para login...");
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao criar conta");
    }
  }

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Criar Conta</h2>
        <div className="role-selector">
          <button className={`role-btn ${papel === 'CIDADAO' ? 'active' : ''}`} onClick={() => setPapel('CIDADAO')}>Cidadão</button>
          <button className={`role-btn ${papel === 'ORGANIZADOR' ? 'active' : ''}`} onClick={() => setPapel('ORGANIZADOR')}>Organizador</button>
        </div>

        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Nome Completo" required onChange={e => setFormData({...formData, nome: e.target.value})} />
          <input type="email" placeholder="E-mail" required onChange={e => setFormData({...formData, email: e.target.value})} />
          {papel === 'ORGANIZADOR' && (
            <input type="text" placeholder="CNPJ" required onChange={e => setFormData({...formData, cnpj: e.target.value})} />
          )}
          <input type="password" placeholder="Senha" required onChange={e => setFormData({...formData, senha: e.target.value})} />
          <button className="btn-main" type="submit">Finalizar Registro</button>
          <button className='btn-resg' onClick={() => navigate('/')}>Já tem uma conta?</button>
        </form>
      </div>
    </div>
  );
}
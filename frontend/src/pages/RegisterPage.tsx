import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/global.css';
import '../styles/login.css'

export function RegisterPage() {
  const [papel, setPapel] = useState('CIDADAO');
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', cnpj: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { ...formData, papel });
      alert("Conta criada com sucesso! 🎉");
      navigate('/');
    } catch (err: any) {
      // TRATAMENTO PARA ERROS DE VALIDAÇÃO (ZOD)
      if (err.response?.status === 400 && err.response.data.errors) {
        const msg = err.response.data.errors.join('\n');
        alert("Erro no cadastro:\n" + msg);
      } else {
        alert(err.response?.data?.message || "Erro ao criar conta");
      }
    } finally {
      setLoading(false);
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
          <input 
            type="text" 
            placeholder="Nome Completo (mín. 3 letras)" 
            required 
            minLength={3} // Bloqueio no navegador
            onChange={e => setFormData({...formData, nome: e.target.value})} 
          />
          
          <input 
            type="email" 
            placeholder="E-mail" 
            required 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />

          {papel === 'ORGANIZADOR' && (
            <div className="form-group" style={{ width: '100%' }}>
              <input 
                type="text" 
                placeholder="CNPJ (Somente 14 números)" 
                required={papel === 'ORGANIZADOR'} 
                minLength={14}
                maxLength={14}
                pattern="\d{14}" // Só permite números
                title="O CNPJ deve conter exatamente 14 números"
                value={formData.cnpj}
                onChange={e => {
                  // Remove tudo que não for número enquanto o usuário digita
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  setFormData({...formData, cnpj: apenasNumeros});
                }} 
              />
            </div>
          )}

          <input 
            type="password" 
            placeholder="Senha (mín. 6 caracteres)" 
            required 
            minLength={6} // Bloqueio no navegador
            onChange={e => setFormData({...formData, senha: e.target.value})} 
          />

          <button className="btn-main" type="submit" disabled={loading}>
            {loading ? "Processando..." : "Finalizar Registro"}
          </button>
          
          <button type="button" className='btn-resg' onClick={() => navigate('/')}>
            Já tem uma conta?
          </button>
        </form>
      </div>
    </div>
  );
}
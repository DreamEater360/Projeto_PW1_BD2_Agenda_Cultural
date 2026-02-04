import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { User, Mail, Shield, Lock, Save, ArrowLeft } from 'lucide-react';
import '../styles/global.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      return alert("As senhas não coincidem!");
    }

    try {
      await api.patch('/auth/update-password', {
        senhaAtual,
        novaSenha
      });
      alert("Senha atualizada com sucesso! ✅");
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao atualizar senha.");
    }
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main className="container" style={{ flex: 1, padding: '40px 20px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}
        >
          <ArrowLeft size={18} /> Voltar
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
          
          {/* COLUNA 1: INFORMAÇÕES FIXAS */}
          <div className="card" style={{ height: 'fit-content' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
               <div style={{ background: '#fdf8f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 15px auto', border: '2px solid var(--purple)' }}>
                  <User size={40} color="var(--purple)" />
               </div>
               <h2 style={{ margin: 0 }}>{user.nome}</h2>
               <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Membro desde {new Date().getFullYear()}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '16px' }}>
                  <Mail size={18} color="#64748b" />
                  <span style={{ fontSize: '14px', color: 'var(--purple)' }}>{user.email}</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '16px' }}>
                  <Shield size={18} color="#64748b" />
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--purple)' }}>{user.papel}</span>
               </div>
            </div>
          </div>

          {/* COLUNA 2: MUDANÇA DE SENHA */}
          <div className="card">
            <h3 style={{ textAlign: 'left', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--purple)' }}>
              <Lock size={20} /> Segurança da Conta
            </h3>
            
            <form onSubmit={handleUpdatePassword}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--gray)' }}>SENHA ATUAL</label>
                <input 
                  type="password" 
                  value={senhaAtual} 
                  onChange={e => setSenhaAtual(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--gray)' }}>NOVA SENHA</label>
                  <input 
                    type="password" 
                    value={novaSenha} 
                    onChange={e => setNovaSenha(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--gray)' }}>CONFIRMAR SENHA</label>
                  <input 
                    type="password" 
                    value={confirmarSenha} 
                    onChange={e => setConfirmarSenha(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <button className="btn-main" type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Save size={20} /> Salvar Nova Senha
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
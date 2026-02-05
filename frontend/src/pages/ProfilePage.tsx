import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { User, Mail, Shield, Lock, Save, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import '../styles/global.css';
import '../styles/gallery.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const [minhasInscricoes, setMinhasInscricoes] = useState<any[]>([]);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Carrega as inscrições ao abrir a página
  useEffect(() => {
    api.get('/subscriptions/me')
      .then(res => setMinhasInscricoes(res.data))
      .catch(() => console.error("Erro ao carregar inscrições"));
  }, []);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) return alert("As senhas não coincidem!");

    try {
      await api.patch('/auth/update-password', { senhaAtual, novaSenha });
      alert("Senha atualizada com sucesso! ✅");
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao atualizar senha.");
    }
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main className="container" style={{ flex: 1, padding: '40px 20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
          <ArrowLeft size={18} /> Voltar
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          
          {/* LADO ESQUERDO: PERFIL E SENHA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ background: '#fdf8f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', border: '2px solid var(--purple)' }}>
                  <User size={40} color="var(--purple)" />
                </div>
                <h2 style={{ margin: 0, fontSize: '22px' }}>{user.nome}</h2>
                <span style={{ fontSize: '12px', color: 'var(--gray)' }}>{user.papel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px' }}>
                <Mail size={16} color="#64748b" />
                <span style={{ fontSize: '13px', color: 'var(--text)' }}>{user.email}</span>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', color: 'var(--purple)', marginBottom: '15px' }}><Lock size={18} /> Alterar Senha</h3>
              <form onSubmit={handleUpdatePassword}>
                <input type="password" placeholder="Senha Atual" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} required />
                <input type="password" placeholder="Nova Senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required />
                <input type="password" placeholder="Confirmar Nova Senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required />
                <button className="btn-main" type="submit" style={{width: '100%', borderRadius: '12px'}}>Salvar Senha</button>
              </form>
            </div>
          </div>

          {/* LADO DIREITO: MINHA AGENDA (INSCRIÇÕES) */}
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ textAlign: 'left', fontSize: '24px', color: 'var(--purple)', marginBottom: '10px', marginTop: '0' }}>Minha Agenda</h2>
            
            {minhasInscricoes.length === 0 ? (
              
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--gray)' }}>Você ainda não confirmou presença em nenhum evento.</p>
                <button className="btn-secondary" onClick={() => navigate('/events')}>Explorar Eventos</button>
              </div>
            ) : (
              <div className="event-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {minhasInscricoes.map(ev => (
                  <div key={ev._id} className="card-event">
                    <div className="card-image-wrapper">
                      <img src={ev.foto_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80'} alt="" />
                      <div className="badge-category">{ev.categoria_id?.nome}</div>
                    </div>
                    <div className="card-content">
                      <h3 className="event-title" style={{fontSize: '16px'}}>{ev.titulo}</h3>
                      <div className="event-info-row"><Calendar size={14}/> {new Date(ev.data_inicio).toLocaleDateString('pt-BR')}</div>
                      <div className="event-info-row"><MapPin size={14}/> {ev.localizacao?.nome_local}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
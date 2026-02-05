import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EventModal } from '../components/EventModal';
import { LayoutDashboard, ShieldCheck, ArrowRight, Sparkles, Calendar, MapPin, PlusCircle } from 'lucide-react';
import '../styles/gallery.css';

export function GalleryPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroCat, setFiltroCat] = useState('Todos');
  const [eventoSelecionado, setEventoSelecionado] = useState<any>(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const categorias = ['Todos', 'Música', 'Teatro', 'Arte', 'Cinema', 'Danças'];

  useEffect(() => {
    api.get('/events').then(res => setEventos(res.data)).catch(() => {});
  }, []);

  const eventosFiltrados = eventos.filter(ev => 
    ev.titulo?.toLowerCase().includes(busca.toLowerCase()) &&
    (filtroCat === 'Todos' || ev.categoria_id?.nome === filtroCat)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca={busca} setBusca={setBusca} />

      <main className="gallery-container" style={{ flex: 1 }}>
        <div className="categories-bar">
          {categorias.map(cat => (
            <button key={cat} className={`category-pill ${filtroCat === cat ? 'active' : ''}`} onClick={() => setFiltroCat(cat)}>{cat}</button>
          ))}
        </div>

        {/* DASHBOARD ADMIN/GESTOR */}
        {(user?.papel === 'ADMINISTRADOR' || user?.papel === 'GESTOR_PUBLICO') && (
          <div className="admin-shortcut-card" style={{ border: '2px solid #0f172a', background: '#f8fafc' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <ShieldCheck size={24} /> <h3 style={{margin: 0}}>Painel de Gestão Pública</h3>
              </div>
              <p style={{margin: '5px 0 0 0', color: '#64748b'}}>Moderação e Relatórios de Impacto IA.</p>
            </div>
            <button className="btn-main" style={{ background: '#0f172a', width: 'auto', padding: '12px 20px' }} onClick={() => navigate('/admin')}>
              Acessar Dashboard <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* DASHBOARD ORGANIZADOR */}
        {user?.papel === 'ORGANIZADOR' && (
          <div className="admin-shortcut-card">
            <div style={{ textAlign: 'left' }}>
              <h3 style={{margin: 0, color: 'var(--purple)'}}>Olá, Organizador!</h3>
              <p style={{margin: '5px 0 0 0', color: '#64748b'}}>Gerencie seus eventos cadastrados.</p>
            </div>
            <button className="btn-main" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => navigate('/org')}>
              <LayoutDashboard size={18} style={{marginRight: '8px'}}/> Meu Painel
            </button>
          </div>
        )}

        <h2 style={{ textAlign: 'left', margin: '40px 0 20px 0', color: '#1e293b' }}>Eventos em Destaque</h2>

        <div className="event-grid">
          {eventosFiltrados.length === 0 && <p style={{color: '#64748b'}}>Nenhum evento encontrado.</p>}
          {eventosFiltrados.map(ev => (
            <div key={ev._id} className="card-event">
              <div className="card-image-wrapper">
                <img src={ev.foto_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80'} alt="" />
                <div className="badge-category">{ev.categoria_id?.nome}</div>
              </div>
              <div className="card-content">
                <h3 className="event-title">{ev.titulo}</h3>
                <div className="event-info-row"><Calendar size={14}/> {new Date(ev.data_inicio).toLocaleDateString('pt-BR')}</div>
                <div className="event-info-row"><MapPin size={14}/> {ev.localizacao?.nome_local}</div>
                <button className="btn-details" style={{marginTop: '15px'}} onClick={() => setEventoSelecionado(ev)}>Ver Detalhes</button>
              </div>
            </div>
          ))}
        </div>

        {/* --- BOTÃO DE SUGESTÃO PARA CIDADÃO NO FINAL DA PÁGINA --- */}
        {user?.papel === 'CIDADAO' && (
          <div style={{ marginTop: '60px', padding: '40px', background: 'white', borderRadius: '32px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
            <Sparkles size={40} color="var(--purple)" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>Sentiu falta de algum evento?</h3>
            <p style={{ color: '#64748b', marginBottom: '25px' }}>Sugira uma atividade cultural para sua cidade e ajude a prefeitura a melhorar a agenda local!</p>
            <button className="btn-main" style={{ width: 'auto', padding: '15px 40px' }} onClick={() => navigate('/org/anunciar')}>
               <PlusCircle size={20} style={{marginRight: '8px'}} /> Sugerir Novo Evento
            </button>
          </div>
        )}
      </main>

      <Footer />
      {eventoSelecionado && <EventModal evento={eventoSelecionado} onClose={() => setEventoSelecionado(null)} />}
    </div>
  );
}
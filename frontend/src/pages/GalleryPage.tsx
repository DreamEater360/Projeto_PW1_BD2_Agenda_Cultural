import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EventModal } from '../components/EventModal';
import { LayoutDashboard, ShieldCheck, ArrowRight, Sparkles, Calendar, MapPin } from 'lucide-react';
import '../styles/gallery.css';

export function GalleryPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroCat, setFiltroCat] = useState('Todos');
  const [eventoSelecionado, setEventoSelecionado] = useState<any>(null);

  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  const categorias = ['Todos', 'Música', 'Teatro', 'Arte', 'Cinema', 'Danças'];

  useEffect(() => {
    api.get('/events').then(res => setEventos(res.data)).catch(() => {});
  }, []);

  const eventosFiltrados = eventos.filter(ev => {
    const bateBusca = ev.titulo?.toLowerCase().includes(busca.toLowerCase());
    const bateCategoria = filtroCat === 'Todos' || ev.categoria_id?.nome === filtroCat;
    return bateBusca && bateCategoria;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca={busca} setBusca={setBusca} />

      <main className="gallery-container">
        <div className="categories-bar">
          {categorias.map(cat => (
            <button key={cat} className={`category-pill ${filtroCat === cat ? 'active' : ''}`} onClick={() => setFiltroCat(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* --- BLOCO ADMINISTRADOR / GESTOR --- */}
        {(user?.papel === 'ADMINISTRADOR' || user?.papel === 'GESTOR_PUBLICO') && (
          <div className="admin-shortcut-card" style={{ border: '2px solid #0f172a' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <ShieldCheck size={20} />
                <h3 style={{margin: 0}}>Painel de Gestão Pública</h3>
              </div>
              <p>Modere sugestões e gere relatórios de impacto com IA.</p>
            </div>
            <button className="btn-main" style={{ background: '#0f172a', width: 'auto' }} onClick={() => navigate('/admin')}>
              <Sparkles size={18} /> Acessar Dashboard <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* --- BLOCO ORGANIZADOR --- */}
        {user?.papel === 'ORGANIZADOR' && (
          <div className="admin-shortcut-card">
            <div>
              <h3>Olá, Organizador!</h3>
              <p>Gerencie seus eventos e acompanhe as inscrições.</p>
            </div>
            <button className="btn-main" style={{ width: 'auto' }} onClick={() => navigate('/org')}>
              <LayoutDashboard size={18} /> Meu Painel <ArrowRight size={16} />
            </button>
          </div>
        )}

        <h2 style={{ textAlign: 'left', marginBottom: '30px', color: '#1e293b' }}>
          {filtroCat === 'Todos' ? 'Eventos em Destaque' : `Eventos de ${filtroCat}`}
        </h2>

        <div className="event-grid">
          {eventosFiltrados.map(ev => (
            <div key={ev._id} className="card-event">
              <div className="card-image-wrapper">
                <img src={ev.foto_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80'} alt={ev.titulo} />
                <div className="badge-category">{ev.categoria_id?.nome || 'Cultura'}</div>
              </div>
              <div className="card-content">
                <h3 className="event-title">{ev.titulo}</h3>
                <div className="event-info-row"><Calendar size={14} /><span>{new Date(ev.data_inicio).toLocaleDateString('pt-BR')}</span></div>
                <div className="event-info-row"><MapPin size={14} /><span>{ev.localizacao?.nome_local || 'Local não informado'}</span></div>
                <div className="card-footer">
                  <button className="btn-details" onClick={() => setEventoSelecionado(ev)}>Ver Detalhes</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
      {eventoSelecionado && <EventModal evento={eventoSelecionado} onClose={() => setEventoSelecionado(null)} />}
    </div>
  );
}
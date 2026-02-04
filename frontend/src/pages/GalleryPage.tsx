import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EventModal } from '../components/EventModal';
import { LayoutDashboard, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

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

  const eventosFiltrados = eventos.filter(ev => {
    const bateBusca = ev.titulo.toLowerCase().includes(busca.toLowerCase());
    const bateCategoria = filtroCat === 'Todos' || ev.categoria_id?.nome === filtroCat;
    return bateBusca && bateCategoria;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Header busca={busca} setBusca={setBusca} />

      <main className="gallery-container" style={{ flex: 1 }}>
        
        {/* FILTROS */}
        <div className="categories-bar">
          {categorias.map(cat => (
            <button 
              key={cat}
              className={`category-pill ${filtroCat === cat ? 'active' : ''}`}
              onClick={() => setFiltroCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- BLOCO EXCLUSIVO PARA ADMINISTRADOR / GESTOR --- */}
        {(user?.papel === 'ADMINISTRADOR' || user?.papel === 'GESTOR_PUBLICO') && (
          <div className="card" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '40px',
            border: '2px solid #0f172a', // Borda escura para indicar autoridade
            background: 'linear-gradient(to right, #ffffff, #f8fafc)',
            padding: '25px 40px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', marginBottom: '5px' }}>
                <ShieldCheck size={20} />
                <h2 style={{ margin: 0, fontSize: '20px' }}>Painel de Gestão Pública</h2>
              </div>
              <p style={{ margin: 0, color: 'var(--gray)', fontSize: '14px' }}>
                Você pode moderar novas sugestões e gerar relatórios de impacto com IA.
              </p>
            </div>

            <button 
              className="btn-main" 
              style={{ 
                width: 'auto', 
                padding: '12px 25px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                background: '#0f172a', // Cor mais séria para o Admin
                boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)' 
              }}
              onClick={() => navigate('/admin')} // Vai para a AdminPage
            >
              <Sparkles size={18} />
              Acessar Dashboard
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* --- BLOCO EXCLUSIVO PARA ORGANIZADOR --- */}
        {user?.papel === 'ORGANIZADOR' && (
          <div className="card" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '40px',
            border: '2px solid var(--purple)',
            padding: '25px 40px'
          }}>
            <div>
              <h2 style={{ margin: 0, color: 'var(--purple)', fontSize: '20px' }}>Olá, Organizador!</h2>
              <p style={{ margin: '5px 0 0 0', color: 'var(--gray)', fontSize: '14px' }}>Gerencie seus eventos e crie novos anúncios.</p>
            </div>
            <button 
              className="btn-main" 
              style={{ width: 'auto', padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '10px' }}
              onClick={() => navigate('/org')}
            >
              <LayoutDashboard size={20} />
              Meu Painel
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        <h2 style={{ marginBottom: '30px', textAlign: 'left', fontWeight: '800' }}>
          {filtroCat === 'Todos' ? 'Eventos em Destaque' : `Eventos de ${filtroCat}`}
        </h2>

        <div className="event-grid">
          {eventosFiltrados.map(ev => (
            <div key={ev._id} className="card-event">
              <div className="card-image-wrapper">
                <img src={ev.foto_url || 'https://via.placeholder.com/400x200'} alt="" />
                <div className="badge-category">{ev.categoria_id?.nome}</div>
              </div>
              <div className="card-content">
                <h3>{ev.titulo}</h3>
                <div className="event-info-item">📅 {new Date(ev.data_inicio).toLocaleDateString('pt-BR')}</div>
                <div className="event-info-item">📍 {ev.localizacao?.nome_local}</div>
                <div className="card-footer">
                  <button className="btn-main" style={{ borderRadius: '16px' }} onClick={() => setEventoSelecionado(ev)}>
                    Ver Detalhes
                  </button>
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
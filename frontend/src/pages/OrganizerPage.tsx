import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Plus, Eye, EyeOff, Edit3, Calendar, MapPin } from 'lucide-react';
import '../styles/gallery.css'; // Usando o mesmo CSS da galeria

export function OrganizerPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca na rota exclusiva
    api.get('/events/mine')
      .then(res => setEventos(res.data))
      .catch(() => console.error("Erro ao carregar"));
  }, []);

  async function handleToggleVisibility(id: string) {
    try {
      const response = await api.patch(`/events/${id}/toggle`);
      setEventos(prev => prev.map(ev => 
        ev._id === id ? { ...ev, status: response.data.status } : ev
      ));
    } catch (err) { alert("Erro ao mudar status"); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main className="gallery-container">
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' }}>
          <div style={{textAlign: 'left'}}>
            <h2 style={{ margin: 0, color: 'var(--purple)' }}>Meus Eventos</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Gerencie suas publicações na agenda.</p>
          </div>
          <button className="btn-main" style={{ width: 'auto', padding: '15px 25px' }} onClick={() => navigate('/org/anunciar')}>
            <Plus size={20} /> Anunciar Novo Evento
          </button>
        </div>

        {/* MESMA GRID DA GALERIA */}
        <div className="event-grid">
          {eventos.map(ev => (
            <div key={ev._id} className="card-event" style={{ opacity: ev.status === 'APROVADO' ? 1 : 0.6 }}>
              <div className="card-image-wrapper">
                <img src={ev.foto_url || 'https://placehold.co/400x200'} alt="" />
                <div style={{ position: 'absolute', top: 10, left: 10, background: ev.status === 'APROVADO' ? '#22c55e' : '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  {ev.status === 'APROVADO' ? 'Visível' : 'Oculto'}
                </div>
              </div>
              
              <div className="card-content">
                <h3 className="event-title">{ev.titulo}</h3>
                <div className="event-info-row"><Calendar size={14} /> {new Date(ev.data_inicio).toLocaleDateString('pt-BR')}</div>
                <div className="event-info-row"><MapPin size={14} /> {ev.localizacao?.nome_local}</div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => handleToggleVisibility(ev._id)} className="btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px' }}>
                    {ev.status === 'APROVADO' ? <><EyeOff size={18}/> Ocultar</> : <><Eye size={18}/> Mostrar</>}
                  </button>
                  <button className="btn-main" style={{ width: '50px', display: 'flex', justifyContent: 'center', borderRadius: '12px' }}>
                    <Edit3 size={18}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EventModal } from '../components/EventModal';
import { Plus } from 'lucide-react'; 
import { Eye, EyeOff, Edit3 } from 'lucide-react';// Ícone de mais

import '../styles/global.css';
import '../styles/gallery.css';

export function OrganizerPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [eventoSelecionado, setEventoSelecionado] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Busca os eventos da API
    api.get('/events').then(res => setEventos(res.data)).catch(() => {});
  }, []);

  async function handleToggleVisibility(id: string) {
  try {
    const response = await api.patch(`/eventos/${id}/toggle`);
    
    // Atualiza a lista na tela para refletir a mudança na hora
    setEventos(prev => prev.map(ev => 
      ev._id === id ? { ...ev, status: response.data.status } : ev
    ));

    const msg = response.data.status === 'APROVADO' ? "Evento agora está visível!" : "Evento ocultado da galeria.";
    alert(msg);
  } catch (err) {
    alert("Erro ao alterar visibilidade.");
  }
}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca={busca} setBusca={setBusca} />

      <main className="gallery-container" style={{ flex: 1 }}>
        
        {/* --- PAINEL DE AÇÕES DO ORGANIZADOR --- */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '32px', 
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          border: '1px solid #f1f5f9'
        }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--purple)', textAlign: 'left' }}>Meus Eventos</h2>
            <p style={{ margin: 0, color: 'var(--gray)', fontSize: '14px' }}>Gerencie suas publicações na Agenda Cultural.</p>
          </div>

          {/* O BOTÃO QUE ESTAVA FALTANDO AQUI: */}
          <button 
            className="btn-main" 
            style={{ width: 'auto', padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '10px' }}
            onClick={() => navigate('/org/anunciar')} // Redireciona para o formulário
          >
            <Plus size={20} />
            Anunciar Novo Evento
          </button>
        </div>

        {/* Grid de Eventos (Igual ao do cidadão) */}
        <div className="event-grid">
          {eventos.map(ev => (
            <div key={ev._id} className="card-event" style={{ opacity: ev.status === 'APROVADO' ? 1 : 0.6 }}>
              <div className="card-image-wrapper">
                <img src={ev.foto_url || 'https://via.placeholder.com/400x200'} alt="" />
                 <div className={`badge-status ${ev.status === 'APROVADO' ? 'bg-green' : 'bg-red'}`}>
                    {ev.status === 'APROVADO' ? 'Visível' : 'Oculto'}
                 </div>
             </div>
              <div className="card-content">
                <h3>{ev.titulo}</h3>
    
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                {/* BOTÃO DE ALTERNAR VISIBILIDADE */}
                  <button 
                    onClick={() => handleToggleVisibility(ev._id)}
                    className="btn-secondary" 
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}
                    >
                    {ev.status === 'APROVADO' ? <><EyeOff size={18}/> Ocultar</> : <><Eye size={18}/> Mostrar</>}
                  </button>

                  <button className="btn-main" style={{ width: '50px' }}><Edit3 size={18}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {eventoSelecionado && (
        <EventModal evento={eventoSelecionado} onClose={() => setEventoSelecionado(null)} />
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Ticket, User, Heart } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import api from '../services/api';
import '../styles/modal.css';

interface EventModalProps {
  evento: any;
  onClose: () => void;
}

export function EventModal({ evento, onClose }: EventModalProps) {
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Função para criar relação no Neo4j via Backend
  async function handleTenhoInteresse() {
    if (!user) return alert("Você precisa estar logado para demonstrar interesse!");
    
    setLoading(true);
    try {
      await api.post('/interacao/inscrever', { eventoId: evento._id });
      alert("Seu interesse foi registrado com sucesso! 💜");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao registrar interesse.");
    } finally {
      setLoading(false);
    }
  }

  // MongoDB armazena como [long, lat], Leaflet usa [lat, long]
  const position: [number, number] = [
    evento.localizacao.coordinates[1], 
    evento.localizacao.coordinates[0]
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><X /></button>
        
        <img 
          src={evento.foto_url || 'https://via.placeholder.com/800x400'} 
          className="modal-header-img" 
          alt={evento.titulo} 
        />

        <div className="modal-info-section">
          <h2 style={{ textAlign: 'left', margin: '0 0 10px 0', fontSize: '28px' }}>{evento.titulo}</h2>
          <p style={{ color: '#64748b', lineHeight: '1.6' }}>{evento.descricao}</p>

          <div className="details-grid">
            <div className="detail-box">
              <div className="detail-icon"><Calendar size={20} /></div>
              <div>
                <small style={{ color: '#94a3b8', fontWeight: 'bold' }}>DATA</small>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                  {new Date(evento.data_inicio).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="detail-box">
              <div className="detail-icon"><Clock size={20} /></div>
              <div>
                <small style={{ color: '#94a3b8', fontWeight: 'bold' }}>HORA</small>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                  {new Date(evento.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="detail-box">
              <div className="detail-icon"><MapPin size={20} /></div>
              <div>
                <small style={{ color: '#94a3b8', fontWeight: 'bold' }}>LOCAL</small>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{evento.localizacao.nome_local}</p>
              </div>
            </div>
            <div className="detail-box">
              <div className="detail-icon"><Ticket size={20} /></div>
              <div>
                <small style={{ color: '#94a3b8', fontWeight: 'bold' }}>VALOR</small>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                  {evento.valor_ingresso === 0 ? 'Gratuito' : `R$ ${evento.valor_ingresso.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fdf8f9', padding: '15px', borderRadius: '20px', marginBottom: '25px' }}>
            <User color="var(--purple)" size={20} />
            <span style={{ fontSize: '14px' }}>Organizado por: <b>{evento.organizador_id?.nome || 'Instituição Local'}</b></span>
          </div>

          {/* MINI MAPA DO LOCAL */}
          <div style={{ height: '200px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #eee' }}>
            <MapContainer center={position} zoom={16} style={{ height: '100%' }} zoomControl={false} dragging={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position} />
            </MapContainer>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '35px' }}>
            <button 
              className="interest-btn" 
              onClick={handleTenhoInteresse}
              disabled={loading || !user}
            >
              {loading ? 'Processando...' : user ? 'Tenho Interesse' : 'Faça login para participar'}
            </button>
            
            <button style={{ background: '#f1f5f9', border: 'none', width: '60px', borderRadius: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={24} color="#64748b" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
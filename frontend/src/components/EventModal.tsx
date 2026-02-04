import React, { useState } from 'react';
import { X, Calendar, MapPin, Ticket, Heart } from 'lucide-react';
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

  if (!evento) return null;

  // --- TRATAMENTO DE COORDENADAS PARA GEOJSON ---
  // MongoDB guarda [lng, lat], Leaflet quer [lat, lng]
  const coordinates = evento.localizacao?.coordinates;
  const hasCoords = Array.isArray(coordinates) && coordinates.length === 2;
  
  const position: [number, number] = hasCoords 
    ? [coordinates[1], coordinates[0]] 
    : [-6.7612, -38.5623]; // Padrão Cajazeiras/PB

  async function handleInscricao() {
    if (!user) return alert("Você precisa estar logado!");
    setLoading(true);
    try {
      await api.post('/subscriptions', { eventoId: evento._id });
      alert("Inscrição confirmada! 🎉");
    } catch (err: any) {
      alert("Erro ao processar inscrição.");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="modal-overlay" onClick={onClose}>
  <div className="modal-content" onClick={e => e.stopPropagation()}>
    
    {/* Botão de fechar agora fica aqui para aparecer sobre a foto */}
    <button className="modal-close-btn" onClick={onClose}>
      X
    </button>
    
    <img 
      src={evento.foto_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80'} 
      className="modal-header-img" 
      alt={evento.titulo} 
    />

    <div className="modal-info-section">
      <h2>{evento.titulo}</h2>
      <p className="modal-description">{evento.descricao}</p>

      <div className="details-grid">
        <div className="detail-box">
          <Calendar size={18} color="#6b21a8" />
          <div>
            <small>DATA</small>
            <p>{new Date(evento.data_inicio).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <div className="detail-box">
          <Ticket size={18} color="#6b21a8" />
          <div>
            <small>VALOR</small>
            <p>{evento.valor_ingresso > 0 ? `R$ ${evento.valor_ingresso}` : 'Gratuito'}</p>
          </div>
        </div>
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px'}}>
        <MapPin size={16} color="#6b21a8" />
        <span>{evento.localizacao?.nome_local}</span>
      </div>

      {/* Container do Mapa */}
      <div className="modal-map-container">
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} />
        </MapContainer>
      </div>

      <button className="interest-btn" onClick={handleInscricao}>
        Confirmar Presença
      </button>
    </div>
  </div>
</div>
);
}
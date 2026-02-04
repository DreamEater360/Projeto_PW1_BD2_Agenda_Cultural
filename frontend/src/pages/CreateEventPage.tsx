import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MapPicker } from '../components/MapPicker';
import { Search, Calendar, Clock, ImagePlus, Link as LinkIcon } from 'lucide-react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import '../styles/forms.css';

export function CreateEventPage() {
  const navigate = useNavigate();
  const { city, coords: gpsCoords, loading: loadingGps } = useCurrentLocation();
  
  // Estados de dados
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  // Estados de imagem (Dobra de funcionalidade: Arquivo ou Link)
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoUrlExterna, setFotoUrlExterna] = useState('');
  const [usarLinkExterno, setUsarLinkExterno] = useState(false);

  // Estados de Localização
  const [nomeLocal, setNomeLocal] = useState('');
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  // Estados de Data e Hora
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaFim, setHoraFim] = useState('');
  
  // Dados textuais
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor_ingresso: '0',
    categoria_id: ''
  });

  // GPS inicial
  useEffect(() => {
    if (!loadingGps && gpsCoords) {
      setCoords(gpsCoords);
      setNomeLocal(city);
    }
  }, [loadingGps, gpsCoords, city]);

  // Carregar categorias
  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data));
  }, []);

  // Busca geográfica via Nominatim
  async function buscarNoMapa() {
    if (!nomeLocal) return;
    setLoadingSearch(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nomeLocal)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      }
    } finally {
      setLoadingSearch(false);
    }
  }

  // SUBMISSÃO DO FORMULÁRIO
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coords) return alert("Por favor, selecione o local exato no mapa.");

    try {
      const token = localStorage.getItem('token');
      
      // CRIAÇÃO DO FORM DATA (Instanciado no início para evitar ReferenceError)
      const data = new FormData();
      
      // Formatação de data/hora ISO para o MongoDB
      const inicioCompleto = `${dataInicio}T${horaInicio}`;
      const fimCompleto = dataFim && horaFim ? `${dataFim}T${horaFim}` : '';

      // Append dos campos básicos
      data.append('titulo', formData.titulo);
      data.append('descricao', formData.descricao);
      data.append('data_inicio', inicioCompleto);
      if (fimCompleto) data.append('data_fim', fimCompleto);
      
      data.append('valor_ingresso', formData.valor_ingresso);
      data.append('categoria_id', formData.categoria_id);
      data.append('nome_local', nomeLocal);
      data.append('latitude', String(coords.lat));
      data.append('longitude', String(coords.lng));

      // Lógica Poliglota de Imagem:
      if (usarLinkExterno) {
        data.append('foto_url_externa', fotoUrlExterna);
      } else if (foto) {
        data.append('foto', foto);
      }

      await api.post('/events', data, {
        headers: { 
          'Content-Type': 'multipart/form-data', 
          'Authorization': `Bearer ${token}` 
        }
      });

      alert("Evento publicado com sucesso! 🎭");
      navigate('/org');
    } catch (err: any) {
      console.error(err);
      alert("Erro ao publicar evento. Verifique se preencheu todos os campos obrigatorios.");
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main style={{ flex: 1, padding: '40px 20px' }}>
        <div className="form-container">
          <h2 style={{ color: 'var(--purple)', textAlign: 'left', marginBottom: '30px' }}>Anunciar Novo Evento</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>TÍTULO DO EVENTO</label>
              <input type="text" placeholder="Ex: Show de Talentos Local" onChange={e => setFormData({...formData, titulo: e.target.value})} required />
            </div>

            <div className="form-group">
              <label>DESCRIÇÃO</label>
              <textarea placeholder="Conte detalhes sobre o evento..." onChange={e => setFormData({...formData, descricao: e.target.value})} required />
            </div>

            {/* SEÇÃO DE DATA E HORA */}
            <div style={{ marginBottom: '30px', background: '#f8fafc', padding: '25px', borderRadius: '24px', border: '1px solid #f1f5f9'}}>
              <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '14px', color: 'var(--purple)' }}>QUANDO ACONTECE?</p>
              <div className="form-row">
                <div className="form-group">
                  <label><Calendar size={14} /> DATA DE INÍCIO</label>
                  <input type="date" onChange={e => setDataInicio(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label><Clock size={14} /> HORA</label>
                  <input type="time" onChange={e => setHoraInicio(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* CATEGORIA E PREÇO */}
            <div className="form-row">
              <div className="form-group">
                <label>CATEGORIA</label>
                <select onChange={e => setFormData({...formData, categoria_id: e.target.value})} required>
                  <option value="">Selecione uma categoria...</option>
                  {categorias.map(cat => <option key={cat._id} value={cat._id}>{cat.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>VALOR DO INGRESSO (R$)</label>
                <input type="number" step="0.01" placeholder="0.00 (Deixe 0 para Gratuito)" onChange={e => setFormData({...formData, valor_ingresso: e.target.value})} />
              </div>
            </div>

            {/* SEÇÃO DE FOTO (MODALIDADE DUPLA) */}
            <div className="form-group">
              <label>IMAGEM / CARTAZ</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button 
                  type="button" 
                  className={`role-btn ${!usarLinkExterno ? 'active' : ''}`}
                  onClick={() => setUsarLinkExterno(false)}
                  style={{fontSize: '12px', padding: '10px', width: 'auto'}}
                >
                  <ImagePlus size={16} style={{marginRight: '5px'}} /> Upload de Arquivo
                </button>
                <button 
                  type="button" 
                  className={`role-btn ${usarLinkExterno ? 'active' : ''}`}
                  onClick={() => setUsarLinkExterno(true)}
                  style={{fontSize: '12px', padding: '10px', width: 'auto'}}
                >
                  <LinkIcon size={16} style={{marginRight: '5px'}} /> Link da Internet
                </button>
              </div>

              {usarLinkExterno ? (
                <input 
                  type="url" 
                  placeholder="https://exemplo.com/imagem.jpg" 
                  value={fotoUrlExterna}
                  onChange={e => setFotoUrlExterna(e.target.value)}
                  style={{border: '2px solid var(--purple)'}}
                />
              ) : (
                <div className="file-input-wrapper">
                  <input type="file" accept="image/*" onChange={e => setFoto(e.target.files![0])} />
                </div>
              )}
            </div>

            {/* LOCALIZAÇÃO COM MAPA */}
            <div className="form-group">
              <label>ONDE SERÁ O EVENTO?</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="Nome do local (ex: Praça Central)" value={nomeLocal} onChange={e => setNomeLocal(e.target.value)} required />
                <button type="button" onClick={buscarNoMapa} className="btn-purple" style={{ width: '60px' }}>
                   {loadingSearch ? '...' : <Search size={20} />}
                </button>
              </div>
              <div className="map-picker-container">
                <MapPicker targetCoords={coords} onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
              </div>
              <small style={{color: 'var(--gray)'}}>Clique no mapa para marcar o local exato.</small>
            </div>

            <button className="btn-main" type="submit" style={{marginTop: '40px'}}>Publicar Evento Oficial</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MapPicker } from '../components/MapPicker';
import { Search, Calendar, Clock, Send, Loader2, MapPin, ImagePlus, Link as LinkIcon } from 'lucide-react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import '../styles/forms.css';

export function CreateEventPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const { city, coords: gpsCoords, loading: loadingGps } = useCurrentLocation();
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  // ESTADOS PARA IMAGEM
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoUrlExterna, setFotoUrlExterna] = useState('');
  const [usarLinkExterno, setUsarLinkExterno] = useState(false); // Toggle entre Arquivo/Link
  
  const [nomeLocal, setNomeLocal] = useState('');
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor_ingresso: '0',
    categoria_id: ''
  });

  const isCidadao = user?.papel === 'CIDADAO';

  useEffect(() => {
    if (!loadingGps && gpsCoords) {
      setCoords(gpsCoords);
      setNomeLocal(city);
    }
  }, [loadingGps, gpsCoords, city]);

  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data));
  }, []);

  async function buscarNoMapa() {
    if (!nomeLocal.trim()) return;
    setLoadingSearch(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nomeLocal)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      }
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coords) return alert("Selecione o local no mapa!");

    setLoading(true);
    try {
      const data = new FormData();
      const inicioCompleto = `${dataInicio}T${horaInicio}`;

      data.append('titulo', formData.titulo);
      data.append('descricao', formData.descricao);
      data.append('data_inicio', inicioCompleto);
      data.append('valor_ingresso', formData.valor_ingresso);
      data.append('categoria_id', formData.categoria_id);
      data.append('nome_local', nomeLocal);
      data.append('latitude', String(coords.lat));
      data.append('longitude', String(coords.lng));

      // LÓGICA DE FOTO PARA O BACKEND
      if (usarLinkExterno) {
        data.append('foto_url_externa', fotoUrlExterna);
      } else if (foto) {
        data.append('foto', foto);
      }

      await api.post('/events', data);
      alert(isCidadao ? "Sugestão enviada com sucesso! ✨" : "Evento publicado! 🎭");
      navigate('/events');
    } catch (err: any) {
      alert("Erro ao publicar evento. Verifique os campos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main style={{ flex: 1, padding: '40px 20px' }}>
        <div className="form-container">
          <h2 style={{ color: 'var(--purple)', textAlign: 'left', marginBottom: '30px' }}>
            {isCidadao ? 'Sugerir Novo Evento' : 'Anunciar Novo Evento'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>TÍTULO</label>
              <input type="text" required onChange={e => setFormData({...formData, titulo: e.target.value})} />
            </div>

            <div className="form-group">
              <label>DESCRIÇÃO</label>
              <textarea required onChange={e => setFormData({...formData, descricao: e.target.value})} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>DATA</label>
                <input type="date" required onChange={e => setDataInicio(e.target.value)} />
              </div>
              <div className="form-group">
                <label>HORA</label>
                <input type="time" required onChange={e => setHoraInicio(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CATEGORIA</label>
                <select required onChange={e => setFormData({...formData, categoria_id: e.target.value})}>
                  <option value="">Selecione...</option>
                  {categorias.map(cat => <option key={cat._id} value={cat._id}>{cat.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>VALOR DO INGRESSO (R$)</label>
                <input type="number" step="0.01" onChange={e => setFormData({...formData, valor_ingresso: e.target.value})} />
              </div>
            </div>

            {/* SEÇÃO DE FOTO CORRIGIDA */}
            <div className="form-group">
              <label>IMAGEM DO EVENTO</label>
              
              <div className="role-selector" style={{ marginBottom: '15px' }}>
                <button 
                  type="button" 
                  className={`role-btn ${!usarLinkExterno ? 'active' : ''}`}
                  onClick={() => setUsarLinkExterno(false)}
                >
                  <ImagePlus size={16} /> Upload
                </button>
                
              </div>

              {usarLinkExterno ? (
                <input 
                  type="url" 
                  placeholder="Cole aqui a URL da imagem (https://...)" 
                  value={fotoUrlExterna}
                  onChange={e => setFotoUrlExterna(e.target.value)}
                  className="input-link"
                />
              ) : (
                <div className="file-input-wrapper">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setFoto(e.target.files![0])} 
                  />
                  {foto && <p style={{fontSize: '12px', color: 'var(--purple)', marginTop: '10px'}}>✓ {foto.name}</p>}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>ONDE SERÁ O EVENTO?</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Nome do local" 
                  value={nomeLocal} 
                  onChange={e => setNomeLocal(e.target.value)} 
                />
                <button type="button" onClick={buscarNoMapa} className="btn-purple" style={{ width: '60px', marginTop: '10px', borderRadius: '16px' }}>
                   <Search size={20} />
                </button>
              </div>
              <div className="map-picker-container">
                <MapPicker targetCoords={coords} onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
              </div>
            </div>

            <button className="btn-main" type="submit" disabled={loading} style={{marginTop: '30px'}}>
              {loading ? <Loader2 className="spinner" /> : (isCidadao ? 'Enviar Sugestão' : 'Publicar Evento')}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
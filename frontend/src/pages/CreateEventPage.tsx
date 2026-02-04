import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MapPicker } from '../components/MapPicker';
import { Search, Calendar, Clock, ImagePlus, Link as LinkIcon, Send } from 'lucide-react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import '../styles/forms.css';

export function CreateEventPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const { city, coords: gpsCoords, loading: loadingGps } = useCurrentLocation();
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoUrlExterna, setFotoUrlExterna] = useState('');
  const [usarLinkExterno, setUsarLinkExterno] = useState(false);
  const [nomeLocal, setNomeLocal] = useState('');
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaFim, setHoraFim] = useState('');
  
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coords) return alert("Selecione o local no mapa.");

    try {
      const data = new FormData();
      const inicioCompleto = `${dataInicio}T${horaInicio}`;
      const fimCompleto = dataFim && horaFim ? `${dataFim}T${horaFim}` : '';

      data.append('titulo', formData.titulo);
      data.append('descricao', formData.descricao);
      data.append('data_inicio', inicioCompleto);
      if (fimCompleto) data.append('data_fim', fimCompleto);
      data.append('valor_ingresso', formData.valor_ingresso);
      data.append('categoria_id', formData.categoria_id);
      data.append('nome_local', nomeLocal);
      data.append('latitude', String(coords.lat));
      data.append('longitude', String(coords.lng));

      if (usarLinkExterno) {
        data.append('foto_url_externa', fotoUrlExterna);
      } else if (foto) {
        data.append('foto', foto);
      }

      await api.post('/events', data);

      if (isCidadao) {
        alert("Sugestão enviada! Ela passará por análise da prefeitura antes de aparecer na galeria. ✨");
      } else {
        alert("Evento publicado com sucesso! 🎭");
      }
      
      navigate('/events');
    } catch (err: any) {
      alert("Erro ao publicar. Verifique os campos.");
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main style={{ flex: 1, padding: '40px 20px' }}>
        <div className="form-container">
          <h2 style={{ color: 'var(--purple)', textAlign: 'left', marginBottom: '30px' }}>
            {isCidadao ? 'Sugerir Evento para a Cidade' : 'Anunciar Novo Evento'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>TÍTULO</label>
              <input type="text" placeholder="Ex: Roda de Capoeira" onChange={e => setFormData({...formData, titulo: e.target.value})} required />
            </div>

            <div className="form-group">
              <label>DESCRIÇÃO</label>
              <textarea placeholder="Detalhes sobre o evento..." onChange={e => setFormData({...formData, descricao: e.target.value})} required />
            </div>

            <div style={{ marginBottom: '30px', background: '#f8fafc', padding: '25px', borderRadius: '24px', border: '1px solid #f1f5f9'}}>
              <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '14px', color: 'var(--purple)' }}>QUANDO?</p>
              <div className="form-row">
                <div className="form-group">
                  <label><Calendar size={14} /> DATA</label>
                  <input type="date" onChange={e => setDataInicio(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label><Clock size={14} /> HORA</label>
                  <input type="time" onChange={e => setHoraInicio(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CATEGORIA</label>
                <select onChange={e => setFormData({...formData, categoria_id: e.target.value})} required>
                  <option value="">Selecione...</option>
                  {categorias.map(cat => <option key={cat._id} value={cat._id}>{cat.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>VALOR DO INGRESSO</label>
                <input type="number" step="0.01" placeholder="0.00" onChange={e => setFormData({...formData, valor_ingresso: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>IMAGEM</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button type="button" className={`role-btn ${!usarLinkExterno ? 'active' : ''}`} onClick={() => setUsarLinkExterno(false)}>Upload</button>
                <button type="button" className={`role-btn ${usarLinkExterno ? 'active' : ''}`} onClick={() => setUsarLinkExterno(true)}>Link</button>
              </div>
              {usarLinkExterno ? (
                <input type="url" placeholder="https://..." value={fotoUrlExterna} onChange={e => setFotoUrlExterna(e.target.value)} />
              ) : (
                <input type="file" accept="image/*" onChange={e => setFoto(e.target.files![0])} />
              )}
            </div>

            <div className="form-group">
              <label>LOCALIZAÇÃO</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" value={nomeLocal} onChange={e => setNomeLocal(e.target.value)} required />
                <button type="button" onClick={buscarNoMapa} className="btn-purple" style={{ width: '60px' }}>
                   {loadingSearch ? '...' : <Search size={20} />}
                </button>
              </div>
              <div className="map-picker-container">
                <MapPicker targetCoords={coords} onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
              </div>
            </div>

            <button className="btn-main" type="submit" style={{marginTop: '40px'}}>
              {isCidadao ? <><Send size={18}/> Enviar Sugestão</> : 'Publicar Evento'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MapPicker } from '../components/MapPicker';
import { Search, ImagePlus, Calendar, Clock } from 'lucide-react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import '../styles/forms.css';


export function CreateEventPage() {
  const navigate = useNavigate();
  const { city, coords: gpsCoords, loading: loadingGps } = useCurrentLocation();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Estados dos campos individuais
  const [foto, setFoto] = useState<File | null>(null);
  const [nomeLocal, setNomeLocal] = useState('');
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  // Estados separados para Data e Hora (Facilita o uso do mini-calendário/relógio)
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

  useEffect(() => {
    if (!loadingGps && gpsCoords) {
      setCoords(gpsCoords); // Move o marcador do mapa para sua rua/cidade
      setNomeLocal(city);   // Escreve o nome da sua cidade no input automaticamente
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
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      // JUNTANDO DATA E HORA EM UM FORMATO QUE O MONGODB ENTENDE
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
      if (foto) data.append('foto', foto);

      await api.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });

      alert("Evento publicado! 🎭");
      navigate('/org');
    } catch (err: any) {
      alert("Erro ao publicar. Verifique se preencheu data e hora corretamente.");
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main style={{ flex: 1, padding: '40px 20px' }}>
        <div className="form-container">
          <h2 style={{ color: 'var(--purple)' }}>Anunciar Novo Evento</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>TÍTULO</label>
              <input type="text" placeholder="Nome do evento" onChange={e => setFormData({...formData, titulo: e.target.value})} required />
            </div>

            <div className="form-group">
              <label>DESCRIÇÃO</label>
              <textarea placeholder="Detalhes do evento..." onChange={e => setFormData({...formData, descricao: e.target.value})} required />
            </div>

            {/* SEÇÃO DE DATA E HORA COM MINI CALENDÁRIO E RELÓGIO */}
            <div style={{ marginBottom: '30px', border: '1px solid #f1f5f9', padding: '20px', borderRadius: '24px', width: '90%', marginLeft: '30px'}}>
              <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '14px', color: 'var(--purple)' }}>INÍCIO DO EVENTO</p>
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

              <p style={{ margin: '15px 0 15px 0', fontWeight: 'bold', fontSize: '14px', color: 'var(--gray)' }}>TÉRMINO (OPCIONAL)</p>
              <div className="form-row">
                <div className="form-group">
                  <label><Calendar size={14} /> DATA</label>
                  <input type="date" onChange={e => setDataFim(e.target.value)} />
                </div>
                <div className="form-group">
                  <label><Clock size={14} /> HORA</label>
                  <input type="time" onChange={e => setHoraFim(e.target.value)} />
                </div>
              </div>
            </div>

            {/* CATEGORIA E PREÇO */}
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
                <input type="number" placeholder="0.00" onChange={e => setFormData({...formData, valor_ingresso: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>FOTO DO EVENTO</label>
              <input type="file" accept="image/*" onChange={e => setFoto(e.target.files![0])} />
            </div>

            <div className="form-group">
              <label>LOCALIZAÇÃO</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="Nome do local" value={nomeLocal} onChange={e => setNomeLocal(e.target.value)} required />
                <button type="button" onClick={buscarNoMapa} className="btn-purple" style={{ width: '60px' }}><Search size={20} /></button>
              </div>
              <div className="map-picker-container" style={{ height: '300px' }}>
                <MapPicker targetCoords={coords} onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
              </div>
            </div>

            <button className="btn-main" type="submit">Publicar Evento</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
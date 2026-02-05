import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MapPicker } from '../components/MapPicker';
import { Search, Calendar, Clock, Send, Loader2, MapPin } from 'lucide-react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import '../styles/forms.css';

export function CreateEventPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const { city, coords: gpsCoords, loading: loadingGps } = useCurrentLocation();
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoUrlExterna, setFotoUrlExterna] = useState('');
  const [usarLinkExterno, setUsarLinkExterno] = useState(false);
  
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

  // Seta a localização inicial baseada no GPS do navegador
  useEffect(() => {
    if (!loadingGps && gpsCoords) {
      setCoords(gpsCoords);
      setNomeLocal(city);
    }
  }, [loadingGps, gpsCoords, city]);

  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data));
  }, []);

  // --- FUNÇÃO DE BUSCA POR NOME (Reverse Geocoding) ---
  async function buscarNoMapa() {
    if (!nomeLocal.trim()) return;
    
    setLoadingSearch(true);
    try {
      // Usamos a API do OpenStreetMap para buscar as coordenadas pelo nome
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nomeLocal)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newCoords = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
        setCoords(newCoords);
        // Opcional: Atualiza o nome com o endereço completo retornado pela API
        // setNomeLocal(result.display_name); 
      } else {
        alert("Local não encontrado. Tente adicionar o nome da cidade (ex: Praça Matriz, Sousa).");
      }
    } catch (error) {
      alert("Erro ao pesquisar localização no serviço de mapas.");
    } finally {
      setLoadingSearch(false);
    }
  }

  // Permite dar 'Enter' no campo de busca
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarNoMapa();
    }
  };

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

      if (usarLinkExterno) {
        data.append('foto_url_externa', fotoUrlExterna);
      } else if (foto) {
        data.append('foto', foto);
      }

      await api.post('/events', data);
      alert(isCidadao ? "Sugestão enviada para análise!" : "Evento publicado!");
      navigate('/events');
    } catch (err: any) {
      const erros = err.response?.data?.errors 
        ? err.response.data.errors.map((e: any) => e.mensagem).join('\n')
        : "Erro ao publicar.";
      alert(erros);
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
            {isCidadao ? 'Sugerir Evento' : 'Anunciar Novo Evento'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>TÍTULO</label>
              <input type="text" required minLength={3} onChange={e => setFormData({...formData, titulo: e.target.value})} />
            </div>

            <div className="form-group">
              <label>DESCRIÇÃO</label>
              <textarea required minLength={10} onChange={e => setFormData({...formData, descricao: e.target.value})} />
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
                <label>VALOR (R$)</label>
                <input type="number" step="0.01" min="0" onChange={e => setFormData({...formData, valor_ingresso: e.target.value})} />
              </div>
            </div>

            {/* SEÇÃO DE LOCALIZAÇÃO REFORMULADA */}
            <div className="form-group">
              <label>ONDE VAI SER? (NOME DO LOCAL)</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Ex: Praça do Coreto, Cajazeiras" 
                    style={{ paddingLeft: '45px' }}
                    value={nomeLocal} 
                    required
                    onKeyDown={handleKeyPress}
                    onChange={e => setNomeLocal(e.target.value)} 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={buscarNoMapa} 
                  disabled={loadingSearch}
                  className="btn-purple" 
                  style={{ width: '60px',marginTop: '10px', borderRadius: '16px', display: 'flex', justifyContent: 'base-line', alignItems: 'center' }}
                >
                   {loadingSearch ? <Loader2 className="spinner" size={20} /> : <Search size={20} />}
                </button>
              </div>

              <div className="map-picker-container">
                <MapPicker targetCoords={coords} onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', textAlign: 'left' }}>
                💡 <b>Dica:</b> Digite o nome do local e clique na lupa. Você também pode clicar diretamente no mapa para ajustar o ponto.
              </p>
            </div>

            <button className="btn-main" type="submit" disabled={loading} style={{ marginTop: '30px' }}>
              {loading ? <Loader2 className="spinner" /> : <><Send size={18}/> {isCidadao ? 'Enviar Sugestão' : 'Publicar Evento'}</>}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
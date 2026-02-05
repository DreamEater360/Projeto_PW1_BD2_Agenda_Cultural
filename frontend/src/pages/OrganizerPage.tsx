import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MapPicker } from '../components/MapPicker';
import { 
  Plus, Eye, EyeOff, Edit3, Calendar, 
  MapPin, Trash2, Loader2, Clock, Tag, Search 
} from 'lucide-react';
import '../styles/gallery.css';
import '../styles/forms.css'; // Reutilizando estilos de formulário

export function OrganizerPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [editando, setEditando] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const navigate = useNavigate();

  // Estados auxiliares para data/hora separados (para o input HTML)
  const [dataEdit, setDataEdit] = useState('');
  const [horaEdit, setHoraEdit] = useState('');
  const [coordsEdit, setCoordsEdit] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    api.get('/events/mine').then(res => setEventos(res.data));
    api.get('/categorias').then(res => setCategorias(res.data));
  }, []);

  // Quando clicar em editar, preparamos os estados auxiliares
  function abrirEdicao(ev: any) {
    const dataObj = new Date(ev.data_inicio);
    setEditando({ ...ev });
    setDataEdit(dataObj.toISOString().split('T')[0]);
    setHoraEdit(dataObj.toTimeString().substring(0, 5));
    setCoordsEdit({
      lat: ev.localizacao.coordinates[1],
      lng: ev.localizacao.coordinates[0]
    });
  }

  async function handleSalvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        titulo: editando.titulo,
        descricao: editando.descricao,
        valor_ingresso: editando.valor_ingresso,
        data_inicio: `${dataEdit}T${horaEdit}`, // Remonta a data/hora
        categoria_id: editando.categoria_id._id || editando.categoria_id,
        nome_local: editando.localizacao.nome_local,
        latitude: coordsEdit?.lat,
        longitude: coordsEdit?.lng
      };

      const res = await api.patch(`/events/${editando._id}`, payload);
      setEventos(prev => prev.map(ev => ev._id === editando._id ? res.data : ev));
      setEditando(null);
      alert("Evento atualizado com sucesso! ✨");
    } catch (err: any) {
      alert("Erro ao atualizar. Verifique os campos.");
    } finally {
      setLoading(false);
    }
  }

  async function buscarNoMapa() {
    if (!editando.localizacao.nome_local) return;
    setLoadingSearch(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editando.localizacao.nome_local)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setCoordsEdit({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      }
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir permanentemente este evento?")) return;
    try {
      await api.delete(`/events/${id}`);
      setEventos(prev => prev.filter(ev => ev._id !== id));
      setEditando(null);
    } catch (err) { alert("Erro ao excluir."); }
  }

  async function handleToggleVisibility(id: string) {
    try {
      const response = await api.patch(`/events/${id}/toggle`);
      setEventos(prev => prev.map(ev => ev._id === id ? { ...ev, status: response.data.status } : ev));
    } catch (err) { alert("Erro ao mudar status"); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main className="gallery-container">
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' }}>
          <div style={{textAlign: 'left'}}>
            <h2 style={{ margin: 0, color: 'var(--purple)' }}>Meus Eventos</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Gerencie suas publicações.</p>
          </div>
          <button className="btn-main" style={{ width: 'auto', padding: '15px 25px' }} onClick={() => navigate('/org/anunciar')}>
            <Plus size={20} /> Anunciar Novo
          </button>
        </div>

        <div className="event-grid">
          {eventos.map(ev => (
            <div key={ev._id} className="card-event" style={{ opacity: ev.status === 'APROVADO' ? 1 : 0.6 }}>
              <div className="card-image-wrapper">
                <img src={ev.foto_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80'} alt="" />
                <div style={{ position: 'absolute', top: 10, left: 10, background: ev.status === 'APROVADO' ? '#22c55e' : '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  {ev.status === 'APROVADO' ? 'Visível' : 'Oculto'}
                </div>
              </div>
              <div className="card-content">
                <h3 className="event-title">{ev.titulo}</h3>
                <div className="event-info-row"><Calendar size={14} /> {new Date(ev.data_inicio).toLocaleDateString('pt-BR')}</div>
                <button onClick={() => abrirEdicao(ev)} className="btn-details" style={{marginTop: '15px'}}>Editar Evento</button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL DE EDIÇÃO COMPLETO */}
        {editando && (
          <div className="modal-overlay" onClick={() => setEditando(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{padding: '30px', maxWidth: '700px'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px' }}>Editar Evento</h2>
                <button onClick={() => handleDelete(editando._id)} className="btn-icon reject"><Trash2 size={20} /></button>
              </div>

              <form onSubmit={handleSalvarEdicao} className="edit-form-grid">
                <div className="form-group">
                  <label>TÍTULO</label>
                  <input type="text" required minLength={3} value={editando.titulo} onChange={e => setEditando({...editando, titulo: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>DESCRIÇÃO</label>
                  <textarea required minLength={10} value={editando.descricao} onChange={e => setEditando({...editando, descricao: e.target.value})} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><Calendar size={14}/> DATA</label>
                    <input type="date" required value={dataEdit} onChange={e => setDataEdit(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label><Clock size={14}/> HORA</label>
                    <input type="time" required value={horaEdit} onChange={e => setHoraEdit(e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><Tag size={14}/> CATEGORIA</label>
                    <select value={editando.categoria_id._id || editando.categoria_id} onChange={e => setEditando({...editando, categoria_id: e.target.value})}>
                      {categorias.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>VALOR (R$)</label>
                    <input type="number" step="0.01" value={editando.valor_ingresso} onChange={e => setEditando({...editando, valor_ingresso: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>LOCALIZAÇÃO</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      value={editando.localizacao.nome_local} 
                      onChange={e => setEditando({...editando, localizacao: {...editando.localizacao, nome_local: e.target.value}})} 
                    />
                    <button type="button" onClick={buscarNoMapa} className="btn-purple" style={{width: '50px', display: 'flex', justifyContent: 'center'}}>
                      {loadingSearch ? <Loader2 className="spinner" size={18}/> : <Search size={18}/>}
                    </button>
                  </div>
                  <div style={{height: '200px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ddd'}}>
                    <MapPicker targetCoords={coordsEdit} onLocationSelect={(lat, lng) => setCoordsEdit({lat, lng})} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                  <button type="submit" className="btn-main" disabled={loading} style={{flex: 2}}>
                    {loading ? <Loader2 className="spinner" /> : "Salvar Alterações"}
                  </button>
                  <button type="button" className="btn-secondary" style={{flex: 1}} onClick={() => setEditando(null)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
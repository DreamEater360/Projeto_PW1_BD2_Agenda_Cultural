import { useEffect, useState } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EventModal } from '../components/EventModal';
import { 
  Check, 
  X, 
  Sparkles, 
  LayoutDashboard, 
  MapPin, 
  Tag, 
  Eye, 
  FileText, 
  AlertCircle,
  Loader2,
  Users,
  CalendarCheck
} from 'lucide-react';
import '../styles/admin.css';

export function AdminPage() {
  const [tab, setTab] = useState<'moderacao' | 'relatorios'>('moderacao');
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [relatorioData, setRelatorioData] = useState<any>(null);
  const [loadingIA, setLoadingIA] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<any>(null);

  useEffect(() => {
    if (tab === 'moderacao') fetchSuggestions();
  }, [tab]);

  async function fetchSuggestions() {
    setLoadingData(true);
    try {
      const res = await api.get('/adm/sugestoes');
      setSugestoes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }

  async function handleModeration(id: string, status: 'APROVADO' | 'REJEITADO') {
    try {
      await api.patch(`/adm/sugestoes/${id}/status`, { status });
      setSugestoes(prev => prev.filter(s => s._id !== id));
      alert(status === 'APROVADO' ? "Evento publicado!" : "Sugestão rejeitada.");
    } catch (err) {
      alert("Erro na moderação.");
    }
  }

  async function gerarRelatorioEstatistico() {
    setLoadingIA(true);
    try {
      const response = await api.post('/adm/relatorios/gerar', { 
        tipo: "Análise de Impacto Cultural" 
      });
      setRelatorioData(response.data.dados);
    } catch (err: any) {
      alert("Falha ao processar dados do sistema.");
    } finally {
      setLoadingIA(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main className="admin-container" style={{ flex: 1, padding: '40px 20px' }}>
        <div className="admin-grid">
          
          <aside className="admin-sidebar">
            <div className={`sidebar-item ${tab === 'moderacao' ? 'active' : ''}`} onClick={() => setTab('moderacao')}>
              <LayoutDashboard size={20} /> Moderação
            </div>
            <div className={`sidebar-item ${tab === 'relatorios' ? 'active' : ''}`} onClick={() => setTab('relatorios')}>
              <FileText size={20} /> Relatórios
            </div>
          </aside>

          <section className="admin-content-area">
            
            {tab === 'moderacao' && (
              <div className="moderation-card">
                <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                  <h2 style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>Moderação de Eventos</h2>
                  <p style={{ color: '#64748b', marginTop: '5px' }}>Valide as propostas enviadas pelos cidadãos.</p>
                </div>

                {loadingData ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Loader2 className="spinner" size={40} color="var(--purple)" />
                  </div>
                ) : sugestoes.length === 0 ? (
                  <div className="empty-state">
                    <AlertCircle size={48} color="#cbd5e1" />
                    <p>Sem pendências no momento.</p>
                  </div>
                ) : (
                  <div className="suggestions-list">
                    {sugestoes.map(s => (
                      <div key={s._id} className="admin-suggestion-item">
                        <div className="suggestion-info">
                          <h4>{s.titulo}</h4>
                          <div className="suggestion-meta">
                            <span><MapPin size={14} /> {s.localizacao?.nome_local}</span>
                            <span><Tag size={14} /> {s.categoria_id?.nome}</span>
                          </div>
                        </div>
                        <div className="suggestion-actions">
                          <button className="btn-icon view" onClick={() => setEventoSelecionado(s)}><Eye size={20} /></button>
                          <button className="btn-icon approve" onClick={() => handleModeration(s._id, 'APROVADO')}><Check size={20} /></button>
                          <button className="btn-icon reject" onClick={() => handleModeration(s._id, 'REJEITADO')}><X size={20} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'relatorios' && (
              <div className="moderation-card">
                <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                  <h2 style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>Dados do Sistema</h2>
                  <p style={{ color: '#64748b', marginTop: '5px' }}>Indicadores reais de engajamento e eventos.</p>
                </div>

                <button className="btn-main" onClick={gerarRelatorioEstatistico} disabled={loadingIA} style={{ width: 'auto', padding: '15px 30px' }}>
                  {loadingIA ? <><Loader2 className="spinner" size={20} /> Coletando...</> : "Gerar Relatório Atualizado"}
                </button>

                {relatorioData && (
                  <div style={{ marginTop: '30px' }}>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <Users size={20} color="var(--purple)" />
                        <small>USUÁRIOS</small>
                        <h3>{relatorioData.estatisticas.totalUsuarios}</h3>
                      </div>
                      <div className="stat-card">
                        <CalendarCheck size={20} color="var(--purple)" />
                        <small>EVENTOS</small>
                        <h3>{relatorioData.estatisticas.totalEventos}</h3>
                      </div>
                      <div className="stat-card">
                        <Check size={20} color="#22c55e" />
                        <small>APROVADOS</small>
                        <h3 style={{color: '#22c55e'}}>{relatorioData.estatisticas.aprovados}</h3>
                      </div>
                      <div className="stat-card">
                        <AlertCircle size={20} color="#f59e0b" />
                        <small>PENDENTES</small>
                        <h3 style={{color: '#f59e0b'}}>{relatorioData.estatisticas.pendentes}</h3>
                      </div>
                    </div>

                    
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
      {eventoSelecionado && <EventModal evento={eventoSelecionado} onClose={() => setEventoSelecionado(null)} />}
    </div>
  );
}
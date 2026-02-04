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
  Loader2
} from 'lucide-react';
import '../styles/admin.css';

export function AdminPage() {
  const [tab, setTab] = useState<'moderacao' | 'relatorios'>('moderacao');
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [relatorioIA, setRelatorioIA] = useState<string>('');
  const [loadingIA, setLoadingIA] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  // Estado para visualização de detalhes
  const [eventoSelecionado, setEventoSelecionado] = useState<any>(null);

  // Buscar dados de moderação
  useEffect(() => {
    if (tab === 'moderacao') {
      fetchSuggestions();
    }
  }, [tab]);

  async function fetchSuggestions() {
    setLoadingData(true);
    try {
      const res = await api.get('/adm/sugestoes');
      setSugestoes(res.data);
    } catch (err) {
      console.error("Erro ao buscar sugestões:", err);
    } finally {
      setLoadingData(false);
    }
  }

  // Aprovar ou Rejeitar
  async function handleModeration(id: string, status: 'APROVADO' | 'REJEITADO') {
    try {
      await api.patch(`/adm/sugestoes/${id}/status`, { status });
      setSugestoes(prev => prev.filter(s => s._id !== id));
      
      const msg = status === 'APROVADO' 
        ? "Evento aprovado! Ele já está visível na galeria pública." 
        : "Sugestão rejeitada com sucesso.";
      alert(msg);
    } catch (err) {
      alert("Erro ao processar a moderação.");
    }
  }

  // Chamar o Google Gemini
  async function gerarImpactoIA() {
    setLoadingIA(true);
    setRelatorioIA('');
    try {
      const response = await api.post('/adm/relatorios/gerar', { 
        tipo: "Análise de Impacto Cultural" 
      });
      
      if (response.data?.dados?.analise_ia) {
        setRelatorioIA(response.data.dados.analise_ia);
      } else {
        alert("A IA gerou o relatório, mas o conteúdo veio vazio.");
      }
    } catch (err: any) {
      const erroMsg = err.response?.data?.message || "Falha ao consultar a Inteligência Artificial.";
      alert(erroMsg);
    } finally {
      setLoadingIA(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main className="admin-container" style={{ flex: 1, padding: '40px 20px' }}>
        <div className="admin-grid">
          
          {/* MENU LATERAL (SIDEBAR) */}
          <aside className="admin-sidebar">
            <div 
              className={`sidebar-item ${tab === 'moderacao' ? 'active' : ''}`} 
              onClick={() => setTab('moderacao')}
            >
              <LayoutDashboard size={20} /> Moderação
            </div>
            <div 
              className={`sidebar-item ${tab === 'relatorios' ? 'active' : ''}`} 
              onClick={() => setTab('relatorios')}
            >
              <Sparkles size={20} /> Relatórios IA
            </div>
          </aside>

          {/* ÁREA DE CONTEÚDO */}
          <section className="admin-content-area">
            
            {/* ABA DE MODERAÇÃO */}
            {tab === 'moderacao' && (
              <div className="moderation-card">
                <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                  <h2 style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>Moderação de Eventos</h2>
                  <p style={{ color: '#64748b', marginTop: '5px' }}>
                    Valide as propostas enviadas pelos cidadãos antes de publicá-las oficialmente.
                  </p>
                </div>

                {loadingData ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Loader2 className="spinner" size={40} color="var(--purple)" />
                    <p style={{ color: '#64748b', marginTop: '10px' }}>Carregando pendências...</p>
                  </div>
                ) : sugestoes.length === 0 ? (
                  <div className="empty-state">
                    <AlertCircle size={48} color="#cbd5e1" />
                    <p>Não há eventos aguardando aprovação no momento.</p>
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
                            <span>Sugerido por: <b>{s.organizador_id?.nome}</b></span>
                          </div>
                        </div>

                        <div className="suggestion-actions">
                          {/* BOTÃO VER DETALHES (OLHINHO) */}
                          <button 
                            className="btn-icon view" 
                            onClick={() => setEventoSelecionado(s)}
                            title="Ver detalhes completos"
                          >
                            <Eye size={20} />
                          </button>

                          {/* BOTÃO APROVAR */}
                          <button 
                            className="btn-icon approve" 
                            onClick={() => handleModeration(s._id, 'APROVADO')}
                            title="Aprovar e Publicar"
                          >
                            <Check size={20} />
                          </button>

                          {/* BOTÃO REJEITAR */}
                          <button 
                            className="btn-icon reject" 
                            onClick={() => handleModeration(s._id, 'REJEITADO')}
                            title="Rejeitar Sugestão"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ABA DE RELATÓRIOS IA */}
            {tab === 'relatorios' && (
              <div className="moderation-card">
                <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                  <h2 style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>Relatórios de Impacto (IA)</h2>
                  <p style={{ color: '#64748b', marginTop: '5px' }}>
                    Gere análises estratégicas sobre o cenário cultural da cidade usando o Google Gemini.
                  </p>
                </div>

                <div className="ai-controls">
                  <button 
                    className="btn-main" 
                    onClick={gerarImpactoIA} 
                    disabled={loadingIA}
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 30px' }}
                  >
                    {loadingIA ? (
                      <><Loader2 className="spinner" size={20} /> Analisando Dados...</>
                    ) : (
                      <><Sparkles size={20} /> Gerar Análise com Gemini ✨</>
                    )}
                  </button>
                </div>

                {relatorioIA && (
                  <div className="ai-result-container">
                    <div className="ai-header">
                      <FileText size={20} />
                      <span>Relatório Gerado em {new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="ai-body">
                      <p>{relatorioIA}</p>
                    </div>
                    <div className="ai-footer">
                      <Sparkles size={14} /> Powered by Google Gemini 1.5 Flash
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {/* Modal de Detalhes para o Admin revisar antes de aprovar */}
      {eventoSelecionado && (
        <EventModal 
          evento={eventoSelecionado} 
          onClose={() => setEventoSelecionado(null)} 
        />
      )}
    </div>
  );
}
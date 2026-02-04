import { useEffect, useState } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Check, X, Sparkles, FileText, LayoutDashboard } from 'lucide-react';
import '../styles/admin.css';

export function AdminPage() {
  const [tab, setTab] = useState<'moderacao' | 'relatorios'>('moderacao');
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [relatorioIA, setRelatorioIA] = useState<string>('');
  const [loadingIA, setLoadingIA] = useState(false);

  useEffect(() => {
    if (tab === 'moderacao') {
      api.get('/adm/sugestoes').then(res => setSugestoes(res.data));
    }
  }, [tab]);

  // Função para aprovar/rejeitar sugestão
  async function handleModeration(id: string, status: string) {
    try {
      await api.patch(`/adm/sugestoes/${id}/status`, { status });
      setSugestoes(sugestoes.filter(s => s._id !== id));
      alert(`Sugestão ${status.toLowerCase()} com sucesso!`);
    } catch (err) {
      alert("Erro na moderação.");
    }
  }

  // Função para invocar o Google Gemini via Backend
  async function gerarImpactoIA() {
    setLoadingIA(true);
    try {
      const response = await api.post('/adm/relatorios/gerar', { tipo: "Impacto Cultural" });;
      setRelatorioIA(response.data.dados.analise_ia);
    } catch (err) {
      alert("Erro ao consultar a Inteligência Artificial.");
    } finally {
      setLoadingIA(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main className="admin-container" style={{ flex: 1 }}>
        <div className="admin-grid">
          
          {/* Menu Lateral */}
          <aside className="admin-sidebar">
            <div 
              className={`sidebar-item ${tab === 'moderacao' ? 'active' : ''}`}
              onClick={() => setTab('moderacao')}
            >
              <LayoutDashboard size={20} style={{marginRight: '10px'}} /> Moderação
            </div>
            <div 
              className={`sidebar-item ${tab === 'relatorios' ? 'active' : ''}`}
              onClick={() => setTab('relatorios')}
            >
              <Sparkles size={20} style={{marginRight: '10px'}} /> Relatórios IA
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <section>
            {tab === 'moderacao' ? (
              <div className="moderation-card">
                <h2>Sugestões Pendentes</h2>
                <p style={{color: 'var(--gray)', marginBottom: '30px'}}>Valide as propostas enviadas pelos cidadãos.</p>
                
                {sugestoes.length === 0 && <p>Nenhuma sugestão aguardando revisão.</p>}
                
                {sugestoes.map(s => (
                  <div key={s._id} className="suggestion-item">
                    <div>
                      <h4 style={{margin: 0}}>{s.titulo_sugerido}</h4>
                      <p style={{margin: 0, fontSize: '13px', color: 'var(--gray)'}}>Por: {s.usuario?.nome} • {s.local_sugerido}</p>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                      <button 
                        onClick={() => handleModeration(s._id, 'APROVADA')}
                        style={{background: '#dcfce7', color: '#166534', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer'}}
                      >
                        <Check size={20} />
                      </button>
                      <button 
                        onClick={() => handleModeration(s._id, 'REJEITADA')}
                        style={{background: '#fee2e2', color: '#991b1b', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer'}}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="moderation-card">
                <h2>Análise de Impacto Cultural</h2>
                <p style={{color: 'var(--gray)', marginBottom: '30px'}}>Utilize Inteligência Artificial para analisar o cenário da cidade.</p>
                
                <button 
                  className="btn-main" 
                  onClick={gerarImpactoIA} 
                  disabled={loadingIA}
                  style={{width: 'auto', display: 'flex', alignItems: 'center', gap: '10px'}}
                >
                  {loadingIA ? 'IA Analisando dados...' : 'Gerar Análise com Gemini ✨'}
                </button>

                {relatorioIA && (
                  <div className="ai-report-box">
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--purple)'}}>
                      <Sparkles className="sparkle-icon" />
                      <strong style={{fontSize: '18px'}}>Análise da IA</strong>
                    </div>
                    <p style={{whiteSpace: 'pre-wrap'}}>{relatorioIA}</p>
                  </div>
                )}
              </div>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
import { Search, MapPin, LogOut, UserCircle } from 'lucide-react'; // Ícone novo
import { useNavigate } from 'react-router-dom';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

export function Header({ busca, setBusca }: any) {
  const navigate = useNavigate();
  const { city } = useCurrentLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="brand-section">
        <h1 onClick={() => navigate('/events')} style={{cursor: 'pointer'}}>Agenda Cultural</h1>
        <div className="location-tag">
          <MapPin size={14} />
          <span>{city}</span>
        </div>
      </div>

      <div className="search-bar-header">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Buscar eventos..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="user-section">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* ÍCONE DE PERFIL CLICÁVEL */}
            <div 
              onClick={() => navigate('/perfil')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: 'pointer',
                padding: '5px 12px',
                borderRadius: '20px',
                transition: '0.2s'
              }}
              className="profile-trigger"
            >
              <UserCircle size={32} color="var(--purple)" />
            </div>

            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', marginTop: '6.5px' }}>
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button className="btn-purple" onClick={() => navigate('/')}>Entrar</button>
        )}
      </div>
    </header>
  );
}
import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import './Layout.css';
import companyLogo from '../image/alfa-2.png';

const COMPANY_LOGO = companyLogo;

const NAV_ITEMS = {
  admin: [
    { to: '/admin',          label: 'Tableau de bord', icon: '📊' },
    { to: '/admin/users',    label: 'Utilisateurs',    icon: '👥' },
    { to: '/admin/entites',  label: 'Entités',         icon: '🏢' },
    { to: '/admin/rapports', label: 'Rapports',        icon: '📋' },
  ],
  usine: [
    { to: '/usine',           label: 'Tableau de bord', icon: '📊' },
    { to: '/usine/produits',  label: 'Produits',        icon: '🌾' },
    { to: '/usine/stock',     label: 'Stock Usine',     icon: '📦' },
    { to: '/usine/commandes', label: 'Commandes',       icon: '📋' },
  ],
  centre: [
    { to: '/centre',           label: 'Tableau de bord', icon: '📊' },
    { to: '/centre/commandes', label: 'Mes commandes',   icon: '🛒' },
    { to: '/centre/stock',     label: 'Stock Centre',    icon: '📦' },
  ],
  transport: [
    { to: '/transport',            label: 'Tableau de bord', icon: '📊' },
    { to: '/transport/livraisons', label: 'Livraisons',      icon: '🚚' },
    { to: '/transport/camions',    label: 'Camions',         icon: '🚛' },
    { to: '/transport/chauffeurs', label: 'Chauffeurs',      icon: '👤' },
  ],
  chauffeur: [
    { to: '/chauffeur', label: 'Mes livraisons', icon: '🚚' },
  ],
};

const ROLE_COLORS = {
  admin:     '#8b5cf6',
  usine:     '#f59e0b',
  centre:    '#10b981',
  transport: '#3b82f6',
  chauffeur: '#ef4444',
};

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const items            = NAV_ITEMS[user?.role] || [];
  const roleColor        = ROLE_COLORS[user?.role] || '#1e3a5f';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get current page title from nav items
  const currentItem = items.find(i => location.pathname === i.to || location.pathname.startsWith(i.to + '/'));
  const pageTitle   = currentItem?.label || '';

  return (
    <div className="layout">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img className="sidebar-brand-logo" src={COMPANY_LOGO} alt="Alfa Nutrition Animale" />
          <div>
            <div className="sidebar-brand-name">Nutrisud Alfa</div>
            <div className="sidebar-brand-sub">Gestion Logistique</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">NAVIGATION</div>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 2}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: roleColor }}>
            {getInitials(user?.name)}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role-badge" style={{ background: roleColor + '22', color: roleColor }}>
              {user?.role_label}
            </span>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Déconnexion">⏻</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">{pageTitle}</h1>
          </div>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="topbar-avatar" style={{ background: roleColor }}>
                {getInitials(user?.name)}
              </div>
              <span>{user?.name}</span>
            </div>
          </div>
        </div>

        <div className="page-body">
          {children}
        </div>
      </main>
    </div>
  );
}

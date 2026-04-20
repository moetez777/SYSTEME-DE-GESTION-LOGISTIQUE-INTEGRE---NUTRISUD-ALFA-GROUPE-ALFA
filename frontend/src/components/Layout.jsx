import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import './Layout.css';
import companyLogo from '../image/alfa-2.png';

const COMPANY_LOGO = companyLogo;

function DashboardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="13" y="3" width="8" height="5" rx="2" fill="currentColor" opacity="0.85" />
      <rect x="13" y="10" width="8" height="11" rx="2" fill="currentColor" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

function ProduitBagIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M3.5 7.4L12 11.5V22L3.5 17.8V7.4Z" fill="currentColor" opacity="0.85" />
      <path d="M12 11.5L20.5 7.4V17.8L12 22V11.5Z" fill="currentColor" opacity="0.65" />
      <path d="M3.5 7.4L12 3.2L20.5 7.4L12 11.5L3.5 7.4Z" fill="currentColor" />
      <path d="M3.5 7.4L12 11.5L20.5 7.4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 11.5V22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 14.8L8.9 16.2M5.9 16.8L7.8 17.7" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <circle cx="12" cy="7" r="3.5" />
      <circle cx="5.5" cy="8.5" r="2.5" />
      <circle cx="18.5" cy="8.5" r="2.5" />
      <path d="M6.4 20.2V16.3C6.4 13.9 8.3 12 10.7 12H13.3C15.7 12 17.6 13.9 17.6 16.3V20.2C17.6 20.7 17.2 21 16.7 21H7.3C6.8 21 6.4 20.7 6.4 20.2Z" />
      <path d="M0.9 19.8V17.3C0.9 15.6 2.2 14.2 3.9 14.2H6.3C6 14.8 5.8 15.5 5.8 16.3V20.8H1.9C1.3 20.8 0.9 20.4 0.9 19.8Z" />
      <path d="M23.1 19.8V17.3C23.1 15.6 21.8 14.2 20.1 14.2H17.7C18 14.8 18.2 15.5 18.2 16.3V20.8H22.1C22.7 20.8 23.1 20.4 23.1 19.8Z" />
    </svg>
  );
}

function EntityIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M4 21V7.8C4 7.3 4.4 6.9 4.9 6.9H11.6C12.1 6.9 12.5 7.3 12.5 7.8V21" fill="currentColor" opacity="0.9" />
      <path d="M12.5 21V4.9C12.5 4.4 12.9 4 13.4 4H19.1C19.6 4 20 4.4 20 4.9V21" fill="currentColor" />
      <path d="M2.8 21H21.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.7 10H9.8M6.7 13H9.8M6.7 16H9.8" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M14.8 7.6H17.7M14.8 10.6H17.7M14.8 13.6H17.7" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="14.9" y="16.2" width="2.8" height="4.8" rx="0.6" fill="#ffffff" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M7 3.8H14.6L19 8.2V20.1C19 20.6 18.6 21 18.1 21H7C6.5 21 6.1 20.6 6.1 20.1V4.7C6.1 4.2 6.5 3.8 7 3.8Z" fill="currentColor" />
      <path d="M14.6 3.8V7.4C14.6 7.9 15 8.3 15.5 8.3H19" fill="currentColor" opacity="0.65" />
      <path d="M9 11.1H16.1M9 14.2H16.1" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.1 17.8V15.6" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12.2 17.8V13.8" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15.3 17.8V12.3" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14.6 3.8L19 8.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 3.8H14.6L19 8.2V20.1C19 20.6 18.6 21 18.1 21H7C6.5 21 6.1 20.6 6.1 20.1V4.7C6.1 4.2 6.5 3.8 7 3.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CamionIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M3.5 7.2H13.2V16.1H3.5V7.2Z" fill="currentColor" opacity="0.92" />
      <path d="M13.2 9.1H17.2L20.5 12.4V16.1H13.2V9.1Z" fill="currentColor" opacity="0.72" />
      <path d="M5 5.8H12.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 7.2H13.2V16.1H3.5V7.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13.2 9.1H17.2L20.5 12.4V16.1H13.2V9.1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4.7 17.9H16.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7.2" cy="18.5" r="2" fill="currentColor" />
      <circle cx="16.8" cy="18.5" r="2" fill="currentColor" />
      <circle cx="7.2" cy="18.5" r="0.7" fill="#ffffff" />
      <circle cx="16.8" cy="18.5" r="0.7" fill="#ffffff" />
      <path d="M15.1 11.3H17.3" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function LivraisonsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M4.2 6.8H13.4V16.8H4.2V6.8Z" fill="currentColor" opacity="0.9" />
      <path d="M13.4 9.2H16.5L19.7 12.4V16.8H13.4V9.2Z" fill="currentColor" opacity="0.7" />
      <path d="M5.8 18.4C5.8 17.4 6.6 16.6 7.6 16.6C8.6 16.6 9.4 17.4 9.4 18.4C9.4 19.4 8.6 20.2 7.6 20.2C6.6 20.2 5.8 19.4 5.8 18.4Z" fill="currentColor" />
      <path d="M15.4 18.4C15.4 17.4 16.2 16.6 17.2 16.6C18.2 16.6 19 17.4 19 18.4C19 19.4 18.2 20.2 17.2 20.2C16.2 20.2 15.4 19.4 15.4 18.4Z" fill="currentColor" />
      <path d="M13.4 9.2H16.5L19.7 12.4V16.8H13.4V9.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4.2 6.8H13.4V16.8H4.2V6.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3.4 18.4H5.8M9.4 18.4H15.4M19 18.4H20.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16.2 12.4H18.3" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M7.1 11.1C8.7 11.1 10 12.4 10 14C10 15.6 8.7 16.9 7.1 16.9C5.5 16.9 4.2 15.6 4.2 14C4.2 12.4 5.5 11.1 7.1 11.1Z" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

function ChauffeurIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <circle cx="12" cy="8.2" r="3.1" fill="currentColor" />
      <path d="M6.2 20.2C6.6 16.6 8.8 14.6 12 14.6C15.2 14.6 17.4 16.6 17.8 20.2" fill="currentColor" opacity="0.88" />
      <path d="M6.2 20.2C6.6 16.6 8.8 14.6 12 14.6C15.2 14.6 17.4 16.6 17.8 20.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.4 9.4L6.6 11.2L4.8 9.4" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.6 9.4L17.4 11.2L19.2 9.4" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.7 8.1H13.3" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9.7 17.2H14.3" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS = {
  admin: [
    { to: '/admin',          label: 'Dashboard',       icon: <DashboardIcon /> },
    { to: '/admin/produits', label: 'Produits',        icon: <ProduitBagIcon /> },
    { to: '/admin/users',    label: 'Utilisateurs',    icon: <UsersIcon /> },
    { to: '/admin/entites',  label: 'Entités',         icon: <EntityIcon /> },
    { to: '/admin/rapports', label: 'Rapports',        icon: <ReportsIcon /> },
  ],
  usine: [
    { to: '/usine',           label: 'Tableau de bord', icon: <DashboardIcon /> },
    { to: '/usine/produits',  label: 'Produits',        icon: '🌾' },
    { to: '/usine/stock',     label: 'Stock Usine',     icon: '📦' },
    { to: '/usine/commandes', label: 'Commandes',       icon: '📋' },
  ],
  centre: [
    { to: '/centre',           label: 'Tableau de bord', icon: <DashboardIcon /> },
    { to: '/centre/produits',  label: 'Produits',        icon: <ProduitBagIcon /> },
    { to: '/centre/panier',    label: 'Panier',          icon: '🛍️' },
    { to: '/centre/commandes', label: 'Mes commandes',   icon: '🛒' },
    { to: '/centre/stock',     label: 'Stock Centre',    icon: '📦' },
  ],
  transport: [
    { to: '/transport',            label: 'Tableau de bord', icon: <DashboardIcon /> },
    { to: '/transport/livraisons', label: 'Livraisons',      icon: <LivraisonsIcon /> },
    { to: '/transport/camions',    label: 'Camions',         icon: <CamionIcon /> },
    { to: '/transport/chauffeurs', label: 'Chauffeurs',      icon: <ChauffeurIcon /> },
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

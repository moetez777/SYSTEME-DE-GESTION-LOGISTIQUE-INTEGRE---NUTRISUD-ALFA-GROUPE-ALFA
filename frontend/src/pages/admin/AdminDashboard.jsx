import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => setError('Erreur chargement statistiques.'));
  }, []);

  if (error) return <Layout><p className="alert alert-danger">{error}</p></Layout>;
  if (!stats) return <Layout><p>Chargement...</p></Layout>;

  return (
    <Layout>
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card" style={{ color: '#1e3a5f' }}>
          <div className="stat-value">{stats.commandes.total}</div>
          <div className="stat-label">Commandes totales</div>
        </div>
        <div className="stat-card" style={{ color: '#f59e0b' }}>
          <div className="stat-value">{stats.commandes.nouvelle}</div>
          <div className="stat-label">Nouvelles</div>
        </div>
        <div className="stat-card" style={{ color: '#10b981' }}>
          <div className="stat-value">{stats.commandes.confirmee}</div>
          <div className="stat-label">Confirmees</div>
        </div>
        <div className="stat-card" style={{ color: '#ef4444' }}>
          <div className="stat-value">{stats.commandes.refusee}</div>
          <div className="stat-label">Refusees</div>
        </div>
        <div className="stat-card" style={{ color: '#3b82f6' }}>
          <div className="stat-value">{stats.livraisons.total}</div>
          <div className="stat-label">Livraisons</div>
        </div>
        <div className="stat-card" style={{ color: '#10b981' }}>
          <div className="stat-value">{stats.livraisons.livree}</div>
          <div className="stat-label">Livrees</div>
        </div>
        <div className="stat-card" style={{ color: '#8b5cf6' }}>
          <div className="stat-value">{stats.utilisateurs}</div>
          <div className="stat-label">Utilisateurs</div>
        </div>
        <div className="stat-card" style={{ color: '#0891b2' }}>
          <div className="stat-value">{stats.centres_elevage}</div>
          <div className="stat-label">Centres elevage</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Repartition des commandes</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {Object.entries({
            Nouvelles:  stats.commandes.nouvelle,
            'En cours': stats.commandes.en_cours,
            Confirmees: stats.commandes.confirmee,
            Refusees:   stats.commandes.refusee,
            Annulees:   stats.commandes.annulee,
          }).map(([label, val]) => (
            <div key={label} style={{ flex: 1, minWidth: 100, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{val}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

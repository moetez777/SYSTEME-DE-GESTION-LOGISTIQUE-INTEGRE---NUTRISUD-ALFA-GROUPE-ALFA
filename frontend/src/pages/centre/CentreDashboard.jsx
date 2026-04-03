import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function CentreDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data));
  }, []);

  const cards = stats ? [
    { label: 'Mes commandes',            value: stats.mes_commandes ?? stats.total_commandes ?? 0,  color: '#3498db' },
    { label: 'En attente validation',     value: stats.commandes_nouvelles ?? 0,  color: '#f39c12' },
    { label: 'En cours',                  value: stats.commandes_en_cours ?? 0,   color: '#8e44ad' },
    { label: 'Confirmees',                value: stats.commandes_confirmees ?? 0, color: '#27ae60' },
    { label: 'Livraisons en cours',       value: stats.livraisons_en_cours ?? 0,  color: '#e74c3c' },
    { label: 'Livraisons terminees',      value: stats.livraisons_livrees ?? 0,   color: '#1abc9c' },
  ] : [];

  const badgeClass = (s) => `badge badge-${s}`;

  return (
    <Layout>
      <h1 className="page-title">Tableau de bord – Centre d'elevage</h1>

      {!stats && <p>Chargement...</p>}

      <div className="stats-grid">
        {cards.map(c => (
          <div className="stat-card" key={c.label} style={{ color: c.color }}>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {stats?.dernieres_commandes?.length > 0 && (
        <div className="card">
          <h3 className="card-title">Mes dernieres commandes</h3>
          <table className="data-table">
            <thead>
              <tr><th>Ref</th><th>Produit</th><th>Quantite</th><th>Statut</th><th>Date</th></tr>
            </thead>
            <tbody>
              {stats.dernieres_commandes.map(c => (
                <tr key={c.id}>
                  <td>{c.reference || `CMD-${c.id}`}</td>
                  <td>{c.produit?.nom ?? '—'}</td>
                  <td>{c.quantite} {c.produit?.unite}</td>
                  <td><span className={badgeClass(c.statut)}>{c.statut.replace('_', ' ')}</span></td>
                  <td>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

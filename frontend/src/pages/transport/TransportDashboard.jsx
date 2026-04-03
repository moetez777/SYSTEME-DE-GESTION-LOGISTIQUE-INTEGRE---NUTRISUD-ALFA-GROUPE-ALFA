import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function TransportDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data));
  }, []);

  const cards = stats ? [
    { label: 'Livraisons planifiees', value: stats.livraisons_planifiees ?? 0, color: '#3498db' },
    { label: 'En cours',              value: stats.livraisons_en_cours ?? 0,   color: '#f39c12' },
    { label: 'Terminees',             value: stats.livraisons_livrees ?? 0,    color: '#27ae60' },
    { label: 'Camions disponibles',   value: stats.camions_disponibles ?? 0,   color: '#1abc9c' },
    { label: 'Commandes a livrer',    value: stats.commandes_confirmees ?? 0,  color: '#e74c3c' },
    { label: 'Chauffeurs actifs',     value: stats.chauffeurs_actifs ?? 0,     color: '#8e44ad' },
  ] : [];

  return (
    <Layout>
      <h1 className="page-title">Tableau de bord – Transport</h1>

      {!stats && <p>Chargement...</p>}

      <div className="stats-grid">
        {cards.map(c => (
          <div className="stat-card" key={c.label} style={{ color: c.color }}>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {stats?.dernieres_livraisons?.length > 0 && (
        <div className="card">
          <h3 className="card-title">Dernieres livraisons</h3>
          <table className="data-table">
            <thead>
              <tr><th>Ref</th><th>Destination</th><th>Chauffeur</th><th>Camion</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {stats.dernieres_livraisons.map(l => (
                <tr key={l.id}>
                  <td>LIV-{l.id}</td>
                  <td>{l.destination}</td>
                  <td>{l.chauffeur ? `${l.chauffeur.prenom} ${l.chauffeur.nom}` : '—'}</td>
                  <td>{l.camion?.immatriculation ?? '—'}</td>
                  <td><span className={`badge badge-${l.statut}`}>{l.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

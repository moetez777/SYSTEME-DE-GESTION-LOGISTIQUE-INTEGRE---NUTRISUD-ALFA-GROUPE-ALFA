import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function UsineDashboard() {
  const [commandes, setCommandes]= useState([]);
  const [stats, setStats]        = useState(null);

  useEffect(() => {
    api.get('/commandes').then(r => setCommandes(r.data));
    api.get('/dashboard/stats').then(r => setStats(r.data));
  }, []);

  const nouvelles = commandes.filter(c => c.statut === 'nouvelle').length;
  const enCours   = commandes.filter(c => c.statut === 'en_cours').length;

  return (
    <Layout>
      <h1 className="page-title">Tableau de bord – Usine</h1>

      <div className="stats-grid">
        <div className="stat-card" style={{ color: '#f59e0b' }}>
          <div className="stat-value">{nouvelles}</div>
          <div className="stat-label">Commandes nouvelles</div>
        </div>
        <div className="stat-card" style={{ color: '#3b82f6' }}>
          <div className="stat-value">{enCours}</div>
          <div className="stat-label">En cours de preparation</div>
        </div>
        <div className="stat-card" style={{ color: '#1e3a5f' }}>
          <div className="stat-value">{commandes.length}</div>
          <div className="stat-label">Total commandes</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Commandes recentes a traiter</h3>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Centre</th><th>Produit</th><th>Quantite</th><th>Statut</th><th>Date</th></tr>
          </thead>
          <tbody>
            {commandes.filter(c => ['nouvelle', 'en_cours'].includes(c.statut)).slice(0, 5).map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.centre_elevage?.nom}</td>
                <td>{c.produit?.nom}</td>
                <td>{c.quantite} {c.unite}</td>
                <td><span className={`badge badge-${c.statut}`}>{c.statut}</span></td>
                <td>{new Date(c.date_commande).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

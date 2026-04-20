import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function ChauffeurDashboard() {
  const [livraisons, setLivraisons]   = useState([]);
  const [loading, setLoading]         = useState({});
  const [success, setSuccess]         = useState('');

  const load = () => api.get('/livraisons').then(r => setLivraisons(r.data));
  useEffect(() => { load(); }, []);

  const updateStatut = async (id, statut) => {
    const confirmationMessage = statut === 'en_cours'
      ? 'Valider le depart de cette livraison ?'
      : 'Valider la livraison comme terminee ?';

    if (!window.confirm(confirmationMessage)) return;

    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.put(`/livraisons/${id}/status`, { statut });
      setSuccess(statut === 'en_cours' ? 'Depart valide avec succes.' : 'Livraison validee avec succes.');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur.');
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const planifiees  = livraisons.filter(l => l.statut === 'planifiee');
  const en_cours    = livraisons.filter(l => l.statut === 'en_cours');
  const terminees   = livraisons.filter(l => l.statut === 'livree');

  const LivTable = ({ items, showActions }) => (
    <div className="card table-wrapper">
      <table className="data-table">
        <thead>
          <tr><th>#</th><th>Destination</th><th>Commande</th><th>Camion</th><th>Depart prevu</th><th>Depart reel</th><th>Arrivee</th><th>Statut</th>{showActions && <th>Actions</th>}</tr>
        </thead>
        <tbody>
          {items.map(l => (
            <tr key={l.id}>
              <td>LIV-{l.id}</td>
              <td>{l.destination}</td>
              <td>{l.commande?.reference || `CMD-${l.commande_id}`}</td>
              <td>{l.camion?.immatriculation ?? '—'}</td>
              <td>{l.date_depart_prevue ? new Date(l.date_depart_prevue).toLocaleDateString('fr-FR') : '—'}</td>
              <td>{l.depart_reel ? new Date(l.depart_reel).toLocaleString('fr-FR') : '—'}</td>
              <td>{l.arrivee_reel ? new Date(l.arrivee_reel).toLocaleString('fr-FR') : '—'}</td>
              <td><span className={`badge badge-${l.statut}`}>{l.statut}</span></td>
              {showActions && (
                <td>
                  {l.statut === 'planifiee' && (
                    <button
                      className="btn btn-warning btn-sm"
                      disabled={loading[l.id]}
                      onClick={() => updateStatut(l.id, 'en_cours')}
                    >
                      Valider depart
                    </button>
                  )}
                  {l.statut === 'en_cours' && (
                    <button
                      className="btn btn-success btn-sm"
                      disabled={loading[l.id]}
                      onClick={() => updateStatut(l.id, 'livree')}
                    >
                      Valider livraison
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={showActions ? 9 : 8} style={{ textAlign: 'center', color: '#999' }}>Aucune livraison</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <Layout>
      <h1 className="page-title">Mes Livraisons</h1>
      {success && <div className="alert alert-success">{success}</div>}

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
          <div className="stat-value" style={{ color: '#3498db' }}>{planifiees.length}</div>
          <div className="stat-label">Planifiees</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f39c12' }}>
          <div className="stat-value" style={{ color: '#f39c12' }}>{en_cours.length}</div>
          <div className="stat-label">En cours</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#27ae60' }}>
          <div className="stat-value" style={{ color: '#27ae60' }}>{terminees.length}</div>
          <div className="stat-label">Terminees</div>
        </div>
      </div>

      {planifiees.length > 0 && (
        <>
          <h2 className="section-title">Livraisons planifiees</h2>
          <LivTable items={planifiees} showActions={true} />
        </>
      )}

      {en_cours.length > 0 && (
        <>
          <h2 className="section-title">En cours</h2>
          <LivTable items={en_cours} showActions={true} />
        </>
      )}

      {terminees.length > 0 && (
        <>
          <h2 className="section-title">Terminees</h2>
          <LivTable items={terminees} showActions={false} />
        </>
      )}

      {livraisons.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Aucune livraison assignee.
        </div>
      )}
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function CommandesCentre() {
  const [commandes, setCommandes] = useState([]);
  const [filter, setFilter]       = useState('all');

  const load = () => api.get('/commandes').then(r => setCommandes(r.data));

  useEffect(() => {
    load();
  }, []);

  const annuler = async (id) => {
    if (!confirm('Annuler cette commande ?')) return;
    try {
      await api.put(`/commandes/${id}/annuler`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur.');
    }
  };

  const badge = (s) => <span className={`badge badge-${s}`}>{s.replace('_', ' ')}</span>;

  const tabs = ['all', 'nouvelle', 'en_cours', 'confirmee', 'annulee', 'refusee'];
  const visibles = commandes.filter(c => filter === 'all' || c.statut === filter);

  return (
    <Layout>
      <h1 className="page-title">Mes Commandes</h1>

      <div className="actions-bar">
        <span>{commandes.length} commande(s)</span>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t} className={`tab-btn${filter === t ? ' active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'all' ? 'Toutes' : t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="card table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Ref</th><th>Produit</th><th>Quantite</th><th>Societe Aliment</th><th>Statut</th><th>Date</th><th>Livraison</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {visibles.map(cmd => (
              <tr key={cmd.id}>
                <td>{cmd.reference || `CMD-${cmd.id}`}</td>
                <td>{cmd.produit?.nom}</td>
                <td>{cmd.quantite} {cmd.produit?.unite}</td>
                <td>{cmd.societe_aliment?.nom ?? '—'}</td>
                <td>{badge(cmd.statut)}</td>
                <td>{new Date(cmd.created_at).toLocaleDateString('fr-FR')}</td>
                <td>
                  {cmd.livraison
                    ? <span className={`badge badge-${cmd.livraison.statut}`}>{cmd.livraison.statut}</span>
                    : '—'}
                </td>
                <td>
                  {(cmd.statut === 'nouvelle' || cmd.statut === 'en_cours') && (
                    <button className="btn btn-danger btn-sm" onClick={() => annuler(cmd.id)}>Annuler</button>
                  )}
                </td>
              </tr>
            ))}
            {visibles.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#999' }}>Aucune commande</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

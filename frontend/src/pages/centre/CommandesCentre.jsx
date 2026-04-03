import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function CommandesCentre() {
  const { user }              = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits]   = useState([]);
  const [societes, setSocietes]   = useState([]);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ produit_id: '', quantite: '', societe_aliment_id: '', notes: '' });
  const [error, setError]         = useState('');
  const [filter, setFilter]       = useState('all');

  const load = () => api.get('/commandes').then(r => setCommandes(r.data));

  useEffect(() => {
    load();
    api.get('/produits').then(r => setProduits(r.data));
    api.get('/societes-aliment').then(r => setSocietes(r.data)).catch(() => {});
  }, []);

  const passer = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/commandes', {
        centre_elevage_id: user.entity_id,
        produit_id: form.produit_id,
        quantite: parseInt(form.quantite),
        societe_aliment_id: form.societe_aliment_id || undefined,
        notes: form.notes,
      });
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la commande.');
    }
  };

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
        <button className="btn btn-primary" onClick={() => { setForm({ produit_id: produits[0]?.id || '', quantite: '', societe_aliment_id: '', notes: '' }); setError(''); setModal(true); }}>
          + Nouvelle commande
        </button>
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

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Nouvelle commande</div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={passer}>
              <div className="form-group">
                <label>Produit *</label>
                <select className="form-control" value={form.produit_id} onChange={e => setForm({ ...form, produit_id: e.target.value })} required>
                  <option value="">-- Choisir un produit --</option>
                  {produits.map(p => <option key={p.id} value={p.id}>{p.nom} ({p.unite})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Quantite *</label>
                <input type="number" min="1" className="form-control" value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} required />
              </div>
              {societes.length > 0 && (
                <div className="form-group">
                  <label>Societe aliment (optionnel)</label>
                  <select className="form-control" value={form.societe_aliment_id} onChange={e => setForm({ ...form, societe_aliment_id: e.target.value })}>
                    <option value="">-- Automatique --</option>
                    {societes.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-control" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Commander</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

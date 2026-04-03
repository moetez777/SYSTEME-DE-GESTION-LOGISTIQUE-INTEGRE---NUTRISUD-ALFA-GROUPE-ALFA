import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function Livraisons() {
  const [livraisons, setLivraisons]   = useState([]);
  const [commandes, setCommandes]     = useState([]);
  const [camions, setCamions]         = useState([]);
  const [chauffeurs, setChauffeurs]   = useState([]);
  const [modal, setModal]             = useState(null); // 'create' | id (assign)
  const [form, setForm]               = useState({ commande_id: '', date_depart_prevue: '' });
  const [assign, setAssign]           = useState({ camion_id: '', chauffeur_id: '' });
  const [error, setError]             = useState('');
  const [filter, setFilter]           = useState('all');

  const load = () => {
    api.get('/livraisons').then(r => setLivraisons(r.data));
    api.get('/commandes').then(r => setCommandes(r.data.filter(c => c.statut === 'confirmee')));
    api.get('/camions').then(r => setCamions(r.data));
    api.get('/chauffeurs').then(r => setChauffeurs(r.data));
  };
  useEffect(() => { load(); }, []);

  const creer = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/livraisons', {
        commande_id: form.commande_id,
        date_depart_prevue: form.date_depart_prevue || undefined,
      });
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    }
  };

  const affecter = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/livraisons/${modal}/assign`, {
        camion_id: assign.camion_id,
        chauffeur_id: assign.chauffeur_id,
      });
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    }
  };

  const tabs = ['all', 'planifiee', 'en_cours', 'livree'];
  const visibles = livraisons.filter(l => filter === 'all' || l.statut === filter);

  return (
    <Layout>
      <h1 className="page-title">Livraisons</h1>

      <div className="actions-bar">
        <span>{livraisons.length} livraison(s)</span>
        <button className="btn btn-primary" onClick={() => { setForm({ commande_id: commandes[0]?.id || '', date_depart_prevue: '' }); setError(''); setModal('create'); }}>
          + Planifier une livraison
        </button>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t} className={`tab-btn${filter === t ? ' active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'all' ? 'Toutes' : t.replace('_', ' ')}
            <span className="tab-count">{t === 'all' ? livraisons.length : livraisons.filter(x => x.statut === t).length}</span>
          </button>
        ))}
      </div>

      <div className="card table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Commande</th><th>Destination</th><th>Depart prevu</th><th>Camion</th><th>Chauffeur</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {visibles.map(l => (
              <tr key={l.id}>
                <td>LIV-{l.id}</td>
                <td>{l.commande?.reference || `CMD-${l.commande_id}`}</td>
                <td>{l.destination}</td>
                <td>{l.date_depart_prevue ? new Date(l.date_depart_prevue).toLocaleDateString('fr-FR') : '—'}</td>
                <td>{l.camion?.immatriculation ?? <span style={{ color: '#e74c3c' }}>Non affecte</span>}</td>
                <td>{l.chauffeur ? `${l.chauffeur.prenom} ${l.chauffeur.nom}` : <span style={{ color: '#e74c3c' }}>Non affecte</span>}</td>
                <td><span className={`badge badge-${l.statut}`}>{l.statut}</span></td>
                <td>
                  {l.statut === 'planifiee' && (
                    <button className="btn btn-info btn-sm" onClick={() => { setAssign({ camion_id: '', chauffeur_id: '' }); setError(''); setModal(l.id); }}>
                      Affecter
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {visibles.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#999' }}>Aucune livraison</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal creer */}
      {modal === 'create' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Planifier une livraison</div>
            {error && <div className="alert alert-danger">{error}</div>}
            {commandes.length === 0
              ? <p>Aucune commande confirmee disponible.</p>
              : (
                <form onSubmit={creer}>
                  <div className="form-group">
                    <label>Commande confirmee *</label>
                    <select className="form-control" value={form.commande_id} onChange={e => setForm({ ...form, commande_id: e.target.value })} required>
                      <option value="">— Choisir —</option>
                      {commandes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.reference || `CMD-${c.id}`} — {c.centre_elevage?.nom} — {c.produit?.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date de depart prevue</label>
                    <input type="date" className="form-control" value={form.date_depart_prevue} onChange={e => setForm({ ...form, date_depart_prevue: e.target.value })} />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
                    <button type="submit" className="btn btn-primary">Planifier</button>
                  </div>
                </form>
              )}
          </div>
        </div>
      )}

      {/* Modal affecter */}
      {typeof modal === 'number' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Affecter camion & chauffeur – LIV-{modal}</div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={affecter}>
              <div className="form-group">
                <label>Camion *</label>
                <select className="form-control" value={assign.camion_id} onChange={e => setAssign({ ...assign, camion_id: e.target.value })} required>
                  <option value="">— Choisir —</option>
                  {camions.filter(c => c.disponible).map(c => (
                    <option key={c.id} value={c.id}>{c.immatriculation} – {c.modele}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Chauffeur *</label>
                <select className="form-control" value={assign.chauffeur_id} onChange={e => setAssign({ ...assign, chauffeur_id: e.target.value })} required>
                  <option value="">— Choisir —</option>
                  {chauffeurs.filter(c => c.disponible).map(c => (
                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn-success">Affecter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

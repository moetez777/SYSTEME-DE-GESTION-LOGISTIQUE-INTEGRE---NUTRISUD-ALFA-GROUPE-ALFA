import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function StockUsine() {
  const { user }              = useAuth();
  const [stocks, setStocks]   = useState([]);
  const [produits, setProduits]= useState([]);
  const [modal, setModal]     = useState(false);
  const [action, setAction]   = useState('ajouter');
  const [form, setForm]       = useState({ produit_id: '', quantite: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const load = () => api.get('/stocks/aliment').then(r => setStocks(r.data));
  useEffect(() => {
    load();
    api.get('/produits').then(r => setProduits(r.data));
  }, []);

  const openModal = (type) => {
    setAction(type);
    setForm({ produit_id: produits[0]?.id || '', quantite: '' });
    setError('');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/stocks/aliment/${action}`, {
        societe_aliment_id: user.entity_id,
        produit_id: form.produit_id,
        quantite: parseInt(form.quantite),
      });
      setSuccess(`Stock ${action === 'ajouter' ? 'ajoute' : 'retire'} avec succes.`);
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Stock Usine</h1>
      {success && <div className="alert alert-success">{success}</div>}

      <div className="actions-bar">
        <span>{stocks.length} reference(s)</span>
        <div className="actions-bar-right">
          <button className="btn btn-success" onClick={() => openModal('ajouter')}>+ Ajouter stock</button>
          <button className="btn btn-warning" onClick={() => openModal('retirer')}>- Retirer stock</button>
        </div>
      </div>

      <div className="card table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Produit</th><th>Type</th><th>Quantite disponible</th><th>Seuil alerte</th><th>Etat</th><th>Derniere MAJ</th></tr>
          </thead>
          <tbody>
            {stocks.map(s => (
              <tr key={s.id}>
                <td><strong>{s.produit?.nom}</strong></td>
                <td>{s.produit?.type}</td>
                <td>{s.quantite_dispo} {s.produit?.unite}</td>
                <td>{s.seuil_alerte} {s.produit?.unite}</td>
                <td>
                  {s.quantite_dispo <= s.seuil_alerte
                    ? <span className="alerte-stock">⚠ Alerte stock bas</span>
                    : <span style={{ color: '#27ae60' }}>✓ Normal</span>
                  }
                </td>
                <td>{s.date_maj ? new Date(s.date_maj).toLocaleDateString('fr-FR') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{action === 'ajouter' ? 'Ajouter au stock' : 'Retirer du stock'}</div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Produit</label>
                <select className="form-control" value={form.produit_id} onChange={e => setForm({...form, produit_id: e.target.value})} required>
                  {produits.map(p => <option key={p.id} value={p.id}>{p.nom} ({p.unite})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Quantite</label>
                <input type="number" min="1" className="form-control" value={form.quantite} onChange={e => setForm({...form, quantite: e.target.value})} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className={`btn btn-${action === 'ajouter' ? 'success' : 'warning'}`}>
                  {action === 'ajouter' ? 'Ajouter' : 'Retirer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

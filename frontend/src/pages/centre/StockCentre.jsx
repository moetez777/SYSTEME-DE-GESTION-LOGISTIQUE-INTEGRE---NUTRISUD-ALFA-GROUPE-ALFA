import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function StockCentre() {
  const [stocks, setStocks]     = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({ quantite_dispo: '', seuil_alerte: '' });
  const [success, setSuccess]   = useState('');

  const load = () => api.get('/stocks/centre').then(r => setStocks(r.data));
  useEffect(() => { load(); }, []);

  const openEdit = (s) => {
    setForm({ quantite_dispo: s.quantite_dispo, seuil_alerte: s.seuil_alerte });
    setModal(s.id);
  };

  const save = async (e) => {
    e.preventDefault();
    await api.put(`/stocks/centre/${modal}`, {
      quantite_dispo: parseFloat(form.quantite_dispo),
      seuil_alerte: parseFloat(form.seuil_alerte),
    });
    setSuccess('Stock mis a jour.');
    setModal(null);
    load();
  };

  return (
    <Layout>
      <h1 className="page-title">Stock Centre</h1>
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Produit</th><th>Type</th><th>Quantite disponible</th><th>Seuil alerte</th><th>Etat</th><th>Actions</th></tr>
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
                    : <span style={{ color: '#27ae60' }}>✓ Normal</span>}
                </td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => openEdit(s)}>Modifier</button>
                </td>
              </tr>
            ))}
            {stocks.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999' }}>Aucun stock</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Mettre a jour le stock</div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Quantite disponible</label>
                <input type="number" min="0" step="0.01" className="form-control" value={form.quantite_dispo}
                  onChange={e => setForm({ ...form, quantite_dispo: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Seuil d'alerte</label>
                <input type="number" min="0" step="0.01" className="form-control" value={form.seuil_alerte}
                  onChange={e => setForm({ ...form, seuil_alerte: e.target.value })} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

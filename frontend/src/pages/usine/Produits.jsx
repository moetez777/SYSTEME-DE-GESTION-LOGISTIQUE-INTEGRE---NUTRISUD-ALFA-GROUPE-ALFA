import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function Produits() {
  const [produits, setProduits] = useState([]);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState({ nom: '', type: '', unite: 'kg', prix_unitaire: '', description: '' });
  const [error, setError]       = useState('');

  const load = () => api.get('/produits').then(r => setProduits(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: '', type: '', unite: 'kg', prix_unitaire: '', description: '' });
    setError('');
    setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ nom: p.nom, type: p.type, unite: p.unite, prix_unitaire: p.prix_unitaire, description: p.description || '' });
    setError('');
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/produits/${editing.id}`, form);
      } else {
        await api.post('/produits', form);
      }
      setModal(false);
      load();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : 'Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Desactiver ce produit ?')) return;
    await api.delete(`/produits/${id}`);
    load();
  };

  return (
    <Layout>
      <h1 className="page-title">Gestion des produits</h1>

      <div className="alert alert-info" style={{ marginBottom: 12 }}>
        Pour ajouter un produit: cliquez sur <strong>+ Nouveau produit</strong>, remplissez le formulaire puis validez.
        Pour supprimer un produit: cliquez sur <strong>Desactiver</strong> dans la ligne du produit puis confirmez.
      </div>

      <div className="actions-bar">
        <span>{produits.length} produit(s)</span>
        <button className="btn btn-primary" onClick={openCreate}>+ Nouveau produit</button>
      </div>

      <div className="card table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Nom</th><th>Type</th><th>Unite</th><th>Prix unitaire</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {produits.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td><strong>{p.nom}</strong></td>
                <td>{p.type}</td>
                <td>{p.unite}</td>
                <td>{parseFloat(p.prix_unitaire).toFixed(3)} DT</td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => openEdit(p)}>Modifier</button>{' '}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Desactiver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Modifier produit' : 'Nouveau produit'}</div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nom du produit</label>
                <input className="form-control" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})} required>
                  <option value="">-- Selectionner --</option>
                  <option value="demarrage">Demarrage</option>
                  <option value="croissance">Croissance</option>
                  <option value="finition">Finition</option>
                  <option value="ponte">Ponte</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Unite</label>
                <select className="form-control" value={form.unite} onChange={e => setForm({...form, unite: e.target.value})}>
                  <option value="kg">kg</option>
                  <option value="tonne">tonne</option>
                  <option value="sac">sac</option>
                </select>
              </div>
              <div className="form-group">
                <label>Prix unitaire (DT)</label>
                <input type="number" step="0.001" className="form-control" value={form.prix_unitaire} onChange={e => setForm({...form, prix_unitaire: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

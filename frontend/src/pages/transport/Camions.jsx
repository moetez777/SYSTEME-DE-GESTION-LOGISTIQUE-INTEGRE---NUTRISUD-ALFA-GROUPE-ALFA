import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function Camions() {
  const { user }            = useAuth();
  const [camions, setCamions] = useState([]);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({ immatriculation: '', modele: '', capacite: '', disponible: true });
  const [error, setError]   = useState('');

  const load = () => api.get('/camions').then(r => setCamions(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ immatriculation: '', modele: '', capacite: '', disponible: true });
    setError('');
    setModal(true);
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ immatriculation: c.immatriculation, modele: c.modele, capacite: c.capacite, disponible: c.disponible });
    setError('');
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        capacite: parseFloat(form.capacite),
        societe_transport_id: user.entity_id,
      };
      if (editing) {
        await api.put(`/camions/${editing}`, payload);
      } else {
        await api.post('/camions', payload);
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    }
  };

  const destroy = async (id) => {
    if (!confirm('Supprimer ce camion ?')) return;
    await api.delete(`/camions/${id}`);
    load();
  };

  return (
    <Layout>
      <h1 className="page-title">Camions</h1>

      <div className="actions-bar">
        <span>{camions.length} camion(s)</span>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter un camion</button>
      </div>

      <div className="card table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Immatriculation</th><th>Modele</th><th>Capacite (kg)</th><th>Disponible</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {camions.map(c => (
              <tr key={c.id}>
                <td><strong>{c.immatriculation}</strong></td>
                <td>{c.modele}</td>
                <td>{c.capacite}</td>
                <td>
                  {c.disponible
                    ? <span style={{ color: '#27ae60' }}>✓ Disponible</span>
                    : <span style={{ color: '#e74c3c' }}>✗ Occupe</span>}
                </td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => openEdit(c)}>Modifier</button>{' '}
                  <button className="btn btn-danger btn-sm" onClick={() => destroy(c.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
            {camions.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>Aucun camion</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Modifier le camion' : 'Nouveau camion'}</div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={save}>
              <div className="form-group">
                <label>Immatriculation *</label>
                <input className="form-control" value={form.immatriculation} onChange={e => setForm({ ...form, immatriculation: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Modele *</label>
                <input className="form-control" value={form.modele} onChange={e => setForm({ ...form, modele: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Capacite (kg) *</label>
                <input type="number" min="0" step="0.01" className="form-control" value={form.capacite} onChange={e => setForm({ ...form, capacite: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Disponible</label>
                <select className="form-control" value={form.disponible} onChange={e => setForm({ ...form, disponible: e.target.value === 'true' })}>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
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

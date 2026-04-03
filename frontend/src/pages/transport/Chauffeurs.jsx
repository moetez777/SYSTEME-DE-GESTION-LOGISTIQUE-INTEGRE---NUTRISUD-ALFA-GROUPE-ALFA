import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function Chauffeurs() {
  const { user }                = useAuth();
  const [chauffeurs, setChauffeurs] = useState([]);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState({ nom: '', prenom: '', cin: '', telephone: '', disponible: true });
  const [error, setError]       = useState('');

  const load = () => api.get('/chauffeurs').then(r => setChauffeurs(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: '', prenom: '', cin: '', telephone: '', disponible: true });
    setError('');
    setModal(true);
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ nom: c.nom, prenom: c.prenom, cin: c.cin, telephone: c.telephone ?? '', disponible: c.disponible });
    setError('');
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, societe_transport_id: user.entity_id };
      if (editing) {
        await api.put(`/chauffeurs/${editing}`, payload);
      } else {
        await api.post('/chauffeurs', payload);
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    }
  };

  const destroy = async (id) => {
    if (!confirm('Supprimer ce chauffeur ?')) return;
    await api.delete(`/chauffeurs/${id}`);
    load();
  };

  return (
    <Layout>
      <h1 className="page-title">Chauffeurs</h1>

      <div className="actions-bar">
        <span>{chauffeurs.length} chauffeur(s)</span>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter un chauffeur</button>
      </div>

      <div className="card table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Nom complet</th><th>CIN</th><th>Telephone</th><th>Disponible</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {chauffeurs.map(c => (
              <tr key={c.id}>
                <td><strong>{c.prenom} {c.nom}</strong></td>
                <td>{c.cin}</td>
                <td>{c.telephone ?? '—'}</td>
                <td>
                  {c.disponible
                    ? <span style={{ color: '#27ae60' }}>✓ Disponible</span>
                    : <span style={{ color: '#e74c3c' }}>✗ En mission</span>}
                </td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => openEdit(c)}>Modifier</button>{' '}
                  <button className="btn btn-danger btn-sm" onClick={() => destroy(c.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
            {chauffeurs.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>Aucun chauffeur</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Modifier le chauffeur' : 'Nouveau chauffeur'}</div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={save}>
              <div className="form-row">
                <div className="form-group">
                  <label>Prenom *</label>
                  <input className="form-control" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input className="form-control" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>CIN *</label>
                <input className="form-control" value={form.cin} onChange={e => setForm({ ...form, cin: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Telephone</label>
                <input className="form-control" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
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

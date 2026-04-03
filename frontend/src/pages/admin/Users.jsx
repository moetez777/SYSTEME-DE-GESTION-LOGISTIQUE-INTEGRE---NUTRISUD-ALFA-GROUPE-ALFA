import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [roles, setRoles]     = useState([]);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ name: '', email: '', password: '', role_id: '', actif: true });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    api.get('/users').then(r => setUsers(r.data));
    api.get('/roles').then(r => setRoles(r.data));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role_id: roles[0]?.id || '', actif: true });
    setError('');
    setModal(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role_id: u.role_id, actif: u.actif });
    setError('');
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editing) {
        await api.put(`/users/${editing.id}`, payload);
        setSuccess('Utilisateur mis a jour.');
      } else {
        await api.post('/users', payload);
        setSuccess('Utilisateur cree.');
      }
      setModal(false);
      load();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : err.response?.data?.message || 'Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  return (
    <Layout>
      <h1 className="page-title">Gestion des utilisateurs</h1>
      {success && <div className="alert alert-success">{success}</div>}

      <div className="actions-bar">
        <span>{users.length} utilisateur(s)</span>
        <button className="btn btn-primary" onClick={openCreate}>+ Nouvel utilisateur</button>
      </div>

      <div className="card table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Nom</th><th>Email</th><th>Role</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role?.label}</td>
                <td><span className={`badge badge-${u.actif ? 'confirmee' : 'annulee'}`}>{u.actif ? 'Actif' : 'Inactif'}</span></td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => openEdit(u)}>Modifier</button>{' '}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Modifier utilisateur' : 'Nouvel utilisateur'}</div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nom complet</label>
                <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Mot de passe {editing && '(laisser vide pour conserver)'}</label>
                <input type="password" className="form-control" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-control" value={form.role_id} onChange={e => setForm({...form, role_id: e.target.value})} required>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={form.actif} onChange={e => setForm({...form, actif: e.target.checked})} />{' '}
                  Compte actif
                </label>
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

import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

const CENTRE_ELEVAGE_ALLOWED = [
  'HANA',
  'ELGHALIA',
  'ASSILA',
  'ECHIFA',
  'ETTAYSIR',
  'ESSAADA',
  'ELAMEN',
  'ENNAJAH',
  'ELBARAKA',
  'ELFALLAH',
  'ELKHAIR',
  'ERRAHMA',
  'EZZAHRA',
];

const SOCIETE_ALIMENT_ALLOWED = [
  'MEDIMIX',
  'NUTRISUD',
  'SZPAG',
  'SGAC',
  'SNA',
];

const normalizeName = (value = '') => value.trim().toUpperCase();

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [roles, setRoles]     = useState([]);
  const [centres, setCentres] = useState([]);
  const [societesAliment, setSocietesAliment] = useState([]);
  const [societesTransport, setSocietesTransport] = useState([]);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ name: '', email: '', password: '', role_id: '', entity_id: '', societe_transport_name: '', actif: true });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const roleOptions = roles.filter(r => ['usine', 'centre', 'transport'].includes(r.name));
  const displayRoleLabel = (role) => (role?.name === 'transport' ? 'Societe Transport' : role?.label);
  const occupiedTransportSocieteIds = users
    .filter(u => u.role?.name === 'transport' && u.entity_type === 'societe_transport' && u.entity_id)
    .map(u => Number(u.entity_id));

  const getEntityLabel = (user) => {
    if (!user?.entity_id) {
      return '—';
    }

    if (user.role?.name === 'centre') {
      return centres.find(c => String(c.id) === String(user.entity_id))?.nom || '—';
    }

    if (user.role?.name === 'usine') {
      return societesAliment.find(s => String(s.id) === String(user.entity_id))?.nom || '—';
    }

    if (user.role?.name === 'transport') {
      return societesTransport.find(s => String(s.id) === String(user.entity_id))?.nom || '—';
    }

    return '—';
  };

  const centreOptions = CENTRE_ELEVAGE_ALLOWED
    .map((centreName) => centres.find((c) => normalizeName(c.nom) === centreName))
    .filter(Boolean);
  const usingFallbackCentres = centreOptions.length === 0 && centres.length > 0;
  const centreSelectOptions = usingFallbackCentres ? centres : centreOptions;

  const societeAlimentOptions = SOCIETE_ALIMENT_ALLOWED
    .map((societeName) => societesAliment.find((s) => normalizeName(s.nom) === societeName))
    .filter(Boolean);
  const usingFallbackSocietesAliment = societeAlimentOptions.length === 0 && societesAliment.length > 0;
  const societeAlimentSelectOptions = usingFallbackSocietesAliment ? societesAliment : societeAlimentOptions;

  const load = () => {
    api.get('/users').then(r => setUsers(r.data));
    api.get('/roles').then(r => setRoles(r.data));
    api.get('/centres-elevage').then(r => setCentres(r.data)).catch(() => setCentres([]));
    api.get('/societes-aliment').then(r => setSocietesAliment(r.data)).catch(() => setSocietesAliment([]));
    api.get('/societes-transport').then(r => setSocietesTransport(r.data)).catch(() => setSocietesTransport([]));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role_id: roleOptions[0]?.id || '', entity_id: '', societe_transport_name: '', actif: true });
    setError('');
    setModal(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    const societe = societesTransport.find(s => String(s.id) === String(u.entity_id));
    setForm({ name: u.name, email: u.email, password: '', role_id: u.role_id, entity_id: u.entity_id || '', societe_transport_name: societe?.nom || '', actif: u.actif });
    setError('');
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      const selectedRole = roleOptions.find(r => String(r.id) === String(payload.role_id));
      const isCentreRole = selectedRole?.name === 'centre';
      const isUsineRole = selectedRole?.name === 'usine';
      const isTransportRole = selectedRole?.name === 'transport';

      if (isCentreRole && !payload.entity_id) {
        setError('Selectionnez un centre elevage pour ce responsable centre.');
        return;
      }

      if (isUsineRole && !payload.entity_id) {
        setError('Selectionnez une societe aliment pour ce responsable usine.');
        return;
      }

      if (isTransportRole) {
        const name = (payload.societe_transport_name || '').trim().toLowerCase();
        const selectedSociete = societesTransport.find(s => (s.nom || '').trim().toLowerCase() === name);
        if (!selectedSociete) {
          setError('Nom societe transport introuvable. Choisissez une societe existante.');
          return;
        }

        const isAlreadyAssigned = users.some(u =>
          u.role?.name === 'transport' &&
          Number(u.entity_id) === Number(selectedSociete.id) &&
          (!editing || u.id !== editing.id)
        );

        if (isAlreadyAssigned) {
          setError('Cette societe de transport a deja un responsable.');
          return;
        }

        payload.entity_id = selectedSociete.id;
        payload.entity_type = 'societe_transport';
      }

      if (!payload.password) delete payload.password;
      if (!isCentreRole && !isUsineRole && !isTransportRole) {
        delete payload.entity_id;
        delete payload.entity_type;
      } else if (isCentreRole) {
        payload.entity_type = 'centre_elevage';
      } else if (isUsineRole) {
        payload.entity_type = 'societe_aliment';
      }
      delete payload.societe_transport_name;

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

  const selectedRole = roleOptions.find(r => String(r.id) === String(form.role_id));
  const isCentreRole = selectedRole?.name === 'centre';
  const isUsineRole = selectedRole?.name === 'usine';
  const isTransportRole = selectedRole?.name === 'transport';

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
            <tr><th>#</th><th>Nom</th><th>Email</th><th>Role</th><th>Affectation</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{displayRoleLabel(u.role)}</td>
                <td>{getEntityLabel(u)}</td>
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
                  {roleOptions.map(r => <option key={r.id} value={r.id}>{displayRoleLabel(r)}</option>)}
                </select>
              </div>
              {isCentreRole && (
                <div className="form-group">
                  <label>Centre elevage</label>
                  {usingFallbackCentres && (
                    <div className="alert alert-warning" style={{ marginBottom: 8 }}>
                      Les centres demandes (HANA, ELGHALIA, ASSILA...) ne sont pas encore crees en base. Affichage des centres disponibles.
                    </div>
                  )}
                  <select className="form-control" value={form.entity_id || ''} onChange={e => setForm({...form, entity_id: e.target.value})} required>
                    <option value="">-- Selectionner un centre --</option>
                    {centreSelectOptions.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
              )}
              {isUsineRole && (
                <div className="form-group">
                  <label>Societe aliment</label>
                  {usingFallbackSocietesAliment && (
                    <div className="alert alert-warning" style={{ marginBottom: 8 }}>
                      Les societes demandées (MEDIMIX, NUTRISUD, SZPAG, SGAC, SNA) ne sont pas encore toutes crees en base. Affichage des societes disponibles.
                    </div>
                  )}
                  <select className="form-control" value={form.entity_id || ''} onChange={e => setForm({...form, entity_id: e.target.value})} required>
                    <option value="">-- Selectionner une societe --</option>
                    {societeAlimentSelectOptions.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
              )}
              {isTransportRole && (
                <div className="form-group">
                  <label>Nom societe de transport</label>
                  <input
                    className="form-control"
                    list="societes-transport-list"
                    value={form.societe_transport_name || ''}
                    onChange={e => setForm({ ...form, societe_transport_name: e.target.value })}
                    placeholder="Ex: TransLog Sfax"
                    required
                  />
                  <datalist id="societes-transport-list">
                    {societesTransport
                      .filter(s => !occupiedTransportSocieteIds.includes(Number(s.id)) || (editing && Number(editing.entity_id) === Number(s.id)))
                      .map(s => <option key={s.id} value={s.nom} />)}
                  </datalist>
                </div>
              )}
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

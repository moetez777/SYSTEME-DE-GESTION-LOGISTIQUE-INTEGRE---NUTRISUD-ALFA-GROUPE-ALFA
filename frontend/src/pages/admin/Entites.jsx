import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function Entites() {
  const [tab, setTab]             = useState('aliment');
  const [societes, setSocietes]   = useState([]);
  const [elevages, setElevages]   = useState([]);
  const [centres, setCentres]     = useState([]);
  const [transports, setTransport]= useState([]);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({});
  const [error, setError]         = useState('');

  const loadAll = async () => {
    const [a, e, c, t] = await Promise.all([
      api.get('/societes-aliment'),
      api.get('/societes-elevage'),
      api.get('/centres-elevage'),
      api.get('/societes-transport'),
    ]);
    setSocietes(a.data);
    setElevages(e.data);
    setCentres(c.data);
    setTransport(t.data);
  };

  useEffect(() => { loadAll(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoints = {
        aliment:   '/societes-aliment',
        elevage:   '/societes-elevage',
        centre:    '/centres-elevage',
        transport: '/societes-transport',
      };
      await api.post(endpoints[tab], form);
      setModal(false);
      loadAll();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : 'Erreur.');
    }
  };

  const tabs = [
    { key: 'aliment',   label: 'Societes Aliment',   data: societes },
    { key: 'elevage',   label: 'Societes Elevage',    data: elevages },
    { key: 'centre',    label: 'Centres Elevage',     data: centres  },
    { key: 'transport', label: 'Societes Transport',  data: transports },
  ];

  const current = tabs.find(t => t.key === tab);

  return (
    <Layout>
      <h1 className="page-title">Gestion des entites</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            className={`btn ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t.key)}
          >{t.label}</button>
        ))}
      </div>

      <div className="actions-bar">
        <span>{current.data.length} entite(s)</span>
        <button className="btn btn-success" onClick={() => { setForm({}); setError(''); setModal(true); }}>
          + Ajouter
        </button>
      </div>

      <div className="card table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th><th>Nom</th><th>Adresse</th>
              {tab === 'aliment'   && <th>Capacite prod.</th>}
              {tab === 'transport' && <th>Flotte</th>}
              {tab === 'centre'    && <th>Societe Elevage</th>}
              {tab === 'centre'    && <th>Localisation</th>}
            </tr>
          </thead>
          <tbody>
            {current.data.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nom}</td>
                <td>{item.adresse || '-'}</td>
                {tab === 'aliment'   && <td>{item.capacite_prod} kg</td>}
                {tab === 'transport' && <td>{item.flotte} camions</td>}
                {tab === 'centre'    && <td>{item.societe_elevage?.nom}</td>}
                {tab === 'centre'    && <td>{item.localisation}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Ajouter {current.label}</div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nom</label>
                <input className="form-control" value={form.nom || ''} onChange={e => setForm({...form, nom: e.target.value})} required />
              </div>
              {tab !== 'centre' && (
                <>
                  <div className="form-group">
                    <label>Adresse</label>
                    <input className="form-control" value={form.adresse || ''} onChange={e => setForm({...form, adresse: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-control" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Telephone</label>
                    <input className="form-control" value={form.telephone || ''} onChange={e => setForm({...form, telephone: e.target.value})} />
                  </div>
                </>
              )}
              {tab === 'aliment' && (
                <div className="form-group">
                  <label>Capacite production (kg)</label>
                  <input type="number" className="form-control" value={form.capacite_prod || ''} onChange={e => setForm({...form, capacite_prod: e.target.value})} />
                </div>
              )}
              {tab === 'centre' && (
                <>
                  <div className="form-group">
                    <label>Societe Elevage</label>
                    <select className="form-control" value={form.societe_elevage_id || ''} onChange={e => setForm({...form, societe_elevage_id: e.target.value})} required>
                      <option value="">-- Selectionner --</option>
                      {elevages.map(ev => <option key={ev.id} value={ev.id}>{ev.nom}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Localisation</label>
                    <input className="form-control" value={form.localisation || ''} onChange={e => setForm({...form, localisation: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Capacite (volailles)</label>
                    <input type="number" className="form-control" value={form.capacite || ''} onChange={e => setForm({...form, capacite: e.target.value})} />
                  </div>
                </>
              )}
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

import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

const STATUTS = ['nouvelle', 'en_cours', 'confirmee', 'refusee'];

export default function CommandesUsine() {
  const [commandes, setCommandes] = useState([]);
  const [transports, setTransports] = useState([]);
  const [filter, setFilter]       = useState('nouvelle');
  const [notes, setNotes]         = useState({});
  const [loading, setLoading]     = useState({});
  const [success, setSuccess]     = useState('');
  const [transportModal, setTransportModal] = useState({show: false, commandeId: null});
  const [selectedTransport, setSelectedTransport] = useState('');

  const load = () => api.get('/commandes').then(r => setCommandes(r.data));
  
  useEffect(() => { 
    load();
    // Load transport companies
    api.get('/societes-transport', { 
      params: { limit: 100 } 
    }).then(r => setTransports(r.data)).catch(() => setTransports([]));
  }, []);

  const openTransportModal = (commandeId) => {
    setTransportModal({show: true, commandeId});
    setSelectedTransport('');
  };

  const closeTransportModal = () => {
    setTransportModal({show: false, commandeId: null});
    setSelectedTransport('');
  };

  const confirmWithTransport = async () => {
    if (!selectedTransport) {
      alert('Veuillez sélectionner une société de transport.');
      return;
    }
    await updateStatus(transportModal.commandeId, 'confirmee', selectedTransport);
    closeTransportModal();
  };

  const updateStatus = async (id, statut, societeTransportId = null) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const payload = { 
        statut, 
        notes: notes[id] || '',
        societe_transport_id: societeTransportId
      };
      await api.put(`/commandes/${id}/status`, payload);
      setSuccess('Statut mis à jour.');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur.');
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const visibles = commandes.filter(c => filter === 'all' || c.statut === filter);

  const statusBadge = (s) => <span className={`badge badge-${s}`}>{s.replace('_', ' ')}</span>;

  return (
    <Layout>
      <h1 className="page-title">Commandes</h1>
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tabs">
        {['all', ...STATUTS].map(s => (
          <button key={s} className={`tab-btn${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'Toutes' : s.replace('_', ' ')}
            {s !== 'all' && (
              <span className="tab-count">{commandes.filter(c => c.statut === s).length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="card table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th><th>Centre</th><th>Produit</th><th>Quantite</th>
              <th>Date demande</th><th>Statut</th><th>Notes</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map(cmd => (
              <tr key={cmd.id}>
                <td>{cmd.reference || `CMD-${cmd.id}`}</td>
                <td>{cmd.centre_elevage?.nom}</td>
                <td>{cmd.produit?.nom}</td>
                <td>{cmd.quantite} {cmd.produit?.unite}</td>
                <td>{new Date(cmd.created_at).toLocaleDateString('fr-FR')}</td>
                <td>{statusBadge(cmd.statut)}</td>
                <td>
                  {(cmd.statut === 'nouvelle' || cmd.statut === 'en_cours') && (
                    <input
                      className="form-control form-control-sm"
                      placeholder="Notes..."
                      value={notes[cmd.id] || ''}
                      onChange={e => setNotes(prev => ({ ...prev, [cmd.id]: e.target.value }))}
                    />
                  )}
                  {cmd.notes && cmd.statut !== 'nouvelle' ? <small>{cmd.notes}</small> : null}
                </td>
                <td>
                  {cmd.statut === 'nouvelle' && (
                    <>
                      <button
                        className="btn btn-info btn-sm"
                        disabled={loading[cmd.id]}
                        onClick={() => updateStatus(cmd.id, 'en_cours')}
                      >En cours</button>{' '}
                      <button
                        className="btn btn-success btn-sm"
                        disabled={loading[cmd.id]}
                        onClick={() => openTransportModal(cmd.id)}
                      >Confirmer</button>{' '}
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={loading[cmd.id]}
                        onClick={() => updateStatus(cmd.id, 'refusee')}
                      >Refuser</button>
                    </>
                  )}
                  {cmd.statut === 'en_cours' && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        disabled={loading[cmd.id]}
                        onClick={() => openTransportModal(cmd.id)}
                      >Confirmer</button>{' '}
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={loading[cmd.id]}
                        onClick={() => updateStatus(cmd.id, 'refusee')}
                      >Refuser</button>
                    </>
                  )}
                  {(cmd.statut === 'confirmee' || cmd.statut === 'refusee' || cmd.statut === 'annulee') && (
                    <span style={{ color: '#999', fontSize: '12px' }}>—</span>
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

      {/* Transport Selection Modal */}
      {transportModal.show && (
        <div className="modal-overlay" onClick={closeTransportModal}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sélectionner Société de Transport</h2>
              <button className="modal-close" onClick={closeTransportModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Société de Transport <span style={{color: 'red'}}>*</span></label>
                <select
                  className="form-control"
                  value={selectedTransport}
                  onChange={e => setSelectedTransport(e.target.value)}
                >
                  <option value="">-- Choisir une société --</option>
                  {transports.map(t => (
                    <option key={t.id} value={t.id}>{t.nom}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeTransportModal}>Annuler</button>
              <button 
                className="btn btn-success" 
                disabled={!selectedTransport || loading[transportModal.commandeId]}
                onClick={confirmWithTransport}
              >Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

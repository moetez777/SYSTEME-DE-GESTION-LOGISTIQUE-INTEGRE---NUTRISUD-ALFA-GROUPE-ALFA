import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

const CART_KEY = 'centre_panier';

function readCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

export default function PanierCentre() {
  const { user } = useAuth();
  const hasLinkedCentre = Boolean(user?.entity_id);

  const [items, setItems] = useState([]);
  const [societesAliment, setSocietesAliment] = useState([]);
  const [societeAlimentId, setSocieteAlimentId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(readCart());
    api.get('/societes-aliment').then((res) => {
      const list = res.data || [];
      setSocietesAliment(list);
      if (list.length > 0) {
        setSocieteAlimentId(String(list[0].id));
      }
    }).catch(() => setSocietesAliment([]));
  }, []);

  const persist = (nextItems) => {
    setItems(nextItems);
    localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
  };

  const increase = (produitId) => {
    const next = items.map((item) => (
      item.produit_id === produitId ? { ...item, quantite: item.quantite + 1 } : item
    ));
    persist(next);
  };

  const decrease = (produitId) => {
    const next = items
      .map((item) => (
        item.produit_id === produitId ? { ...item, quantite: Math.max(1, item.quantite - 1) } : item
      ));
    persist(next);
  };

  const removeItem = (produitId) => {
    const next = items.filter((item) => item.produit_id !== produitId);
    persist(next);
  };

  const clearCart = () => {
    persist([]);
    setMessage('Panier vide.');
    setError('');
  };

  const total = useMemo(() => (
    items.reduce((sum, item) => sum + (Number(item.prix_unitaire || 0) * Number(item.quantite || 0)), 0)
  ), [items]);

  const passerCommande = async () => {
    if (!hasLinkedCentre) {
      setError('Votre compte n est pas lie a un centre d elevage.');
      setMessage('');
      return;
    }
    if (items.length === 0) {
      setError('Votre panier est vide.');
      setMessage('');
      return;
    }
    if (!societeAlimentId) {
      setError('Veuillez choisir une societe aliment.');
      setMessage('');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await Promise.all(items.map((item) => api.post('/commandes', {
        centre_elevage_id: user.entity_id,
        societe_aliment_id: Number(societeAlimentId),
        produit_id: item.produit_id,
        quantite: Number(item.quantite),
      })));

      persist([]);
      setMessage('Commande envoyee avec succes. Vous pouvez verifier Mes commandes.');
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      setError(apiMessage || 'Erreur lors de l envoi de la commande.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Panier</h1>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card table-wrapper">
        <div className="panier-company-select">
          <label className="form-group" style={{ marginBottom: 0 }}>
            <span style={{ display: 'block', marginBottom: 6 }}>Societe aliment</span>
            <select
              className="form-control"
              value={societeAlimentId}
              onChange={(e) => setSocieteAlimentId(e.target.value)}
              required
            >
              <option value="">-- Choisir une societe aliment --</option>
              {societesAliment.map((s) => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </label>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Prix unitaire</th>
              <th>Quantite</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.produit_id}>
                <td>
                  <strong>{item.nom}</strong>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>{item.unite}</div>
                </td>
                <td>{Number(item.prix_unitaire || 0).toFixed(3)} DT</td>
                <td>
                  <div className="qty-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => decrease(item.produit_id)}>-</button>
                    <span>{item.quantite}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => increase(item.produit_id)}>+</button>
                  </div>
                </td>
                <td>{(Number(item.prix_unitaire || 0) * Number(item.quantite || 0)).toFixed(3)} DT</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.produit_id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#6b7280' }}>
                  Panier vide.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panier-summary">
        <div className="panier-total">Total panier: <strong>{total.toFixed(3)} DT</strong></div>
        <div className="panier-actions">
          <button className="btn btn-secondary" onClick={clearCart} disabled={items.length === 0 || submitting}>
            Vider panier
          </button>
          <button className="btn btn-primary" onClick={passerCommande} disabled={items.length === 0 || submitting}>
            {submitting ? 'Envoi...' : 'Passer commande'}
          </button>
        </div>
      </div>
    </Layout>
  );
}

import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

const CART_KEY = 'centre_panier';

function getTypeVisual(type = '') {
  const key = String(type).toLowerCase();

  if (key.includes('demarrage')) {
    return { emoji: '🐣', bg: 'linear-gradient(135deg, #ffe7b3, #ffd17a)' };
  }
  if (key.includes('croissance')) {
    return { emoji: '🌱', bg: 'linear-gradient(135deg, #d7f7cf, #9de7b0)' };
  }
  if (key.includes('finition')) {
    return { emoji: '🌾', bg: 'linear-gradient(135deg, #f9f0c5, #efd982)' };
  }
  if (key.includes('ponte')) {
    return { emoji: '🥚', bg: 'linear-gradient(135deg, #fff7db, #fee7a6)' };
  }

  return { emoji: '📦', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' };
}

function shortText(value, max = 92) {
  if (!value) return 'Produit alimentaire pour le centre d elevage.';
  return value.length > max ? `${value.slice(0, max).trim()}...` : value;
}

export default function ProduitsCentre() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    api.get('/produits')
      .then((res) => setProduits(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const totalProduits = useMemo(() => produits.length, [produits]);

  const addToCart = (produit) => {
    const current = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    const existing = current.find((item) => item.produit_id === produit.id);

    if (existing) {
      existing.quantite += 1;
    } else {
      current.push({
        produit_id: produit.id,
        nom: produit.nom,
        unite: produit.unite,
        prix_unitaire: Number(produit.prix_unitaire || 0),
        description: produit.description || '',
        type: produit.type || '',
        quantite: 1,
      });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(current));
    setAddedId(produit.id);
    setTimeout(() => setAddedId(null), 1000);
  };

  return (
    <Layout>
      <h1 className="page-title">Produits</h1>

      <div className="actions-bar">
        <span>{totalProduits} produit(s) disponible(s)</span>
      </div>

      {loading && <p>Chargement des produits...</p>}

      {!loading && (
        <div className="produits-grid">
          {produits.map((produit) => {
            const visual = getTypeVisual(produit.type);
            return (
              <article className="produit-card" key={produit.id}>
                <div className="produit-cover" style={{ background: visual.bg }}>
                  <span className="produit-emoji" aria-hidden="true">{visual.emoji}</span>
                </div>

                <div className="produit-content">
                  <div className="produit-header">
                    <h3>{produit.nom}</h3>
                    <span className="badge badge-confirmee">{produit.type}</span>
                  </div>

                  <p className="produit-price">
                    {Number(produit.prix_unitaire || 0).toFixed(3)} DT / {produit.unite}
                  </p>

                  <p className="produit-description">{shortText(produit.description)}</p>

                  <button
                    className="btn btn-primary"
                    onClick={() => addToCart(produit)}
                  >
                    {addedId === produit.id ? 'Ajoute au panier' : 'Ajouter au panier'}
                  </button>
                </div>
              </article>
            );
          })}

          {produits.length === 0 && (
            <div className="card">
              <p>Aucun produit actif pour le moment.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

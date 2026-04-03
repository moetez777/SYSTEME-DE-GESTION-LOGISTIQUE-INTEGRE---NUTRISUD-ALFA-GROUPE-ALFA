import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function Rapports() {
  const [loading, setLoading] = useState(false);

  const download = async (format) => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/export?format=${format}`, {
        responseType: 'blob',
      });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `rapport_commandes.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (_) {
      alert('Erreur generation rapport.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Rapports</h1>
      <div className="card" style={{ maxWidth: 400 }}>
        <h3 style={{ marginTop: 0 }}>Exporter les commandes</h3>
        <p style={{ color: '#666', fontSize: 13 }}>
          Telecharger un rapport complet de toutes les commandes avec le statut des livraisons.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-success" onClick={() => download('excel')} disabled={loading}>
            Exporter Excel (.xlsx)
          </button>
          <button className="btn btn-danger" onClick={() => download('pdf')} disabled={loading}>
            Exporter PDF
          </button>
        </div>
        {loading && <p style={{ marginTop: 10, color: '#888' }}>Generation en cours...</p>}
      </div>
    </Layout>
  );
}

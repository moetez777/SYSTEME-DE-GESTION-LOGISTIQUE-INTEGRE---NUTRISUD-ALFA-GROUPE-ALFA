import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages publiques
import Login from './pages/Login';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import Users          from './pages/admin/Users';
import Rapports       from './pages/admin/Rapports';
import Entites        from './pages/admin/Entites';

// Usine
import UsineDashboard  from './pages/usine/UsineDashboard';
import Produits        from './pages/usine/Produits';
import StockUsine      from './pages/usine/StockUsine';
import CommandesUsine  from './pages/usine/CommandesUsine';

// Centre
import CentreDashboard  from './pages/centre/CentreDashboard';
import ProduitsCentre   from './pages/centre/ProduitsCentre';
import PanierCentre     from './pages/centre/PanierCentre';
import CommandesCentre  from './pages/centre/CommandesCentre';
import StockCentre      from './pages/centre/StockCentre';

// Transport
import TransportDashboard from './pages/transport/TransportDashboard';
import Livraisons         from './pages/transport/Livraisons';
import Camions            from './pages/transport/Camions';
import Chauffeurs         from './pages/transport/Chauffeurs';

// Chauffeur
import ChauffeurDashboard from './pages/chauffeur/ChauffeurDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/produits" element={<ProtectedRoute roles={['admin']}><Produits /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="/admin/rapports" element={<ProtectedRoute roles={['admin']}><Rapports /></ProtectedRoute>} />
          <Route path="/admin/entites" element={<ProtectedRoute roles={['admin']}><Entites /></ProtectedRoute>} />

          {/* Usine */}
          <Route path="/usine" element={<ProtectedRoute roles={['usine']}><UsineDashboard /></ProtectedRoute>} />
          <Route path="/usine/produits" element={<ProtectedRoute roles={['usine', 'admin']}><Produits /></ProtectedRoute>} />
          <Route path="/usine/stock" element={<ProtectedRoute roles={['usine']}><StockUsine /></ProtectedRoute>} />
          <Route path="/usine/commandes" element={<ProtectedRoute roles={['usine']}><CommandesUsine /></ProtectedRoute>} />

          {/* Centre */}
          <Route path="/centre" element={<ProtectedRoute roles={['centre']}><CentreDashboard /></ProtectedRoute>} />
          <Route path="/centre/produits" element={<ProtectedRoute roles={['centre']}><ProduitsCentre /></ProtectedRoute>} />
          <Route path="/centre/panier" element={<ProtectedRoute roles={['centre']}><PanierCentre /></ProtectedRoute>} />
          <Route path="/centre/commandes" element={<ProtectedRoute roles={['centre']}><CommandesCentre /></ProtectedRoute>} />
          <Route path="/centre/stock" element={<ProtectedRoute roles={['centre']}><StockCentre /></ProtectedRoute>} />

          {/* Transport */}
          <Route path="/transport" element={<ProtectedRoute roles={['transport']}><TransportDashboard /></ProtectedRoute>} />
          <Route path="/transport/livraisons" element={<ProtectedRoute roles={['transport']}><Livraisons /></ProtectedRoute>} />
          <Route path="/transport/camions" element={<ProtectedRoute roles={['transport']}><Camions /></ProtectedRoute>} />
          <Route path="/transport/chauffeurs" element={<ProtectedRoute roles={['transport']}><Chauffeurs /></ProtectedRoute>} />

          {/* Chauffeur */}
          <Route path="/chauffeur" element={<ProtectedRoute roles={['chauffeur']}><ChauffeurDashboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import companyLogo from '../image/alfa-2.png';

const COMPANY_LOGO = companyLogo;

const ROLE_ROUTES = {
  admin:     '/admin',
  usine:     '/usine',
  centre:    '/centre',
  transport: '/transport',
  chauffeur: '/chauffeur',
};

export default function Login() {
  const { login, verifyLoginCode } = useAuth();
  const navigate    = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode]         = useState('');
  const [error, setError]       = useState('');
  const [notice, setNotice]     = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [challengeToken, setChallengeToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSiteCode('');
    setLoading(true);
    try {
      const result = await login(email, password);

      if (result?.requires_verification) {
        setChallengeToken(result.challenge_token);
        setNotice(result.message || 'Code de verification genere par la plateforme.');
        if (result?.verification_channel === 'site' && result?.verification_code) {
          setSiteCode(result.verification_code);
        }
        return;
      }

      navigate(ROLE_ROUTES[result.user.role] || '/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const user = await verifyLoginCode(challengeToken, code);
      navigate(ROLE_ROUTES[user.role] || '/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-main">
        {/* ── LOGIN PANEL ── */}
        <div className="login-right">
          <div className="login-box">
            <div className="login-box-logo-wrap">
              <img className="login-box-logo" src={COMPANY_LOGO} alt="Alfa Nutrition Animale" />
            </div>

            <div className="login-header">
              <h2>Login</h2>
              <p>Connectez-vous à votre espace</p>
            </div>

            {notice && (
              <div className="login-success">
                <span>✓</span> {notice}
              </div>
            )}

            {challengeToken && siteCode && (
              <div className="login-site-code" role="status" aria-live="polite">
                <p>Code genere par le site</p>
                <strong>{siteCode}</strong>
              </div>
            )}

            {error && (
              <div className="login-error">
                <span>⚠</span> {error}
              </div>
            )}

            {!challengeToken ? (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="field-group">
                <label htmlFor="email">Adresse e-mail</label>
                <div className="field-wrap">
                  <span className="field-icon">✉</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@nutrisud.tn"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="password">Mot de passe</label>
                <div className="field-wrap">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" className="toggle-pass" onClick={() => setShowPass(v => !v)}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading
                  ? <span className="spinner">⟳ Connexion...</span>
                  : 'Se connecter →'}
              </button>
            </form>
            ) : (
            <form onSubmit={handleVerifyCode} className="login-form">
              <div className="field-group">
                <label htmlFor="code">Code de verification</label>
                <div className="field-wrap">
                  <span className="field-icon">#</span>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="6 chiffres"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className="login-submit" disabled={loading || code.length !== 6}>
                {loading
                  ? <span className="spinner">⟳ Verification...</span>
                  : 'Verifier le code →'}
              </button>

              <button
                type="button"
                className="login-secondary-btn"
                onClick={() => {
                  setChallengeToken('');
                  setCode('');
                  setSiteCode('');
                  setNotice('');
                }}
              >
                Changer email / mot de passe
              </button>
            </form>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}

import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di AuthProvider');
  }
  return context;
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.user.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: 'Credenziali non valide' };
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.user.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: 'Errore durante la registrazione' };
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const Login = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Accedi</h1>
          <p className="text-gray-600">Sistema Gestione Lista Elettorale</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Inserisci la tua email"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Inserisci la password"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Non hai un account? Registrati
          </button>
        </div>
      </div>
    </div>
  );
};

// Register Component
const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'visitor'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Registrati</h1>
          <p className="text-gray-600">Crea il tuo account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Nome Completo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Inserisci il tuo nome"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Inserisci la tua email"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Inserisci la password"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Ruolo</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="visitor">Visitatore (Studente)</option>
              <option value="candidate">Candidato</option>
              <option value="grafico">Grafico</option>
              <option value="admin">Amministratore</option>
            </select>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Hai già un account? Accedi
          </button>
        </div>
      </div>
    </div>
  );
};

// Public Landing Page
const LandingPage = ({ onLogin }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/candidates`);
      const data = await response.json();
      if (data.success) {
        setCandidates(data.candidates);
      }
    } catch (error) {
      console.error('Errore caricamento candidati:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-900">Lista Elettorale Studentesca</h1>
            <button
              onClick={onLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Accedi
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h2 className="text-5xl font-bold mb-6">
                Il Futuro della Nostra Scuola
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Scopri i candidati, i loro programmi e le proposte per migliorare la nostra esperienza scolastica.
                La tua voce conta per costruire insieme una scuola migliore.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Scopri i Candidati
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors">
                  Leggi i Programmi
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1550502424-59ffe92e70ab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwY2FtcGFpZ258ZW58MHx8fGJsdWV8MTc1MjkzMTQ1Nnww&ixlib=rb-4.1.0&q=85"
                alt="Campagna Elettorale"
                className="rounded-lg shadow-2xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Candidates Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">I Nostri Candidati</h2>
            <p className="text-xl text-gray-600">Conosci chi si candida per rappresentarti</p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                    {candidate.photo ? (
                      <img src={candidate.photo} alt={candidate.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white text-6xl">👤</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{candidate.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{candidate.class_year}</p>
                    <p className="text-gray-600 mb-4">{candidate.description}</p>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                      Scopri di più
                    </button>
                  </div>
                </div>
              ))}
              
              {candidates.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-600 text-lg">Nessun candidato ancora registrato</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Caratteristiche della Piattaforma</h2>
            <p className="text-xl text-gray-600">Un sistema completo per la gestione elettorale studentesca</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Programmi AI</h3>
              <p className="text-gray-600">Generazione automatica di programmi elettorali personalizzati con intelligenza artificiale</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Dashboard Completa</h3>
              <p className="text-gray-600">Gestione campagne, materiali elettorali e monitoraggio attività in tempo reale</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Multi-Ruolo</h3>
              <p className="text-gray-600">Sistema di accessi differenziati per visitatori, candidati, grafici e amministratori</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Lista Elettorale Studentesca</h3>
          <p className="text-gray-400 mb-6">Sistema di gestione completo per elezioni scolastiche</p>
          <button
            onClick={onLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Inizia Ora
          </button>
        </div>
      </footer>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchCandidates();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/candidates`);
      const data = await response.json();
      if (data.success) {
        setCandidates(data.candidates);
      }
    } catch (error) {
      console.error('Errore caricamento candidati:', error);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      candidate: 'bg-blue-100 text-blue-800',
      grafico: 'bg-green-100 text-green-800',
      visitor: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.visitor;
  };

  const getRoleName = (role) => {
    const names = {
      admin: 'Amministratore',
      candidate: 'Candidato',
      grafico: 'Grafico',
      visitor: 'Visitatore'
    };
    return names[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-900">Dashboard Elettorale</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                {getRoleName(user.role)}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Benvenuto, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Panoramica
            </button>
            {(user.role === 'candidate' || user.role === 'admin') && (
              <button
                onClick={() => setActiveTab('ai-program')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'ai-program'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🤖 Genera Programma AI
              </button>
            )}
            {(user.role === 'candidate' || user.role === 'admin') && (
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Campagne
              </button>
            )}
            {(user.role === 'candidate' || user.role === 'admin') && (
              <button
                onClick={() => setActiveTab('programs')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'programs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📄 Programmi Elettorali
              </button>
            )}
            <button
              onClick={() => setActiveTab('candidates')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'candidates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Candidati
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} user={user} />}
        {activeTab === 'ai-program' && <AIGeneratorTab user={user} />}
        {activeTab === 'campaigns' && <CampaignsTab user={user} />}
        {activeTab === 'programs' && <ProgramsTab user={user} />}
        {activeTab === 'candidates' && <CandidatesTab candidates={candidates} fetchCandidates={fetchCandidates} user={user} />}
      </main>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, user }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Statistiche Generali</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{stats.total_candidates || 0}</div>
            <div className="text-gray-600">Candidati Totali</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{stats.active_campaigns || 0}</div>
            <div className="text-gray-600">Campagne Attive</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{stats.total_programs || 0}</div>
            <div className="text-gray-600">Programmi Creati</div>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">{stats.total_campaigns || 0}</div>
            <div className="text-gray-600">Campagne Totali</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Le Tue Attività Recenti</h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mr-4">📊</div>
            <div>
              <div className="font-medium">Dashboard Accesso</div>
              <div className="text-sm text-gray-600">Accesso effettuato con successo</div>
            </div>
          </div>
          {user.role === 'candidate' && (
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mr-4">🤖</div>
              <div>
                <div className="font-medium">AI Generatore Disponibile</div>
                <div className="text-sm text-gray-600">Crea il tuo programma elettorale con l'AI</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// AI Generator Tab - THE KILLER FEATURE!
const AIGeneratorTab = ({ user }) => {
  const [formData, setFormData] = useState({
    candidate_name: user.name,
    class_year: '',
    main_issues: [],
    personal_values: [],
    school_context: ''
  });
  const [generatedProgram, setGeneratedProgram] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const commonIssues = [
    'Miglioramento delle strutture scolastiche',
    'Organizzazione eventi e attività',
    'Comunicazione scuola-studenti',
    'Servizi per studenti (mensa, trasporti)',
    'Attività sportive e ricreative',
    'Supporto didattico',
    'Tecnologia e innovazione',
    'Sostenibilità ambientale',
    'Inclusività e diversità'
  ];

  const commonValues = [
    'Trasparenza',
    'Innovazione',
    'Collaborazione',
    'Responsabilità',
    'Inclusione',
    'Creatività',
    'Sostenibilità',
    'Eccellenza',
    'Rispetto'
  ];

  const handleIssueToggle = (issue) => {
    setFormData(prev => ({
      ...prev,
      main_issues: prev.main_issues.includes(issue)
        ? prev.main_issues.filter(i => i !== issue)
        : [...prev.main_issues, issue]
    }));
  };

  const handleValueToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      personal_values: prev.personal_values.includes(value)
        ? prev.personal_values.filter(v => v !== value)
        : [...prev.personal_values, value]
    }));
  };

  const generateProgram = async () => {
    if (!formData.class_year || formData.main_issues.length === 0 || formData.personal_values.length === 0) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-program`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedProgram(data.program.content);
        setStep(3);
      } else {
        alert('Errore nella generazione del programma');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore di connessione');
    }
    setLoading(false);
  };

  if (step === 1) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">🤖 Generatore Programma Elettorale AI</h2>
          <p className="text-lg text-gray-600">Crea un programma elettorale professionale e personalizzato con l'intelligenza artificiale</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Anno Scolastico *</label>
            <input
              type="text"
              value={formData.class_year}
              onChange={(e) => setFormData({...formData, class_year: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="es. 5° Liceo Scientifico"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Contesto Scuola</label>
            <textarea
              value={formData.school_context}
              onChange={(e) => setFormData({...formData, school_context: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Descrivi brevemente la tua scuola, particolarità, necessità specifiche..."
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!formData.class_year}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continua →
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Personalizza il tuo Programma</h2>
          <p className="text-gray-600">Seleziona le tematiche e i valori che ti rappresentano</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Principali Questioni * (seleziona almeno 3)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonIssues.map((issue) => (
                <button
                  key={issue}
                  onClick={() => handleIssueToggle(issue)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    formData.main_issues.includes(issue)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {issue}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">Selezionate: {formData.main_issues.length}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">I Tuoi Valori * (seleziona almeno 3)</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {commonValues.map((value) => (
                <button
                  key={value}
                  onClick={() => handleValueToggle(value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    formData.personal_values.includes(value)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">Selezionati: {formData.personal_values.length}</p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              ← Indietro
            </button>
            <button
              onClick={generateProgram}
              disabled={loading || formData.main_issues.length < 3 || formData.personal_values.length < 3}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generazione in corso...
                </span>
              ) : (
                '🤖 Genera Programma AI'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">✨ Il Tuo Programma Elettorale</h2>
          <p className="text-gray-600">Generato con intelligenza artificiale - personalizza come preferisci</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {generatedProgram}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => {setStep(1); setGeneratedProgram('');}}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Genera Nuovo Programma
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedProgram);
                alert('Programma copiato negli appunti!');
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              📋 Copia Programma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Campaigns Tab Component
const CampaignsTab = ({ user }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft'
  });

  useEffect(() => {
    if (user.role === 'candidate' || user.role === 'admin') {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      let candidateId = user.id;
      if (user.role === 'admin') {
        // For admin, get all campaigns
        const candidatesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/candidates`);
        const candidatesData = await candidatesResponse.json();
        if (candidatesData.success && candidatesData.candidates.length > 0) {
          candidateId = candidatesData.candidates[0].id;
        }
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/campaigns/${candidateId}`);
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Errore caricamento campagne:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let candidateId = user.id;
      if (user.role === 'admin') {
        const candidatesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/candidates`);
        const candidatesData = await candidatesResponse.json();
        if (candidatesData.success && candidatesData.candidates.length > 0) {
          candidateId = candidatesData.candidates[0].id;
        }
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          candidate_id: candidateId,
          events: [],
          materials: []
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setFormData({ title: '', description: '', status: 'draft' });
        fetchCampaigns();
        alert('Campagna creata con successo!');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante la creazione della campagna');
    }
  };

  const updateCampaignStatus = async (campaignId, newStatus) => {
    try {
      // In una implementazione completa, qui ci sarebbe un endpoint PUT
      alert(`Stato campagna aggiornato a: ${newStatus}`);
      fetchCampaigns();
    } catch (error) {
      console.error('Errore aggiornamento campagna:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors.draft;
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Bozza',
      active: 'Attiva',
      completed: 'Completata'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestione Campagne</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            + Nuova Campagna
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessuna Campagna</h3>
            <p className="text-gray-600 mb-4">Crea la tua prima campagna elettorale per iniziare!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Crea Prima Campagna
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{campaign.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                    {getStatusText(campaign.status)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{campaign.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">📅</span>
                    Creata: {new Date(campaign.created_at).toLocaleDateString('it-IT')}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">📊</span>
                    Eventi: {campaign.events?.length || 0} | Materiali: {campaign.materials?.length || 0}
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => updateCampaignStatus(campaign.id, 'active')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Attiva
                    </button>
                  )}
                  {campaign.status === 'active' && (
                    <button
                      onClick={() => updateCampaignStatus(campaign.id, 'completed')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Completa
                    </button>
                  )}
                  <button className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    Modifica
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Activities */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Attività di Campagna</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-3xl mb-3 text-center">📋</div>
            <h4 className="font-semibold text-gray-800 mb-2 text-center">Pianifica Eventi</h4>
            <p className="text-sm text-gray-600 mb-4 text-center">Organizza assemblee, dibattiti e incontri</p>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">📅 Assemblea di Classe</span>
                  <span className="text-xs text-gray-500">25 Gen</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Presentazione programma elettorale</p>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">🗣️ Dibattito Pubblico</span>
                  <span className="text-xs text-gray-500">28 Gen</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Confronto con altri candidati</p>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">🎤 Incontro Studenti</span>
                  <span className="text-xs text-gray-500">30 Gen</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Q&A con gli studenti</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const newEvent = prompt("Nome evento:");
                const date = prompt("Data (es. 2 Feb):");
                if (newEvent && date) {
                  alert(`Evento "${newEvent}" programmato per il ${date}!`);
                }
              }}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              + Aggiungi Evento
            </button>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-3xl mb-3 text-center">🎨</div>
            <h4 className="font-semibold text-gray-800 mb-2 text-center">Materiali Grafici</h4>
            <p className="text-sm text-gray-600 mb-4 text-center">Crea volantini, poster e contenuti social</p>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">📄 Volantini</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Pronto</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Design principale per distribuzione</p>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">🏷️ Poster A3</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">In corso</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Poster per bacheche scolastiche</p>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">📱 Post Social</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Pianificato</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Contenuti per Instagram e WhatsApp</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const materialTypes = ["Volantino", "Poster", "Post Social", "Striscione", "Adesivo"];
                const selectedType = prompt(`Tipo materiale (${materialTypes.join(", ")}):`);
                if (selectedType) {
                  alert(`Richiesta creazione "${selectedType}" inviata al team grafico!`);
                }
              }}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              + Nuovo Materiale
            </button>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-3xl mb-3 text-center">📊</div>
            <h4 className="font-semibold text-gray-800 mb-2 text-center">Monitora Progress</h4>
            <p className="text-sm text-gray-600 mb-4 text-center">Traccia l'avanzamento della campagna</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Completamento Campagna</span>
                  <span className="text-purple-600">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white p-3 rounded">
                  <div className="text-lg font-bold text-purple-600">12</div>
                  <div className="text-xs text-gray-600">Eventi Pianificati</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-lg font-bold text-green-600">8</div>
                  <div className="text-xs text-gray-600">Materiali Creati</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-lg font-bold text-blue-600">245</div>
                  <div className="text-xs text-gray-600">Studenti Raggiunti</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-lg font-bold text-orange-600">18</div>
                  <div className="text-xs text-gray-600">Giorni Rimanenti</div>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                <div className="text-sm font-medium mb-1">🎯 Obiettivo Settimanale</div>
                <div className="text-xs text-gray-600">Raggiungere 50+ studenti con volantinaggio</div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">Progresso: 32/50</div>
                  <div className="text-xs text-green-600">64% ✓</div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const reports = [
                  "📈 Report Settimanale:\n• 32 studenti raggiunti\n• 3 eventi completati\n• 2 materiali distribuiti",
                  "📊 Metriche Campagna:\n• Engagement: +15%\n• Visibilità: Alta\n• Feedback: Molto positivo",
                  "🎯 Prossimi Obiettivi:\n• Completare volantinaggio\n• Organizzare assemblea\n• Preparare dibattito finale"
                ];
                const randomReport = reports[Math.floor(Math.random() * reports.length)];
                alert(randomReport);
              }}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              📈 Vedi Report Dettagliato
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Timeline Campagna Elettorale</h3>
        
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200"></div>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800">Registrazione Candidatura</h4>
                  <span className="text-sm text-gray-500">15 Gen 2024</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Candidatura ufficialmente presentata e accettata</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800">Creazione Programma Elettorale</h4>
                  <span className="text-sm text-gray-500">18 Gen 2024</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Programma generato con AI e personalizzato</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                🔄
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800">Campagna Attiva</h4>
                  <span className="text-sm text-gray-500">20 Gen - 5 Feb</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Fase di campagna elettorale e incontri con studenti</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                📅
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800">Elezioni</h4>
                  <span className="text-sm text-gray-500">6-7 Feb 2024</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Votazioni ufficiali per rappresentanti studenteschi</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                🏆
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800">Risultati e Insediamento</h4>
                  <span className="text-sm text-gray-500">8 Feb 2024</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Pubblicazione risultati e inizio mandato</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Azioni Rapide</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => alert("Funzione di condivisione programma sui social media")}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-2xl mb-2">📱</div>
            <div className="text-sm font-medium">Condividi Programma</div>
          </button>
          
          <button 
            onClick={() => alert("Lista contatti studenti per newsletter campagna")}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-2xl mb-2">📧</div>
            <div className="text-sm font-medium">Invia Newsletter</div>
          </button>
          
          <button 
            onClick={() => alert("Sondaggio feedback tra studenti sulla campagna")}
            className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">Crea Sondaggio</div>
          </button>
          
          <button 
            onClick={() => alert("Sistema di promemoria per eventi importanti")}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-2xl mb-2">⏰</div>
            <div className="text-sm font-medium">Imposta Reminder</div>
          </button>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Crea Nuova Campagna</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Titolo Campagna</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="es. Campagna Elettorale 2024"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Descrivi gli obiettivi e le strategie della campagna..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Stato Iniziale</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Bozza</option>
                  <option value="active">Attiva</option>
                </select>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Crea Campagna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Candidates Tab Component
const CandidatesTab = ({ candidates, fetchCandidates, user }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class_year: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user.id
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setFormData({ name: '', class_year: '', description: '' });
        fetchCandidates();
        alert('Candidato aggiunto con successo!');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'aggiunta del candidato');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Lista Candidati</h2>
          {(user.role === 'admin' || user.role === 'candidate') && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              + Aggiungi Candidato
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{candidate.name}</h3>
              <p className="text-blue-600 font-medium mb-2">{candidate.class_year}</p>
              <p className="text-gray-600 text-sm">{candidate.description}</p>
            </div>
          ))}
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessun candidato</h3>
            <p className="text-gray-600">Aggiungi il primo candidato per iniziare!</p>
          </div>
        )}
      </div>

      {/* Add Candidate Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Aggiungi Nuovo Candidato</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Anno/Classe</label>
                <input
                  type="text"
                  value={formData.class_year}
                  onChange={(e) => setFormData({...formData, class_year: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Aggiungi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Programs Tab Component
const ProgramsTab = ({ user }) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, [user]);

  const fetchPrograms = async () => {
    try {
      let candidateId = user.id;
      if (user.role === 'admin') {
        // For admin, get programs from first candidate
        const candidatesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/candidates`);
        const candidatesData = await candidatesResponse.json();
        if (candidatesData.success && candidatesData.candidates.length > 0) {
          candidateId = candidatesData.candidates[0].id;
        }
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/programs/${candidateId}`);
      const data = await response.json();
      if (data.success) {
        setPrograms(data.programs);
      }
    } catch (error) {
      console.error('Errore caricamento programmi:', error);
    }
    setLoading(false);
  };

  const handleSaveProgram = async (programContent) => {
    try {
      let candidateId = user.id;
      if (user.role === 'admin') {
        const candidatesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/candidates`);
        const candidatesData = await candidatesResponse.json();
        if (candidatesData.success && candidatesData.candidates.length > 0) {
          candidateId = candidatesData.candidates[0].id;
        }
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidateId,
          title: `Programma Elettorale ${new Date().toLocaleDateString('it-IT')}`,
          content: programContent,
          generated_by_ai: true
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchPrograms();
        alert('Programma salvato con successo!');
      }
    } catch (error) {
      console.error('Errore salvataggio programma:', error);
      alert('Errore durante il salvataggio');
    }
  };

  const viewProgram = (program) => {
    setSelectedProgram(program);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">I Tuoi Programmi Elettorali</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Simple program template
                const templateProgram = `PROGRAMMA ELETTORALE

PRESENTAZIONE
Mi chiamo ${user.name} e mi candido per rappresentare tutti gli studenti della nostra scuola.

VISIONE
La mia visione è quella di una scuola più inclusiva, moderna e attenta alle esigenze di ogni studente.

PROPOSTE PRINCIPALI
1. Miglioramento dei servizi scolastici
2. Maggiore partecipazione studentesca
3. Eventi e attività extracurriculari
4. Supporto allo studio e al benessere
5. Comunicazione più efficace

CONCLUSIONE
Insieme possiamo costruire una scuola migliore per tutti. Il vostro voto è il primo passo verso il cambiamento!`;
                
                handleSaveProgram(templateProgram);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Template Base
            </button>
          </div>
        </div>

        {programs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessun Programma Salvato</h3>
            <p className="text-gray-600 mb-6">Crea il tuo primo programma elettorale utilizzando il generatore AI o un template base</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.href = '#ai-program'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🤖 Usa Generatore AI
              </button>
              <button
                onClick={() => {
                  const templateProgram = `PROGRAMMA ELETTORALE - ${user.name}

🎯 PRESENTAZIONE
Mi chiamo ${user.name} e mi candido per rappresentare tutti gli studenti della nostra scuola con passione, dedizione e trasparenza.

🌟 LA MIA VISIONE
Credo in una scuola dove ogni studente si senta ascoltato, valorizzato e parte attiva della comunità scolastica.

📋 PROPOSTE PRINCIPALI

1. 🏫 MIGLIORAMENTO STRUTTURE E SERVIZI
   - Migliorare gli spazi comuni e le aule
   - Potenziare i servizi di mensa e trasporti

2. 🎭 VITA STUDENTESCA ATTIVA
   - Organizzare più eventi culturali e ricreativi
   - Promuovere attività sportive e artistiche

3. 💬 COMUNICAZIONE E PARTECIPAZIONE
   - Creare canali diretti tra studenti e dirigenza
   - Organizzare assemblee mensili tematiche

4. 📚 SUPPORTO DIDATTICO
   - Implementare corsi di recupero e potenziamento
   - Creare spazi di studio collaborativo

5. 🌱 SOSTENIBILITÀ E INNOVAZIONE
   - Promuovere progetti green a scuola
   - Digitalizzare i processi amministrativi

🚀 INSIEME VERSO IL FUTURO
Con la vostra fiducia, lavorerò ogni giorno per realizzare questi obiettivi e costruire insieme una scuola migliore.

Il vostro voto è il primo passo verso il cambiamento che tutti desideriamo!`;
                  
                  handleSaveProgram(templateProgram);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                📄 Crea Template
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((program) => (
              <div key={program.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{program.title}</h3>
                  {program.generated_by_ai && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      🤖 AI Generated
                    </span>
                  )}
                </div>
                
                <div className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {program.content.substring(0, 150)}...
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>📅 Creato: {new Date(program.created_at).toLocaleDateString('it-IT')}</span>
                  <span>📄 {program.content.split(' ').length} parole</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewProgram(program)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    👁️ Visualizza
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(program.content);
                      alert('Programma copiato negli appunti!');
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    📋 Copia
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([program.content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${program.title}.txt`;
                      a.click();
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    💾 Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Program Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Statistiche Programmi</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{programs.length}</div>
            <div className="text-gray-600">Programmi Totali</div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600">
              {programs.filter(p => p.generated_by_ai).length}
            </div>
            <div className="text-gray-600">Generati con AI</div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">
              {programs.reduce((total, p) => total + p.content.split(' ').length, 0)}
            </div>
            <div className="text-gray-600">Parole Totali</div>
          </div>
        </div>
      </div>

      {/* Program View Modal */}
      {showModal && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[80vh] w-full overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">{selectedProgram.title}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="ai-generated-content">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {selectedProgram.content}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                📅 Creato: {new Date(selectedProgram.created_at).toLocaleString('it-IT')}
                {selectedProgram.generated_by_ai && <span className="ml-4">🤖 Generato con AI</span>}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedProgram.content);
                    alert('Programma copiato negli appunti!');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  📋 Copia
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  return (
    <AuthProvider>
      <AppContent 
        showLogin={showLogin} 
        setShowLogin={setShowLogin}
        isRegister={isRegister}
        setIsRegister={setIsRegister}
      />
    </AuthProvider>
  );
}

const AppContent = ({ showLogin, setShowLogin, isRegister, setIsRegister }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  if (showLogin) {
    if (isRegister) {
      return (
        <Register
          onSwitchToLogin={() => setIsRegister(false)}
        />
      );
    } else {
      return (
        <Login
          onSwitchToRegister={() => setIsRegister(true)}
        />
      );
    }
  }

  return (
    <LandingPage
      onLogin={() => setShowLogin(true)}
    />
  );
};

export default App;
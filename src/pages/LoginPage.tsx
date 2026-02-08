import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-theme-bg-alt text-theme-text flex flex-col">
      {/* Header */}
      <header className="px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <span className="text-lg font-bold tracking-wide">VoiceCode</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column - Animation & Text */}
          <div className="flex flex-col items-center justify-center">
            {/* Sound Wave Animation */}
            <div className="flex items-center justify-center gap-[6px] h-[100px] mb-5">
              {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
                <div
                  key={i}
                  className="w-2 rounded-[10px]"
                  style={{
                    background: 'linear-gradient(to top, var(--color-accent-purple), var(--color-accent-purple-deep))',
                    animation: 'loginWave 1s ease-in-out infinite',
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>

            {/* Headline */}
            <div className="text-center font-mono">
              <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                KODLAMA HIZI:
              </h1>
              <h1
                className="text-5xl font-extrabold tracking-tight leading-tight"
                style={{
                  color: 'var(--color-accent-purple)',
                  textShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
                }}
              >
                SES HIZINDA
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-center text-gray-500 text-base mt-4 max-w-[400px]">
              Dünyanın ilk sese duyarlı IDE'si.<br />
              Klavyesiz. Temassız. Sınırsız.
            </p>
          </div>

          {/* Right Column - Login Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-theme-surface p-10 rounded-[20px] border border-theme-border-alt shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <h3 className="text-xl font-semibold mb-6">Oturum Başlat</h3>

              {/* Tabs */}
              <div className="flex border-b border-theme-border-alt mb-6">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                    activeTab === 'login'
                      ? 'text-purple-primary border-b-2 border-purple-primary'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                    activeTab === 'register'
                      ? 'text-purple-primary border-b-2 border-purple-primary'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Kayıt Ol
                </button>
              </div>

              {/* Login Tab */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Geliştirici ID</label>
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="user@voicecode.ai"
                      className="w-full bg-theme-bg-alt border border-theme-border-alt rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-primary/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Erişim Anahtarı</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full bg-theme-bg-alt border border-theme-border-alt rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-primary/60 transition-colors"
                    />
                  </div>

                  {loginSuccess && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-2 text-sm">
                      Giriş Başarılı!
                    </div>
                  )}

                  <div className="pt-2 grid grid-cols-2 gap-3">
                    <button
                      type="submit"
                      className="py-3 rounded-lg font-medium text-white transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(90deg, var(--color-accent-purple), var(--color-accent-purple-dark))',
                      }}
                    >
                      Giriş Yap
                    </button>
                    <button
                      type="button"
                      className="py-3 rounded-lg font-medium text-white bg-theme-border border border-theme-border-alt hover:border-purple-primary/40 transition-all"
                    >
                      🎤 Voice ID
                    </button>
                  </div>
                </form>
              )}

              {/* Register Tab */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Yeni Kullanıcı Adı</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full bg-theme-bg-alt border border-theme-border-alt rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-primary/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">E-Posta Adresi</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-theme-bg-alt border border-theme-border-alt rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-primary/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Yeni Şifre</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-theme-bg-alt border border-theme-border-alt rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-primary/60 transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg font-medium text-white transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(90deg, var(--color-accent-purple), var(--color-accent-purple-dark))',
                      }}
                    >
                      Hesap Oluştur
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 flex items-center justify-between text-xs text-gray-600 uppercase tracking-wider">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            API DURUMU: AKTİF
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            GECİKME: 24MS
          </div>
        </div>
        <div>© 2026 VOICECODE INC. | V0.0.1-ALPHA</div>
      </footer>
    </div>
  );
}

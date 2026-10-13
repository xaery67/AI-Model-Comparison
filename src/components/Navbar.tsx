import React from 'react';
import { UserProfile, loginWithGoogle, loginAsGuestDemo, logoutUser } from '../firebase';
import { Shield, Sparkles, Terminal, LogIn, LogOut, FileText, BarChart3, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: 'explorer' | 'evals' | 'admin' | 'prd';
  setActiveTab: (tab: 'explorer' | 'evals' | 'admin' | 'prd') => void;
  user: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onUserChange,
}) => {
  const [isAuthLoading, setIsAuthLoading] = React.useState(false);
  const [showDemoMenu, setShowDemoMenu] = React.useState(false);

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    try {
      const profile = await loginWithGoogle();
      if (profile) onUserChange(profile);
    } catch (err) {
      console.warn('Google login failed or popup closed, offering demo mode:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGuestLogin = async (role: 'member' | 'admin') => {
    setIsAuthLoading(true);
    setShowDemoMenu(false);
    try {
      const profile = await loginAsGuestDemo(role);
      onUserChange(profile);
    } catch (err) {
      console.error('Guest login failed:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    onUserChange(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F1] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 md:gap-8">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('explorer')}
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-black flex items-center gap-2 cursor-pointer hover:opacity-90"
            >
              <span className="bg-[#FFE600] px-2 py-0.5 border-2 border-black font-mono shadow-[2px_2px_0px_#000]">
                BENCH
              </span>
              <span>PULSE</span>
            </button>
            <span className="hidden lg:inline-block font-mono text-[11px] uppercase bg-black text-[#FFE600] px-2 py-0.5 border border-black font-semibold">
              BenchLM API
            </span>
          </div>

          {/* Zone 2: Concise single-line navigation tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'explorer'
                  ? 'bg-[#FFE600] shadow-[2px_2px_0px_#000] -translate-y-0.5'
                  : 'bg-white hover:bg-neutral-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                <span>Leaderboard</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('evals')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'evals'
                  ? 'bg-[#00F0FF] shadow-[2px_2px_0px_#000] -translate-y-0.5'
                  : 'bg-white hover:bg-neutral-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>My Eval Lab</span>
                {user && (
                  <span className="font-mono text-[10px] bg-black text-white px-1 ml-0.5">
                    CRUD
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-[#FF4343] text-white shadow-[2px_2px_0px_#000] -translate-y-0.5'
                  : 'bg-white hover:bg-neutral-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Admin</span>
                {user?.role === 'admin' && (
                  <span className="font-mono text-[10px] bg-white text-black px-1 ml-0.5">
                    PRO
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('prd')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'prd'
                  ? 'bg-[#B575FF] text-white shadow-[2px_2px_0px_#000] -translate-y-0.5'
                  : 'bg-white hover:bg-neutral-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>PRD Spec</span>
              </span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action / Account area */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-xs font-bold truncate max-w-[120px]">{user.displayName}</span>
                  <span className={`text-[10px] font-mono uppercase px-1 border border-black ${
                    user.role === 'admin' ? 'bg-[#FF4343] text-white' : 'bg-[#70FF00] text-black'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="brutal-btn p-1.5 bg-white text-black hover:bg-neutral-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isAuthLoading}
                    className="brutal-btn px-3 py-1.5 bg-[#FFE600] text-black text-xs font-extrabold uppercase flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => setShowDemoMenu(!showDemoMenu)}
                    className="brutal-btn px-2 py-1.5 bg-white text-xs font-bold"
                    title="Demo Account Options"
                  >
                    ▾
                  </button>
                </div>

                {/* Dropdown for quick testing in sandbox */}
                {showDemoMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black shadow-[4px_4px_0px_#000] z-50 p-2">
                    <p className="text-[11px] font-mono text-neutral-600 mb-2 font-semibold">
                      QUICK DEMO SESSION:
                    </p>
                    <button
                      onClick={() => handleGuestLogin('member')}
                      className="w-full text-left px-2 py-1.5 text-xs font-bold hover:bg-[#00F0FF] border border-black mb-1.5 cursor-pointer"
                    >
                      👤 Login as Standard User
                    </button>
                    <button
                      onClick={() => handleGuestLogin('admin')}
                      className="w-full text-left px-2 py-1.5 text-xs font-bold hover:bg-[#FF4343] hover:text-white border border-black cursor-pointer"
                    >
                      🛡️ Login as Admin (adifery80)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

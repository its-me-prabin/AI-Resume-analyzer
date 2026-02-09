import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Analyzer from "./pages/Analyzer.jsx";
import Feedback from "./pages/Feedback.jsx";
import { getUser, signIn, initPuter } from "./services/puter.js";
import { clearAnalyses, loadAnalyses, saveAnalyses } from "./services/storage.js";
import Button from "./components/Button.jsx";
import LoadingState from "./components/LoadingState.jsx";
import FeedbackBanner from "./components/FeedbackBanner.jsx";

const App = () => {
  const [user, setUser] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [storageReady, setStorageReady] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initPuter();
        setPuterReady(true);
        
        const currentUser = await getUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await loadAnalyses();
        setAnalyses(saved);
      } catch (err) {
        setError("Failed to load saved analyses");
      } finally {
        setStorageReady(true);
      }
    };
    loadData();
  }, []);

  const handleSignIn = async () => {
    try {
      await signIn();
      const currentUser = await getUser();
      setUser(currentUser);
    } catch (err) {
      setError("Failed to sign in to Puter");
    }
  };

  const handleSave = async (analysis) => {
    setAnalyses((prev) => {
      const updated = [analysis, ...prev].slice(0, 50);
      saveAnalyses(updated);
      return updated;
    });
  };

  const handleWipe = async () => {
    if (!confirm("Are you sure you want to delete all analyses? This cannot be undone.")) {
      return;
    }
    setAnalyses([]);
    await clearAnalyses();
  };

  const contextValue = useMemo(
    () => ({ user, analyses, storageReady, onSave: handleSave, onWipe: handleWipe }),
    [user, analyses, storageReady]
  );

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/analyzer", label: "Analyzer" },
    { path: "/feedback", label: "Feedback" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 016 12zm2.25 4.5a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white hidden sm:block">
              AI Resume Analyzer
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-3 text-sm">
            {loadingUser ? (
              <span className="text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                Checking auth...
              </span>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 text-xs font-medium">
                  ● Connected
                </span>
                <span className="text-slate-300 hidden sm:block">
                  {user.username || user.email || "Signed in"}
                </span>
              </div>
            ) : (
              <Button onClick={handleSignIn} size="small">
                Connect Puter
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile nav */}
        <nav className="md:hidden border-t border-slate-800 px-6 py-2 overflow-x-auto">
          <div className="flex gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  location.pathname === link.path
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {error && (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <FeedbackBanner
            tone="error"
            title="Error"
            description={error}
          />
        </div>
      )}

      {!puterReady && (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <LoadingState message="Initializing Puter.js..." />
        </div>
      )}

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">
        <Routes>
          <Route path="/" element={<Home context={contextValue} />} />
          <Route path="/analyzer" element={<Analyzer context={contextValue} />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950/50">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Built with React 18 + Vite + Tailwind CSS + Puter.js
            </p>
            <div className="flex items-center gap-4">
              <Link to="/feedback" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                Send Feedback
              </Link>
              <a 
                href="https://puter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
              >
                Powered by Puter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

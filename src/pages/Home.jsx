import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import FeedbackBanner from "../components/FeedbackBanner.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { listStoredAnalyses, deleteStoredAnalysis } from "../services/puter.js";
import { removeAnalysis } from "../services/storage.js";

const Home = ({ context }) => {
  const { user, analyses: localAnalyses, storageReady, onWipe } = context;
  const [puterAnalyses, setPuterAnalyses] = useState([]);
  const [loadingPuter, setLoadingPuter] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const loadPuterAnalyses = async () => {
      if (!user) return;
      setLoadingPuter(true);
      setError("");
      try {
        const analyses = await listStoredAnalyses();
        setPuterAnalyses(analyses);
      } catch (err) {
        setError("Failed to load analyses from Puter storage.");
      } finally {
        setLoadingPuter(false);
      }
    };
    loadPuterAnalyses();
  }, [user]);

  const handleDelete = async (analysis) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;
    
    setDeletingId(analysis.id);
    try {
      if (analysis.storagePath) {
        await deleteStoredAnalysis(analysis.storagePath);
      }
      await removeAnalysis(analysis.id);
      setPuterAnalyses(prev => prev.filter(a => a.id !== analysis.id));
    } catch (err) {
      setError("Failed to delete analysis.");
    } finally {
      setDeletingId(null);
    }
  };

  const displayAnalyses = user && puterAnalyses.length > 0 
    ? puterAnalyses 
    : localAnalyses;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-500/20 border-emerald-500/30";
    if (score >= 60) return "bg-amber-500/20 border-amber-500/30";
    return "bg-rose-500/20 border-rose-500/30";
  };

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">
            AI Resume Analyzer
          </p>
          <h1 className="text-4xl font-semibold text-white lg:text-5xl leading-tight">
            Upload a resume, let AI generate hiring insights, and store everything in Puter.
          </h1>
          <p className="text-slate-300 text-lg">
            Convert PDFs into images, extract text, send them to Puter AI with a comprehensive ATS analysis prompt, 
            and keep every analysis synced with Puter storage. Compare resumes against job descriptions and 
            get actionable feedback.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/analyzer">
              <Button>Start analyzing</Button>
            </Link>
            {displayAnalyses.length > 0 && (
              <Button variant="danger" onClick={onWipe}>
                Wipe all data
              </Button>
            )}
          </div>
        </div>
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-white">What this app covers</h2>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Puter authentication, storage, and AI chat integration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>PDF-to-image conversion powered by pdfjs-dist</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Resume text extraction from PDFs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Comprehensive ATS analysis with job description matching</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>JSON-only AI response parsing with strict schema validation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Real Puter storage for analysis history and file persistence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Loading states, error handling, and feedback components</span>
            </li>
          </ul>
        </Card>
      </section>

      {!storageReady || loadingPuter ? (
        <FeedbackBanner
          title="Loading saved reports"
          description="Syncing with storage before showing recent analyses."
        />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : displayAnalyses.length === 0 ? (
        <FeedbackBanner
          tone="info"
          title="No analyses yet"
          description="Upload a resume and job description to generate your first AI report."
        />
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent analyses</h2>
            {user && (
              <span className="text-sm text-slate-400">
                {puterAnalyses.length > 0 ? "From Puter storage" : "Local storage"}
              </span>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {displayAnalyses.slice(0, 6).map((analysis) => (
              <Card key={analysis.id} className="space-y-4 relative group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate" title={analysis.name}>
                      {analysis.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(analysis.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {analysis.result?.atsScore !== undefined && (
                    <div className={`flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg border ${getScoreBg(analysis.result.atsScore)}`}>
                      <span className={`text-lg font-bold ${getScoreColor(analysis.result.atsScore)}`}>
                        {analysis.result.atsScore}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">/100</span>
                    </div>
                  )}
                </div>
                
                {analysis.result?.summary && (
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {analysis.result.summary}
                  </p>
                )}
                
                {analysis.result?.matchPercentage !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Job match:</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${analysis.result.matchPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-indigo-400">
                      {analysis.result.matchPercentage}%
                    </span>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Link to={`/analyzer?id=${analysis.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full py-2 text-xs">
                      View details
                    </Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    className="px-3 py-2 text-xs"
                    onClick={() => handleDelete(analysis)}
                    disabled={deletingId === analysis.id}
                  >
                    {deletingId === analysis.id ? "..." : "Delete"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

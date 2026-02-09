import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import ErrorState from "../components/ErrorState.jsx";
import FeedbackBanner from "../components/FeedbackBanner.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { analyzeResume, saveResumeAssets } from "../services/puter.js";
import { pdfToImages, extractPdfText, formatFileSize } from "../utils/pdf.js";
import { loadAnalyses } from "../services/storage.js";

const Analyzer = ({ context }) => {
  const { onSave, user } = context;
  const [searchParams] = useSearchParams();
  
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [images, setImages] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedImage, setSelectedImage] = useState(null);

  // Load existing analysis if ID is provided
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const loadExisting = async () => {
        const analyses = await loadAnalyses();
        const existing = analyses.find(a => a.id === id);
        if (existing) {
          setAnalysis(existing);
          if (existing.jobDescription) {
            setJobDescription(existing.jobDescription);
          }
        }
      };
      loadExisting();
    }
  }, [searchParams]);

  const handleFileChange = async (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    
    setError("");
    setLoading(true);
    setLoadingStage("Converting PDF to images...");
    setAnalysis(null);
    setFile(selected);
    setImages([]);
    setResumeText("");
    
    try {
      // Convert PDF to images
      const converted = await pdfToImages(selected);
      setImages(converted);
      
      // Extract text from PDF
      setLoadingStage("Extracting resume text...");
      const text = await extractPdfText(selected);
      setResumeText(text);
      
      setLoadingStage("");
      setActiveTab("preview");
    } catch (err) {
      setError("Failed to process PDF. Please upload a valid resume file.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !resumeText) return;
    
    setLoading(true);
    setLoadingStage("Analyzing with AI...");
    setError("");
    
    try {
      const result = await analyzeResume({ 
        resumeText, 
        jobDescription,
        images: images.slice(0, 2) // Send first 2 images for context
      });
      
      const analysisPayload = {
        id: crypto.randomUUID(),
        name: file.name,
        createdAt: new Date().toISOString(),
        jobDescription,
        result
      };
      
      setAnalysis(analysisPayload);
      
      // Save to storage
      setSaving(true);
      setLoadingStage("Saving to storage...");
      
      try {
        const assetInfo = await saveResumeAssets({
          name: file.name.replace(/\.[^/.]+$/, ""),
          images,
          metadata: analysisPayload,
          resumeFile: file
        });
        
        const storedPayload = { ...analysisPayload, assets: assetInfo };
        await onSave(storedPayload);
      } catch (saveErr) {
        // Still save to local storage even if Puter storage fails
        await onSave(analysisPayload);
      }
      
      setSaving(false);
      setLoadingStage("");
    } catch (err) {
      setError(err?.message || "AI analysis failed. Please try again.");
    } finally {
      setLoading(false);
      setSaving(false);
      setLoadingStage("");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-500/20";
    if (score >= 60) return "bg-amber-500/20";
    return "bg-rose-500/20";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Analyze a resume</h1>
          <p className="text-sm text-slate-400">
            Upload a PDF, add a job description, and get comprehensive ATS insights.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Resume PDF</h2>
            <p className="text-sm text-slate-400">
              PDF pages are converted to images and text is extracted for AI analysis.
            </p>
          </div>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-400 file:transition-colors"
          />
        </div>
        
        {file && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-400">
                <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
                <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(file.size)} • {images.length} page{images.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
        
        {loading && (
          <LoadingState message={loadingStage || "Processing resume..."} />
        )}
        
        <ErrorState message={error} onRetry={() => file && handleFileChange({ target: { files: [file] } })} />
        
        {!file && !loading && (
          <FeedbackBanner
            title="Upload a PDF"
            description="Select a resume PDF to start building the analysis."
          />
        )}
      </Card>

      {/* Job Description Section */}
      {file && (
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Job Description</h2>
            <p className="text-sm text-slate-400">
              Paste the job description to compare against the resume for better matching analysis.
            </p>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here... (optional but recommended for better analysis)"
            className="w-full h-32 p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAnalyze} 
              disabled={loading || saving || !resumeText}
            >
              {saving ? "Saving..." : "Generate AI Report"}
            </Button>
          </div>
        </Card>
      )}

      {/* Preview Section */}
      {images.length > 0 && !analysis && (
        <section className="space-y-4">
          <div className="flex items-center gap-4 border-b border-slate-800">
            <button
              onClick={() => setActiveTab("preview")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "preview" 
                  ? "text-indigo-400 border-b-2 border-indigo-400" 
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              PDF Preview
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "text" 
                  ? "text-indigo-400 border-b-2 border-indigo-400" 
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Extracted Text
            </button>
          </div>
          
          {activeTab === "preview" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {images.map((image, index) => (
                <Card 
                  key={index} 
                  className="p-4 cursor-pointer hover:border-indigo-500/50 transition-colors"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative">
                    <img
                      src={image}
                      alt={`Resume page ${index + 1}`}
                      className="w-full rounded-xl border border-slate-800"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-slate-950/80 rounded text-xs text-slate-300">
                      Page {index + 1}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono max-h-96 overflow-y-auto">
                {resumeText || "No text extracted yet..."}
              </pre>
            </Card>
          )}
        </section>
      )}

      {/* Analysis Results */}
      {analysis && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">AI Analysis Report</h2>
            <span className="text-xs text-slate-500">
              {new Date(analysis.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Score Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="text-center space-y-2">
              <p className="text-sm text-slate-400">ATS Score</p>
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBg(analysis.result.atsScore)}`}>
                <span className={`text-4xl font-bold ${getScoreColor(analysis.result.atsScore)}`}>
                  {analysis.result.atsScore}
                </span>
              </div>
              <p className="text-xs text-slate-500">out of 100</p>
            </Card>
            <Card className="text-center space-y-2">
              <p className="text-sm text-slate-400">Job Match</p>
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBg(analysis.result.matchPercentage)}`}>
                <span className={`text-4xl font-bold ${getScoreColor(analysis.result.matchPercentage)}`}>
                  {analysis.result.matchPercentage}
                </span>
              </div>
              <p className="text-xs text-slate-500">percentage</p>
            </Card>
          </div>

          {/* Summary */}
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-400">Summary</h3>
            <p className="text-slate-200 leading-relaxed">{analysis.result.summary}</p>
          </Card>

          {/* Section Scores */}
          {analysis.result.sectionScores && (
            <Card className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-400">Section Scores</h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
                {Object.entries(analysis.result.sectionScores).map(([section, score]) => (
                  <div key={section} className="text-center space-y-2">
                    <div className="text-xs text-slate-400 capitalize">{section.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className={`text-sm font-semibold ${getScoreColor(score)}`}>{score}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Skills Match */}
          {analysis.result.skillsMatch && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-400">Matched Skills</h3>
                {analysis.result.skillsMatch.matched?.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.result.skillsMatch.matched.map((skill, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="text-emerald-400">✓</span> {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No skills matched</p>
                )}
              </Card>
              <Card className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-rose-400">Missing Skills</h3>
                {analysis.result.skillsMatch.missing?.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.result.skillsMatch.missing.map((skill, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="text-rose-400">✗</span> {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No missing skills</p>
                )}
              </Card>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-400">Strengths</h3>
              <ul className="space-y-2">
                {analysis.result.strengths?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 mt-0.5">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-rose-400">Weaknesses</h3>
              <ul className="space-y-2">
                {analysis.result.weaknesses?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-rose-400 mt-0.5">−</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Missing Keywords */}
          {analysis.result.missingKeywords?.length > 0 && (
            <Card className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-400">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.result.missingKeywords.map((keyword, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300">
                    {keyword}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Formatting Issues */}
          {analysis.result.formattingIssues?.length > 0 && (
            <Card className="space-y-3 border-amber-500/30">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-400">Formatting Issues</h3>
              <ul className="space-y-2">
                {analysis.result.formattingIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-amber-400 mt-0.5">⚠</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-400">Recommendations</h3>
            <ul className="space-y-3">
              {analysis.result.recommendations?.map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-medium text-indigo-400">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Experience Relevance */}
          {analysis.result.experienceRelevance && (
            <Card className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-400">Experience Relevance</h3>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  analysis.result.experienceRelevance === "High" 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : analysis.result.experienceRelevance === "Medium"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}>
                  {analysis.result.experienceRelevance}
                </span>
                <span className="text-sm text-slate-400">
                  Based on alignment with job requirements
                </span>
              </div>
            </Card>
          )}

          {/* Save Confirmation */}
          <FeedbackBanner
            tone="success"
            title="Analysis saved"
            description="Your resume analysis has been saved to storage."
          />
        </section>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={selectedImage} 
              alt="Resume page" 
              className="max-w-full max-h-[90vh] rounded-xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyzer;

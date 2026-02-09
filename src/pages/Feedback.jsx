import { useState } from "react";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import FeedbackBanner from "../components/FeedbackBanner.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { getPuter } from "../services/puter.js";

const Feedback = () => {
  const [formData, setFormData] = useState({
    type: "general",
    rating: 0,
    message: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const feedbackTypes = [
    { value: "general", label: "General Feedback", icon: "💬" },
    { value: "bug", label: "Bug Report", icon: "🐛" },
    { value: "feature", label: "Feature Request", icon: "✨" },
    { value: "improvement", label: "Improvement", icon: "📈" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const puter = getPuter();
      
      // Try to save feedback to Puter storage if available
      if (puter?.fs) {
        const feedbackData = {
          ...formData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        };
        
        const feedbackPath = `/AI-Resume-Analyzer/feedback/${Date.now()}.json`;
        await puter.fs.writeFile(feedbackPath, JSON.stringify(feedbackData, null, 2));
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <FeedbackBanner
          tone="success"
          title="Thank you for your feedback!"
          description="We appreciate your input and will use it to improve the AI Resume Analyzer."
        />
        <Card className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-emerald-400">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Feedback Submitted</h2>
          <p className="text-slate-400">
            Your feedback has been received. If you provided an email, we may reach out for more details.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="secondary">
            Submit another response
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-white">Send Feedback</h1>
        <p className="text-slate-400">
          Help us improve the AI Resume Analyzer by sharing your thoughts and suggestions.
        </p>
      </div>

      <ErrorState message={error} onRetry={() => setError("")} />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">What type of feedback do you have?</label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.type === type.value
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{type.icon}</span>
                  <span className={`text-sm font-medium ${
                    formData.type === type.value ? "text-indigo-300" : "text-slate-300"
                  }`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">How would you rate your experience?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    formData.rating >= star
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-slate-800 text-slate-600 hover:text-slate-400"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              {formData.rating === 1 && "Poor - Needs significant improvement"}
              {formData.rating === 2 && "Fair - Could be better"}
              {formData.rating === 3 && "Good - Met expectations"}
              {formData.rating === 4 && "Very Good - Exceeded expectations"}
              {formData.rating === 5 && "Excellent - Outstanding experience"}
            </p>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Your feedback</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us what you think..."
              required
              rows={5}
              className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">
              Email (optional)
              <span className="text-slate-500 font-normal ml-1">- for follow-up questions</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
              className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            {loading ? (
              <LoadingState message="Submitting feedback..." />
            ) : (
              <Button type="submit" disabled={!formData.message.trim()} className="w-full">
                Submit Feedback
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
        <div className="space-y-3">
          <Card className="space-y-2">
            <h3 className="font-medium text-slate-200">How does the AI analysis work?</h3>
            <p className="text-sm text-slate-400">
              The app extracts text from your PDF resume and sends it to Puter AI along with the job description. 
              The AI analyzes the content against ATS (Applicant Tracking System) criteria and provides a detailed report.
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="font-medium text-slate-200">Is my data secure?</h3>
            <p className="text-sm text-slate-400">
              Your resume data is stored in your Puter account. We don't store any data on our servers. 
              You can delete all your analyses at any time from the home page.
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="font-medium text-slate-200">What file formats are supported?</h3>
            <p className="text-sm text-slate-400">
              Currently, only PDF files are supported for resume analysis. Make sure your PDF is text-searchable 
              for best results (not just scanned images).
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Feedback;

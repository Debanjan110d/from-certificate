'use client';

import React, { useState } from 'react';
import { Mail, Search, Download, ExternalLink, Award, Calendar, CheckCircle2, AlertCircle, FileText, Lock, Sparkles } from 'lucide-react';

interface StudentPortalProps {
  onOpenAdminLogin: () => void;
}

export default function StudentPortal({ onOpenAdminLogin }: StudentPortalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setPreviewPdfUrl(null);

    try {
      const res = await fetch('/api/claim-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Certificate not found');
      }

      setResult(data);
      if (data.certificates && data.certificates.length > 0) {
        setPreviewPdfUrl(data.certificates[0].downloadUrl);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 flex flex-col justify-between pb-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Official Student Portal
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">Student Certificate Retrieval</h1>
            </div>
          </div>

          <button
            onClick={onOpenAdminLogin}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 rounded-xl text-xs font-semibold transition-all shadow-md"
          >
            <Lock className="w-3.5 h-3.5" /> Admin Portal
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 relative z-10 w-full flex-1 space-y-10">
        {/* Title & Introduction */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" /> Instant Verified Certificate Access
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Claim Your Official PDF Certificate
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Enter the email address you used when submitting the Google Form to retrieve, preview, and download your official certificate.
          </p>
        </div>

        {/* Email Lookup Card */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Registered Student Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="e.g. debanjan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-32 py-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono tracking-wide"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    'Searching...'
                  ) : (
                    <>
                      <Search className="w-4 h-4" /> Find Certificate
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-xs leading-relaxed">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Certificate Not Found</p>
                <p className="mt-1 text-rose-200">{error}</p>
              </div>
            </div>
          )}

          {/* Success Results Card */}
          {result && result.success && (
            <div className="pt-4 border-t border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Verified Submission
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">{result.studentName}</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-400">Found {result.count} Certificate(s)</p>
              </div>

              {/* List of Student Certificates */}
              <div className="space-y-4">
                {result.certificates.map((cert: any) => (
                  <div
                    key={cert.id}
                    className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {cert.id}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" /> {cert.issueDate}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">{cert.course}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={cert.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </a>
                      <a
                        href={cert.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
                        title="Verify Certificate"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* PDF Preview Frame */}
              {previewPdfUrl && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <FileText className="w-4 h-4 text-amber-400" /> Certificate Document Preview
                    </span>
                    <span className="font-mono">Format: PDF</span>
                  </div>
                  <div className="w-full h-[450px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                    <iframe src={previewPdfUrl} className="w-full h-full border-none" title="Certificate PDF" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 pt-8">
        Automated Student Certificate Platform &bull; Connected to Google Forms & Sheets
      </footer>
    </div>
  );
}

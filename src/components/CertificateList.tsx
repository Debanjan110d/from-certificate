'use client';

import React, { useState, useEffect } from 'react';
import { Search, Download, ExternalLink, RefreshCw, Award, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CertificateRecord } from '@/lib/types';

export default function CertificateList() {
  const [certs, setCerts] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clearing, setClearing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clearSuccess, setClearSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/certificates');
      const data = await res.json();
      if (data.success && Array.isArray(data.certificates)) {
        setCerts(data.certificates);
      }
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    setClearing(true);
    setClearSuccess(null);
    try {
      const res = await fetch('/api/admin/clear-database', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setCerts([]);
        setShowConfirmModal(false);
        setClearSuccess('Database successfully reset to a clean slate! All test records cleared.');
        setTimeout(() => setClearSuccess(null), 5000);
      } else {
        alert(data.error || 'Failed to clear database');
      }
    } catch (err) {
      console.error('Error clearing database:', err);
      alert('Failed to clear database');
    } finally {
      setClearing(false);
    }
  };

  const filteredCerts = certs.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Top Header & Reset Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Issued Certificates Database
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {certs.length} certificates issued and recorded in system database.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Name, Email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={fetchCerts}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={certs.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
            title="Clear all test records to give a clean slate"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All (Clean Slate)
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {clearSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{clearSuccess}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Clear All Certificate Records?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will permanently delete all <strong className="text-white">{certs.length} test certificate records</strong> from your database to give your friend a completely clean slate for real student issuing.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearDatabase}
                disabled={clearing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {clearing ? 'Clearing Database...' : 'Yes, Delete All Records'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" /> Loading Certificates...
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="py-12 text-center text-slate-500 space-y-2">
          <Award className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-slate-400">Clean Slate — No Certificates Issued Yet</p>
          <p className="text-xs">
            Submit a test form or connect your Google Form webhook to issue new student certificates.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{cert.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-100">{cert.name}</td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{cert.email}</td>
                  <td className="py-3 px-4 text-slate-300">{cert.course}</td>
                  <td className="py-3 px-4 text-slate-400">{cert.issueDate}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <a
                      href={`/api/download/${cert.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </a>
                    <a
                      href={`/verify/${cert.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      title="Verify"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Verify
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
